using HepsiseriftAPI.Models;

namespace HepsiseriftAPI.Services
{
    public interface IShoppingCartService
    {
        Task<ShoppingCart> GetOrCreateCartAsync(string userId);
        Task<IEnumerable<CartItem>> GetCartItemsAsync(string userId);
        Task<CartItem?> AddItemToCartAsync(string userId, int productId, int quantity);
        Task<CartItem?> UpdateCartItemAsync(string userId, int cartItemId, int quantity);
        Task<bool> RemoveItemFromCartAsync(string userId, int cartItemId);
        Task<bool> ClearCartAsync(string userId);
    }
}