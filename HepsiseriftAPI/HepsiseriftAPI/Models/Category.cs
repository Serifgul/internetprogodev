using System.ComponentModel.DataAnnotations;

namespace HepsiseriftAPI.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string ImageUrl { get; set; } = string.Empty;

        // Navigation property
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}