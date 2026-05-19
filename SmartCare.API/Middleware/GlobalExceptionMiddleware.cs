using System.Text.Json;
using MongoDB.Driver;

namespace SmartCare.API.Middleware;

public class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger, IHostEnvironment env)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            if (ex is FormatException)
                logger.LogWarning(ex, "Bad request on {Method} {Path}", context.Request.Method, context.Request.Path);
            else if (ex is MongoException)
                logger.LogError(ex, "Database error on {Method} {Path}", context.Request.Method, context.Request.Path);
            else
                logger.LogError(ex, "Unhandled exception on {Method} {Path}", context.Request.Method, context.Request.Path);

            await WriteErrorResponse(context, ex);
        }
    }

    private async Task WriteErrorResponse(HttpContext context, Exception ex)
    {
        var (statusCode, errorMessage) = ex switch
        {
            FormatException => (StatusCodes.Status400BadRequest, "Invalid ID format"),
            MongoException => (StatusCodes.Status503ServiceUnavailable, "Database temporarily unavailable. Please try again."),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred")
        };

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var response = new
        {
            error = errorMessage,
            detail = env.IsDevelopment() ? (string?)ex.Message : null,
            traceId = context.TraceIdentifier
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
