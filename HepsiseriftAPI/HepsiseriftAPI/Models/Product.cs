using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HepsiseriftAPI.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? SalePrice { get; set; }

        public bool IsOnSale { get; set; }

        [Required]
        public int StockQuantity { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        public float Rating { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Foreign key
        public int CategoryId { get; set; }

        // Navigation property
        public virtual Category? Category { get; set; }
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}