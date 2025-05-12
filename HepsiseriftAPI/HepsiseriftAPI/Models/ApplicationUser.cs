using Microsoft.AspNetCore.Identity;

namespace HepsiseriftAPI.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLogin { get; set; }

        // Navigation properties
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<Address> Addresses { get; set; } = new List<Address>();
        public virtual ShoppingCart? ShoppingCart { get; set; }
        public virtual ICollection<WishlistItem> Wishlist { get; set; } = new List<WishlistItem>();
    }
}