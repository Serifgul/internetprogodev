using HepsiseriftAPI.Models;
using HepsiseriftAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HepsiseriftAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IShoppingCartService _cartService;
        private readonly IUserService _userService;

        public OrdersController(
            IOrderService orderService,
            IShoppingCartService cartService,
            IUserService userService)
        {
            _orderService = orderService;
            _cartService = cartService;
            _userService = userService;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _orderService.GetAllOrdersAsync();
            return Ok(orders);
        }

        [HttpGet("my-orders")]
        public async Task<IActionResult> GetUserOrders()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var orders = await _orderService.GetOrdersByUserIdAsync(userId);
            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var order = await _orderService.GetOrderByIdAsync(id);
            if (order == null)
                return NotFound(new { message = "Order not found" });

            // Only allow users to see their own orders (admins can see all)
            if (order.UserId != userId && !User.IsInRole("Admin"))
                return Forbid();

            return Ok(order);
        }

        public class CreateOrderModel
        {
            public int ShippingAddressId { get; set; }
            public string PaymentMethod { get; set; } = string.Empty;
            public string? PaymentId { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // Get cart items
            var cartItems = await _cartService.GetCartItemsAsync(userId);
            if (!cartItems.Any())
                return BadRequest(new { message = "Your cart is empty" });

            // Verify shipping address
            var address = await _userService.GetAddressByIdAsync(model.ShippingAddressId);
            if (address == null || address.UserId != userId)
                return BadRequest(new { message = "Invalid shipping address" });

            // Create order
            var order = new Order
            {
                UserId = userId,
                ShippingAddressId = model.ShippingAddressId,
                PaymentMethod = model.PaymentMethod,
                PaymentId = model.PaymentId,
                IsPaid = !string.IsNullOrEmpty(model.PaymentId),
                PaidDate = !string.IsNullOrEmpty(model.PaymentId) ? DateTime.UtcNow : null,
                Status = OrderStatus.Pending,
                TotalAmount = cartItems.Sum(ci => ci.Product!.IsOnSale && ci.Product.SalePrice.HasValue ? 
                    ci.Product.SalePrice.Value * ci.Quantity : ci.Product!.Price * ci.Quantity)
            };

            // Create order items
            var orderItems = cartItems.Select(ci => new OrderItem
            {
                ProductId = ci.ProductId,
                Quantity = ci.Quantity,
                UnitPrice = ci.Product!.IsOnSale && ci.Product.SalePrice.HasValue ? 
                    ci.Product.SalePrice.Value : ci.Product!.Price,
                Subtotal = ci.Product!.IsOnSale && ci.Product.SalePrice.HasValue ? 
                    ci.Product.SalePrice.Value * ci.Quantity : ci.Product!.Price * ci.Quantity
            }).ToList();

            var createdOrder = await _orderService.CreateOrderAsync(order, orderItems);
            return CreatedAtAction(nameof(GetOrderById), new { id = createdOrder.Id }, createdOrder);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] OrderStatus status)
        {
            var updatedOrder = await _orderService.UpdateOrderStatusAsync(id, status);
            if (updatedOrder == null)
                return NotFound(new { message = "Order not found" });

            return Ok(updatedOrder);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var result = await _orderService.DeleteOrderAsync(id);
            if (!result)
                return NotFound(new { message = "Order not found" });

            return NoContent();
        }
    }
}