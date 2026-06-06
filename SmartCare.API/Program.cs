using System.Text;
using System.Text.Json.Serialization;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
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

// --- Load .env file (local development only) ---
// Env.Load() reads variables from .env into Environment.GetEnvironmentVariable()
// Automatically skipped if .env doesn't exist
Env.Load();

// --- Secrets from environment (with appsettings fallback for local dev) ---
// Production supplies secrets via environment variables; local development
// falls back to appsettings.Development.json. We write the resolved value back
// into configuration so the existing repositories / services (which read these
// keys from IConfiguration) pick it up with no service-layer code change.
builder.Configuration["MongoDbSettings:ConnectionString"] =
    Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING")
    ?? builder.Configuration["MongoDbSettings:ConnectionString"];

// Optional: select the database (e.g. SmartCareDev vs SmartCare) per environment
// without editing committed config — handy when both live in the same cluster.
builder.Configuration["MongoDbSettings:DatabaseName"] =
    Environment.GetEnvironmentVariable("MONGODB_DATABASE")
    ?? builder.Configuration["MongoDbSettings:DatabaseName"];

builder.Configuration["JwtSettings:Secret"] =
    Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? builder.Configuration["JwtSettings:Secret"];

builder.Configuration["EmailSettings:SenderEmail"] =
    Environment.GetEnvironmentVariable("GMAIL_USER")
    ?? builder.Configuration["EmailSettings:SenderEmail"];

builder.Configuration["EmailSettings:SenderPassword"] =
    Environment.GetEnvironmentVariable("GMAIL_APP_PASSWORD")
    ?? builder.Configuration["EmailSettings:SenderPassword"];

// --- Fail fast in production when required secrets are missing ---
// Locally these come from appsettings.Development.json; in production they MUST be
// supplied as environment variables. A clear startup error beats a cryptic crash
// (or, worse, a JWT signed with an empty key) later on.
if (!builder.Environment.IsDevelopment())
{
    static void RequireSecret(string? value, string envVarName, int minLength = 1)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length < minLength)
            throw new InvalidOperationException(
                $"{envVarName} environment variable is required in production " +
                $"(minimum {minLength} characters). Set it in your host's environment variables.");
    }

    RequireSecret(builder.Configuration["MongoDbSettings:ConnectionString"], "MONGODB_CONNECTION_STRING");
    // HMAC-SHA256 signing keys must be at least 256 bits (32 bytes / chars).
    RequireSecret(builder.Configuration["JwtSettings:Secret"], "JWT_SECRET", 32);
}

// --- CORS ---
// Allowed origins come from two sources, merged: the CorsSettings:AllowedOrigins
// config section (appsettings.Production.json) and the FRONTEND_URL environment
// variable. When neither yields anything (local development) we fall back to the
// common Vite / dev-server ports. Specific origins are required because
// AllowCredentials is on (wildcards are not permitted with credentials).
var configuredOrigins = builder.Configuration
    .GetSection("CorsSettings:AllowedOrigins")
    .Get<string[]>() ?? [];
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL");

var corsOrigins = configuredOrigins
    .Concat(string.IsNullOrWhiteSpace(frontendUrl) ? [] : new[] { frontendUrl })
    .Where(o => !string.IsNullOrWhiteSpace(o))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

if (corsOrigins.Length == 0)
{
    corsOrigins =
    [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000"
    ];
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("ProductionPolicy", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// --- HSTS (transport security; only emitted outside Development) ---
builder.Services.AddHsts(options =>
{
    options.Preload = true;
    options.IncludeSubDomains = true;
    options.MaxAge = TimeSpan.FromDays(365);
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
// GlobalExceptionMiddleware stays outermost — it wraps everything else so no
// unhandled exception can escape and return an ASP.NET HTML error page.
app.UseMiddleware<GlobalExceptionMiddleware>();

// Behind Railway/Vercel's TLS-terminating proxy the container receives plain
// HTTP; honour X-Forwarded-Proto/For so the app sees the original https scheme
// (correct redirects, HSTS, secure cookies, and real client IPs). KnownProxies
// and KnownNetworks are cleared because the proxy address is not fixed on PaaS.
if (!app.Environment.IsDevelopment())
{
    var forwardedOptions = new ForwardedHeadersOptions
    {
        ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
    };
    forwardedOptions.KnownIPNetworks.Clear();
    forwardedOptions.KnownProxies.Clear();
    app.UseForwardedHeaders(forwardedOptions);

    // With the forwarded scheme known, redirect stray HTTP requests to HTTPS and
    // emit HSTS. Skipped in Development to avoid dev-certificate friction.
    app.UseHttpsRedirection();
    app.UseHsts();
}

// Swagger / OpenAPI is a development convenience and must NOT be exposed in
// production (it leaks the full API surface and schemas).
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("ProductionPolicy");
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
