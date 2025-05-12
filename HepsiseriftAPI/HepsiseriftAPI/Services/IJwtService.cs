using HepsiseriftAPI.Models;
using System.Security.Claims;

namespace HepsiseriftAPI.Services
{
    public interface IJwtService
    {
        string GenerateJwtToken(ApplicationUser user, IList<string> roles);
        ClaimsPrincipal? ValidateToken(string token);
    }
}