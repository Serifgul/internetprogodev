using HepsiseriftAPI.Data;
using HepsiseriftAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HepsiseriftAPI.Services
{
    public class ReviewService : IReviewService
    {
        private readonly ApplicationDbContext _context;

        public ReviewService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Review>> GetReviewsByProductIdAsync(int productId)
        {
            return await _context.Reviews
                .Where(r => r.ProductId == productId)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Review>> GetReviewsByUserIdAsync(string userId)
        {
            return await _context.Reviews
                .Where(r => r.UserId == userId)
                .Include(r => r.Product)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<Review?> GetReviewByIdAsync(int id)
        {
            return await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Product)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<Review> CreateReviewAsync(Review review)
        {
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // Update product rating
            await UpdateProductRatingAsync(review.ProductId);

            return review;
        }

        public async Task<Review?> UpdateReviewAsync(int id, Review review)
        {
            var existingReview = await _context.Reviews.FindAsync(id);
            if (existingReview == null)
                return null;

            existingReview.Rating = review.Rating;
            existingReview.Comment = review.Comment;

            _context.Reviews.Update(existingReview);
            await _context.SaveChangesAsync();

            // Update product rating
            await UpdateProductRatingAsync(existingReview.ProductId);

            return existingReview;
        }

        public async Task<bool> DeleteReviewAsync(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
                return false;

            int productId = review.ProductId;

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            // Update product rating
            await UpdateProductRatingAsync(productId);

            return true;
        }

        public async Task<bool> UserHasPurchasedProductAsync(string userId, int productId)
        {
            return await _context.OrderItems
                .Include(oi => oi.Order)
                .AnyAsync(oi => oi.Order!.UserId == userId 
                              && oi.ProductId == productId 
                              && oi.Order.Status != OrderStatus.Cancelled);
        }

        private async Task UpdateProductRatingAsync(int productId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.ProductId == productId)
                .ToListAsync();

            if (reviews.Count > 0)
            {
                float avgRating = (float)reviews.Average(r => r.Rating);
                var product = await _context.Products.FindAsync(productId);
                if (product != null)
                {
                    product.Rating = avgRating;
                    await _context.SaveChangesAsync();
                }
            }
        }
    }
}