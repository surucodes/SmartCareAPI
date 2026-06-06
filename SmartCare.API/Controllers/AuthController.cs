using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using SmartCare.API.DTOs;
using SmartCare.API.Interfaces;
using SmartCare.API.Models;

namespace SmartCare.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public partial class AuthController : ControllerBase
    {
        private readonly IUserRepository _users;
        private readonly IConfiguration _config;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IUserRepository users, IConfiguration config, ILogger<AuthController> logger)
        {
            _users = users;
            _config = config;
            _logger = logger;
        }

        // One-time bootstrap: creates the first Admin account when the users collection
        // is empty. Blocked once any user exists — subsequent accounts require Admin auth.
        [HttpPost("bootstrap")]
        public async Task<ActionResult> Bootstrap(RegisterDto dto)
        {
            // One-time only. The first account ever created is the Admin made here,
            // so a non-empty collection means bootstrap has already run — close it
            // permanently with 403, regardless of the supplied secret.
            var count = await _users.CountAsync();
            if (count > 0)
            {
                LogBootstrapBlocked(_logger);
                return StatusCode(403, new { error = "Bootstrap is closed — an account already exists." });
            }

            // Gate behind a shared secret supplied via the BOOTSTRAP_SECRET environment
            // variable. Without it set, or on mismatch, bootstrap is refused.
            var requiredSecret = Environment.GetEnvironmentVariable("BOOTSTRAP_SECRET");
            if (string.IsNullOrEmpty(requiredSecret) || dto.BootstrapSecret != requiredSecret)
            {
                LogBootstrapUnauthorized(_logger);
                return Unauthorized(new { error = "Invalid bootstrap secret." });
            }

            if (dto.Role != "Admin")
                return BadRequest(new { error = "Bootstrap must create an Admin account" });

            var user = new AppUser
            {
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, workFactor: 12),
                Role = "Admin",
                CreatedAt = DateTime.UtcNow
            };

            await _users.CreateAsync(user);
            LogUserRegistered(_logger, user.Email, user.Role);

            return CreatedAtAction(nameof(Login), new { id = user.Id, email = user.Email, role = user.Role });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("register")]
        public async Task<ActionResult> Register(RegisterDto dto)
        {
            if (await _users.EmailExistsAsync(dto.Email))
            {
                LogDuplicateRegistration(_logger, dto.Email);
                return Conflict(new { error = "An account with this email already exists" });
            }

            var user = new AppUser
            {
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, workFactor: 12),
                Role = dto.Role,
                DoctorId = dto.DoctorId,
                CreatedAt = DateTime.UtcNow
            };

            await _users.CreateAsync(user);
            LogUserRegistered(_logger, user.Email, user.Role);

            return CreatedAtAction(nameof(Login), new
            {
                id = user.Id,
                email = user.Email,
                role = user.Role
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login(LoginDto dto)
        {
            var user = await _users.GetByEmailAsync(dto.Email);

            if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                LogFailedLogin(_logger, dto.Email);
                return Unauthorized(new { error = "Invalid email or password" });
            }

            var token = GenerateToken(user);
            LogUserAuthenticated(_logger, user.Email, user.Role);

            return Ok(new
            {
                token,
                email = user.Email,
                role = user.Role,
                expiresIn = $"{_config["JwtSettings:ExpiryHours"]} hours"
            });
        }

        private string GenerateToken(AppUser user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id!),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["JwtSettings:Secret"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["JwtSettings:Issuer"],
                audience: _config["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(
                    double.Parse(_config["JwtSettings:ExpiryHours"]!)),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [LoggerMessage(Level = LogLevel.Warning, Message = "Bootstrap blocked — users already exist")]
        private static partial void LogBootstrapBlocked(ILogger logger);

        [LoggerMessage(Level = LogLevel.Warning, Message = "Bootstrap rejected — missing or invalid secret")]
        private static partial void LogBootstrapUnauthorized(ILogger logger);

        [LoggerMessage(Level = LogLevel.Warning, Message = "Registration attempted with existing email {Email}")]
        private static partial void LogDuplicateRegistration(ILogger logger, string email);

        [LoggerMessage(Level = LogLevel.Information, Message = "User registered: {Email}, Role: {Role}")]
        private static partial void LogUserRegistered(ILogger logger, string email, string role);

        [LoggerMessage(Level = LogLevel.Warning, Message = "Failed login attempt for {Email}")]
        private static partial void LogFailedLogin(ILogger logger, string email);

        [LoggerMessage(Level = LogLevel.Information, Message = "User authenticated: {Email}, Role: {Role}")]
        private static partial void LogUserAuthenticated(ILogger logger, string email, string role);
    }
}
