using HepsiseriftAPI.Models;

namespace HepsiseriftAPI.Services
{
    public interface IOrderService
    {
        Task<IEnumerable<Order>> GetAllOrdersAsync();
        Task<Order?> GetOrderByIdAsync(int id);
        Task<IEnumerable<Order>> GetOrdersByUserIdAsync(string userId);
        Task<Order> CreateOrderAsync(Order order, List<OrderItem> orderItems);
        Task<Order?> UpdateOrderStatusAsync(int id, OrderStatus status);
        Task<bool> DeleteOrderAsync(int id);
    }
}