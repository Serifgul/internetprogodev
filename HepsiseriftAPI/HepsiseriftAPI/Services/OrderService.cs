using HepsiseriftAPI.Data;
using HepsiseriftAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HepsiseriftAPI.Services
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;

        public OrderService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Order>> GetAllOrdersAsync()
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.ShippingAddress)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .ToListAsync();
        }

        public async Task<Order?> GetOrderByIdAsync(int id)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.ShippingAddress)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<IEnumerable<Order>> GetOrdersByUserIdAsync(string userId)
        {
            return await _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.ShippingAddress)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<Order> CreateOrderAsync(Order order, List<OrderItem> orderItems)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                foreach (var item in orderItems)
                {
                    item.OrderId = order.Id;
                    _context.OrderItems.Add(item);
                    
                    // Update stock quantity
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product != null)
                    {
                        product.StockQuantity -= item.Quantity;
                        _context.Products.Update(product);
                    }
                }

                await _context.SaveChangesAsync();

                // Clear cart after successful order
                var cart = await _context.ShoppingCarts
                    .Include(c => c.CartItems)
                    .FirstOrDefaultAsync(c => c.UserId == order.UserId);

                if (cart != null)
                {
                    _context.CartItems.RemoveRange(cart.CartItems);
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();
                
                return order;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<Order?> UpdateOrderStatusAsync(int id, OrderStatus status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return null;

            order.Status = status;

            // Update timestamps based on status
            if (status == OrderStatus.Shipped && !order.ShippedDate.HasValue)
                order.ShippedDate = DateTime.UtcNow;
            else if (status == OrderStatus.Delivered && !order.DeliveredDate.HasValue)
                order.DeliveredDate = DateTime.UtcNow;

            _context.Orders.Update(order);
            await _context.SaveChangesAsync();

            return order;
        }

        public async Task<bool> DeleteOrderAsync(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return false;

            _context.OrderItems.RemoveRange(order.OrderItems);
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}