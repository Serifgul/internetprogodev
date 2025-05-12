using HepsiseriftAPI.Models;
using HepsiseriftAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HepsiseriftAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReviewById(int id)
        {
            var review = await _reviewService.GetReviewByIdAsync(id);
            if (review == null)
                return NotFound(new { message = "Review not found" });

            return Ok(review);
        }

        [Authorize]
        [HttpGet("my-reviews")]
        public async Task<IActionResult> GetUserReviews()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var reviews = await _reviewService.GetReviewsByUserIdAsync(userId);
            return Ok(reviews);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] Review review)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var existingReview = await _reviewService.GetReviewByIdAsync(id);
            if (existingReview == null)
                return NotFound(new { message = "Review not found" });

            // Ensure user can only update their own reviews
            if (existingReview.UserId != userId && !User.IsInRole("Admin"))
                return Forbid();

            var updatedReview = await _reviewService.UpdateReviewAsync(id, review);
            if (updatedReview == null)
                return NotFound(new { message = "Review not found" });

            return Ok(updatedReview);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var review = await _reviewService.GetReviewByIdAsync(id);
            if (review == null)
                return NotFound(new { message = "Review not found" });

            // Ensure user can only delete their own reviews
            if (review.UserId != userId && !User.IsInRole("Admin"))
                return Forbid();

            var result = await _reviewService.DeleteReviewAsync(id);
            if (!result)
                return NotFound(new { message = "Review not found" });

            return NoContent();
        }
    }
}