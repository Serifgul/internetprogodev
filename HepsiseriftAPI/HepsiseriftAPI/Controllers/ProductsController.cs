using HepsiseriftAPI.Models;
using HepsiseriftAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HepsiseriftAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly IReviewService _reviewService;
        private readonly IUserService _userService;

        public ProductsController(
            IProductService productService,
            IReviewService reviewService,
            IUserService userService)
        {
            _productService = productService;
            _reviewService = reviewService;
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _productService.GetAllProductsAsync();
            return Ok(products);
        }

        [HttpGet("featured")]
        public async Task<IActionResult> GetFeaturedProducts()
        {
            var products = await _productService.GetFeaturedProductsAsync();
            return Ok(products);
        }

        [HttpGet("on-sale")]
        public async Task<IActionResult> GetOnSaleProducts()
        {
            var products = await _productService.GetOnSaleProductsAsync();
            return Ok(products);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchProducts([FromQuery] string term)
        {
            var products = await _productService.SearchProductsAsync(term);
            return Ok(products);
        }

        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetProductsByCategory(int categoryId)
        {
            var products = await _productService.GetProductsByCategoryAsync(categoryId);
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found" });

            return Ok(product);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdProduct = await _productService.CreateProductAsync(product);
            return CreatedAtAction(nameof(GetProductById), new { id = createdProduct.Id }, createdProduct);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product product)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updatedProduct = await _productService.UpdateProductAsync(id, product);
            if (updatedProduct == null)
                return NotFound(new { message = "Product not found" });

            return Ok(updatedProduct);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var result = await _productService.DeleteProductAsync(id);
            if (!result)
                return NotFound(new { message = "Product not found" });

            return NoContent();
        }

        [HttpGet("{id}/reviews")]
        public async Task<IActionResult> GetProductReviews(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found" });

            var reviews = await _reviewService.GetReviewsByProductIdAsync(id);
            return Ok(reviews);
        }

        [Authorize]
        [HttpPost("{id}/reviews")]
        public async Task<IActionResult> AddProductReview(int id, [FromBody] Review review)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found" });

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // Check if the user has purchased the product
            var hasPurchased = await _reviewService.UserHasPurchasedProductAsync(userId, id);
            if (!hasPurchased)
                return BadRequest(new { message = "You can only review products you have purchased" });

            // Check if the user has already reviewed this product
            var userReviews = await _reviewService.GetReviewsByUserIdAsync(userId);
            if (userReviews.Any(r => r.ProductId == id))
                return BadRequest(new { message = "You have already reviewed this product" });

            review.UserId = userId;
            review.ProductId = id;
            
            var createdReview = await _reviewService.CreateReviewAsync(review);
            return CreatedAtAction(nameof(GetProductReviews), new { id }, createdReview);
        }

        [Authorize]
        [HttpGet("{id}/wishlist")]
        public async Task<IActionResult> IsInWishlist(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var isInWishlist = await _userService.IsProductInWishlistAsync(userId, id);
            return Ok(new { isInWishlist });
        }

        [Authorize]
        [HttpPost("{id}/wishlist")]
        public async Task<IActionResult> AddToWishlist(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found" });

            var wishlistItem = await _userService.AddToWishlistAsync(userId, id);
            if (wishlistItem == null)
                return BadRequest(new { message = "Failed to add product to wishlist" });

            return Ok(wishlistItem);
        }

        [Authorize]
        [HttpDelete("{id}/wishlist")]
        public async Task<IActionResult> RemoveFromWishlist(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var wishlist = await _userService.GetWishlistAsync(userId);
            var wishlistItem = wishlist.FirstOrDefault(w => w.ProductId == id);
            
            if (wishlistItem == null)
                return NotFound(new { message = "Product not found in wishlist" });

            var result = await _userService.RemoveFromWishlistAsync(userId, wishlistItem.Id);
            if (!result)
                return BadRequest(new { message = "Failed to remove product from wishlist" });

            return NoContent();
        }
    }
}