using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SmartCare.API;
using SmartCare.API.Interfaces;
using SmartCare.API.Middleware;
using SmartCare.API.Repositories;
using SmartCare.API.Services;
using Swashbuckle.AspNetCore.SwaggerGen;

var builder = WebApplication.CreateBuilder(args);

// --- CORS ---
// AllowedOrigins is read from config so it can be overridden per environment
// without a code change. The frontend dev server and production domain both
// need to be listed; credentials (cookies) are not used — JWT in header only.
var allowedOrigins = builder.Configuration
    .GetSection("CorsSettings:AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        if (allowedOrigins.Length > 0)
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        else
            // Development fallback when config is absent — dev server defaults
            policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
    });
});

// --- Repositories (Singletons: one instance shared for the app's lifetime) ---
builder.Services.AddSingleton<IDoctorRepository, DoctorRepository>();
builder.Services.AddSingleton<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddSingleton<IConsultationTypeRepository, ConsultationTypeRepository>();
builder.Services.AddSingleton<IUserRepository, UserRepository>();
builder.Services.AddSingleton<ITestimonialRepository, TestimonialRepository>();
builder.Services.AddSingleton<IEmailService, EmailService>();

// --- JWT Authentication ---
// This wires the middleware that validates every incoming Bearer token.
// Without this, [Authorize] attributes do nothing — tokens are generated but never checked.
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secret = jwtSettings["Secret"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
        };
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"))
    .AddPolicy("AdminOrDoctor", policy => policy.RequireRole("Admin", "Doctor"));

// --- Controllers ---
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
                );
            return new BadRequestObjectResult(new { error = "Validation failed", fields = errors });
        };
    });

// --- Swagger with JWT support ---
// AddSecurityDefinition adds the "Authorize" button to Swagger UI.
// The BearerSecurityFilter document filter adds the global security requirement
// so every endpoint sends the token automatically once you've clicked Authorize.
builder.Services.AddHealthChecks();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token. Example: eyJhbGci..."
    });

    options.DocumentFilter<BearerSecurityDocumentFilter>();
});

var app = builder.Build();

// --- Middleware pipeline ---
// GlobalExceptionMiddleware must be first — it wraps everything else so no
// unhandled exception can escape and return an ASP.NET HTML error page.
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();  // validates the token on each request
app.UseAuthorization();   // checks [Authorize] policies against the validated token
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();

namespace SmartCare.API
{
    // Document filter: adds the global security requirement to the generated OpenAPI document.
    // We do it here (not in AddSecurityRequirement) because OpenApiSecuritySchemeReference
    // needs a reference to the already-built document — which is only available at filter time.
    public class BearerSecurityDocumentFilter : IDocumentFilter
    {
        public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
        {
            var schemeRef = new OpenApiSecuritySchemeReference("Bearer", swaggerDoc);
            swaggerDoc.Security ??= [];
            swaggerDoc.Security.Add(new OpenApiSecurityRequirement { { schemeRef, [] } });
        }
    }
}
