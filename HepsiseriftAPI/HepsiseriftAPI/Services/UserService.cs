using HepsiseriftAPI.Data;
using HepsiseriftAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HepsiseriftAPI.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public UserService(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<ApplicationUser?> GetUserByIdAsync(string userId)
        {
            return await _userManager.FindByIdAsync(userId);
        }

        public async Task<IEnumerable<ApplicationUser>> GetAllUsersAsync()
        {
            return await _userManager.Users.ToListAsync();
        }

        public async Task<IdentityResult> UpdateUserAsync(ApplicationUser user)
        {
            return await _userManager.UpdateAsync(user);
        }

        public async Task<Address?> GetAddressByIdAsync(int addressId)
        {
            return await _context.Addresses.FindAsync(addressId);
        }

        public async Task<IEnumerable<Address>> GetUserAddressesAsync(string userId)
        {
            return await _context.Addresses
                .Where(a => a.UserId == userId)
                .ToListAsync();
        }

        public async Task<Address> AddAddressAsync(Address address)
        {
            // If this is set as default, unset other defaults
            if (address.IsDefault)
            {
                var defaultAddresses = await _context.Addresses
                    .Where(a => a.UserId == address.UserId && a.IsDefault)
                    .ToListAsync();

                foreach (var defaultAddress in defaultAddresses)
                {
                    defaultAddress.IsDefault = false;
                }
            }

            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();
            return address;
        }

        public async Task<Address?> UpdateAddressAsync(int addressId, Address address)
        {
            var existingAddress = await _context.Addresses.FindAsync(addressId);
            if (existingAddress == null)
                return null;

            // If this is set as default, unset other defaults
            if (address.IsDefault && !existingAddress.IsDefault)
            {
                var defaultAddresses = await _context.Addresses
                    .Where(a => a.UserId == existingAddress.UserId && a.IsDefault)
                    .ToListAsync();

                foreach (var defaultAddress in defaultAddresses)
                {
                    defaultAddress.IsDefault = false;
                }
            }

            existingAddress.FullName = address.FullName;
            existingAddress.AddressLine1 = address.AddressLine1;
            existingAddress.AddressLine2 = address.AddressLine2;
            existingAddress.City = address.City;
            existingAddress.State = address.State;
            existingAddress.PostalCode = address.PostalCode;
            existingAddress.Country = address.Country;
            existingAddress.PhoneNumber = address.PhoneNumber;
            existingAddress.IsDefault = address.IsDefault;

            _context.Addresses.Update(existingAddress);
            await _context.SaveChangesAsync();

            return existingAddress;
        }

        public async Task<bool> DeleteAddressAsync(int addressId)
        {
            var address = await _context.Addresses.FindAsync(addressId);
            if (address == null)
                return false;

            _context.Addresses.Remove(address);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<WishlistItem>> GetWishlistAsync(string userId)
        {
            return await _context.WishlistItems
                .Where(wi => wi.UserId == userId)
                .Include(wi => wi.Product)
                .ToListAsync();
        }

        public async Task<WishlistItem?> AddToWishlistAsync(string userId, int productId)
        {
            // Check if product exists
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                return null;

            // Check if item already exists in wishlist
            var existingItem = await _context.WishlistItems
                .FirstOrDefaultAsync(wi => wi.UserId == userId && wi.ProductId == productId);

            if (existingItem != null)
                return existingItem;

            var wishlistItem = new WishlistItem
            {
                UserId = userId,
                ProductId = productId,
                AddedAt = DateTime.UtcNow
            };

            _context.WishlistItems.Add(wishlistItem);
            await _context.SaveChangesAsync();

            return wishlistItem;
        }

        public async Task<bool> RemoveFromWishlistAsync(string userId, int wishlistItemId)
        {
            var wishlistItem = await _context.WishlistItems
                .FirstOrDefaultAsync(wi => wi.Id == wishlistItemId && wi.UserId == userId);

            if (wishlistItem == null)
                return false;

            _context.WishlistItems.Remove(wishlistItem);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> IsProductInWishlistAsync(string userId, int productId)
        {
            return await _context.WishlistItems
                .AnyAsync(wi => wi.UserId == userId && wi.ProductId == productId);
        }
    }
}