# ─── Build stage ─────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj first for layer caching (restore only re-runs when dependencies
# change, not on every code change).
COPY ["SmartCare.API.csproj", "./"]
RUN dotnet restore

# Copy everything else and publish.
COPY . .
RUN dotnet publish -c Release -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

# ─── Runtime stage ───────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# Run as the non-root "app" user that ships in .NET 8+ runtime images
# (UID 1654, exposed as $APP_UID). No package install or user creation needed —
# the earlier addgroup/adduser approach failed on Render because the package was
# unavailable in the minimal image.
USER $APP_UID

ENV ASPNETCORE_ENVIRONMENT=Production

# Render (and most PaaS) terminate TLS at their edge and inject a PORT env var
# for the container to listen on; bind to it, defaulting to 8080 for a plain
# local `docker run`. `exec` keeps dotnet as PID 1 so SIGTERM reaches it for a
# graceful shutdown on redeploys.
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec dotnet SmartCare.API.dll --urls http://+:${PORT:-8080}"]
