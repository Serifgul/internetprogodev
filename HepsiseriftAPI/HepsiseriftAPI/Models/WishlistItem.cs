using System.ComponentModel.DataAnnotations;

namespace HepsiseriftAPI.Models
{
    public class WishlistItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public int ProductId { get; set; }

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ApplicationUser? User { get; set; }
        public virtual Product? Product { get; set; }
    }
}