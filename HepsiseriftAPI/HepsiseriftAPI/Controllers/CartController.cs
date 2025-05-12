using HepsiseriftAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HepsiseriftAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly IShoppingCartService _cartService;

        public CartController(IShoppingCartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var cartItems = await _cartService.GetCartItemsAsync(userId);
            return Ok(cartItems);
        }

        public class AddToCartModel
        {
            public int ProductId { get; set; }
            public int Quantity { get; set; } = 1;
        }

        [HttpPost]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var cartItem = await _cartService.AddItemToCartAsync(userId, model.ProductId, model.Quantity);
            if (cartItem == null)
                return BadRequest(new { message = "Failed to add item to cart. Product might not exist or is out of stock." });

            return Ok(cartItem);
        }

        public class UpdateCartItemModel
        {
            public int Quantity { get; set; }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCartItem(int id, [FromBody] UpdateCartItemModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var cartItem = await _cartService.UpdateCartItemAsync(userId, id, model.Quantity);
            if (cartItem == null)
                return BadRequest(new { message = "Failed to update cart item. Item might not exist or requested quantity exceeds available stock." });

            return Ok(cartItem);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveFromCart(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _cartService.RemoveItemFromCartAsync(userId, id);
            if (!result)
                return NotFound(new { message = "Cart item not found" });

            return NoContent();
        }

        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _cartService.ClearCartAsync(userId);
            if (!result)
                return BadRequest(new { message = "Failed to clear cart" });

            return NoContent();
        }
    }
}