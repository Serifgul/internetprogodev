using HepsiseriftAPI.Models;
using Microsoft.AspNetCore.Identity;

namespace HepsiseriftAPI.Services
{
    public interface IUserService
    {
        Task<ApplicationUser?> GetUserByIdAsync(string userId);
        Task<IEnumerable<ApplicationUser>> GetAllUsersAsync();
        Task<IdentityResult> UpdateUserAsync(ApplicationUser user);
        Task<Address?> GetAddressByIdAsync(int addressId);
        Task<IEnumerable<Address>> GetUserAddressesAsync(string userId);
        Task<Address> AddAddressAsync(Address address);
        Task<Address?> UpdateAddressAsync(int addressId, Address address);
        Task<bool> DeleteAddressAsync(int addressId);
        Task<IEnumerable<WishlistItem>> GetWishlistAsync(string userId);
        Task<WishlistItem?> AddToWishlistAsync(string userId, int productId);
        Task<bool> RemoveFromWishlistAsync(string userId, int wishlistItemId);
        Task<bool> IsProductInWishlistAsync(string userId, int productId);
    }
}