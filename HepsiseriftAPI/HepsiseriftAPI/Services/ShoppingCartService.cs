using HepsiseriftAPI.Data;
using HepsiseriftAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HepsiseriftAPI.Services
{
    public class ShoppingCartService : IShoppingCartService
    {
        private readonly ApplicationDbContext _context;

        public ShoppingCartService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ShoppingCart> GetOrCreateCartAsync(string userId)
        {
            var cart = await _context.ShoppingCarts
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new ShoppingCart
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ShoppingCarts.Add(cart);
                await _context.SaveChangesAsync();
            }

            return cart;
        }

        public async Task<IEnumerable<CartItem>> GetCartItemsAsync(string userId)
        {
            var cart = await GetOrCreateCartAsync(userId);

            return await _context.CartItems
                .Where(ci => ci.ShoppingCartId == cart.Id)
                .Include(ci => ci.Product)
                .ToListAsync();
        }

        public async Task<CartItem?> AddItemToCartAsync(string userId, int productId, int quantity)
        {
            var cart = await GetOrCreateCartAsync(userId);

            // Check if product exists
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                return null;

            // Check if product is in stock
            if (product.StockQuantity < quantity)
                return null;

            // Check if item already exists in cart
            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.ShoppingCartId == cart.Id && ci.ProductId == productId);

            if (existingItem != null)
            {
                // Update quantity of existing item
                existingItem.Quantity += quantity;
                _context.CartItems.Update(existingItem);
                await _context.SaveChangesAsync();
                return existingItem;
            }
            else
            {
                // Add new item to cart
                var cartItem = new CartItem
                {
                    ShoppingCartId = cart.Id,
                    ProductId = productId,
                    Quantity = quantity,
                    AddedAt = DateTime.UtcNow
                };

                _context.CartItems.Add(cartItem);
                await _context.SaveChangesAsync();
                return cartItem;
            }
        }

        public async Task<CartItem?> UpdateCartItemAsync(string userId, int cartItemId, int quantity)
        {
            var cart = await GetOrCreateCartAsync(userId);

            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.ShoppingCartId == cart.Id);

            if (cartItem == null)
                return null;

            // Check if product is in stock
            var product = await _context.Products.FindAsync(cartItem.ProductId);
            if (product == null || product.StockQuantity < quantity)
                return null;

            cartItem.Quantity = quantity;
            _context.CartItems.Update(cartItem);
            await _context.SaveChangesAsync();

            return cartItem;
        }

        public async Task<bool> RemoveItemFromCartAsync(string userId, int cartItemId)
        {
            var cart = await GetOrCreateCartAsync(userId);

            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.ShoppingCartId == cart.Id);

            if (cartItem == null)
                return false;

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ClearCartAsync(string userId)
        {
            var cart = await GetOrCreateCartAsync(userId);

            var cartItems = await _context.CartItems
                .Where(ci => ci.ShoppingCartId == cart.Id)
                .ToListAsync();

            _context.CartItems.RemoveRange(cartItems);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}