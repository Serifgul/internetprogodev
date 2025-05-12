using HepsiseriftAPI.Models;

namespace HepsiseriftAPI.Services
{
    public interface IReviewService
    {
        Task<IEnumerable<Review>> GetReviewsByProductIdAsync(int productId);
        Task<IEnumerable<Review>> GetReviewsByUserIdAsync(string userId);
        Task<Review?> GetReviewByIdAsync(int id);
        Task<Review> CreateReviewAsync(Review review);
        Task<Review?> UpdateReviewAsync(int id, Review review);
        Task<bool> DeleteReviewAsync(int id);
        Task<bool> UserHasPurchasedProductAsync(string userId, int productId);
    }
}