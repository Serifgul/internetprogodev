using HepsiseriftAPI.Models;
using HepsiseriftAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HepsiseriftAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetUserProfile()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.PhoneNumber,
                user.RegisteredAt,
                user.LastLogin
            });
        }

        public class UpdateProfileModel
        {
            public string FirstName { get; set; } = string.Empty;
            public string LastName { get; set; } = string.Empty;
            public string PhoneNumber { get; set; } = string.Empty;
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateUserProfile([FromBody] UpdateProfileModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            user.FirstName = model.FirstName;
            user.LastName = model.LastName;
            user.PhoneNumber = model.PhoneNumber;

            var result = await _userService.UpdateUserAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.PhoneNumber
            });
        }

        [HttpGet("addresses")]
        public async Task<IActionResult> GetUserAddresses()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var addresses = await _userService.GetUserAddressesAsync(userId);
            return Ok(addresses);
        }

        [HttpGet("addresses/{id}")]
        public async Task<IActionResult> GetAddressById(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var address = await _userService.GetAddressByIdAsync(id);
            if (address == null || address.UserId != userId)
                return NotFound(new { message = "Address not found" });

            return Ok(address);
        }

        [HttpPost("addresses")]
        public async Task<IActionResult> AddAddress([FromBody] Address address)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            address.UserId = userId;
            var createdAddress = await _userService.AddAddressAsync(address);

            return CreatedAtAction(nameof(GetAddressById), new { id = createdAddress.Id }, createdAddress);
        }

        [HttpPut("addresses/{id}")]
        public async Task<IActionResult> UpdateAddress(int id, [FromBody] Address address)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var existingAddress = await _userService.GetAddressByIdAsync(id);
            if (existingAddress == null || existingAddress.UserId != userId)
                return NotFound(new { message = "Address not found" });

            address.UserId = userId;
            var updatedAddress = await _userService.UpdateAddressAsync(id, address);
            if (updatedAddress == null)
                return NotFound(new { message = "Address not found" });

            return Ok(updatedAddress);
        }

        [HttpDelete("addresses/{id}")]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var address = await _userService.GetAddressByIdAsync(id);
            if (address == null || address.UserId != userId)
                return NotFound(new { message = "Address not found" });

            var result = await _userService.DeleteAddressAsync(id);
            if (!result)
                return NotFound(new { message = "Address not found" });

            return NoContent();
        }

        [HttpGet("wishlist")]
        public async Task<IActionResult> GetWishlist()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var wishlist = await _userService.GetWishlistAsync(userId);
            return Ok(wishlist);
        }
    }
}