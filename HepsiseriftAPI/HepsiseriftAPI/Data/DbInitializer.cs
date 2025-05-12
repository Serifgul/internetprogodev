using HepsiseriftAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HepsiseriftAPI.Data
{
    public static class DbInitializer
    {
        public static async Task Initialize(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            // Ensure database is created
            context.Database.EnsureCreated();

            // Create roles if they don't exist
            string[] roles = new string[] { "Admin", "User" };

            foreach (string role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            // Create admin user if it doesn't exist
            if (await userManager.FindByEmailAsync("admin@hepsiserift.com") == null)
            {
                var adminUser = new ApplicationUser
                {
                    UserName = "admin@hepsiserift.com",
                    Email = "admin@hepsiserift.com",
                    FirstName = "Admin",
                    LastName = "User",
                    PhoneNumber = "1234567890",
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(adminUser, "Admin123!");

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }

            // Seed categories if none exist
            if (!context.Categories.Any())
            {
                var categories = new List<Category>
                {
                    new Category { Name = "Electronics", Description = "Electronic devices and gadgets", ImageUrl = "https://source.unsplash.com/random/300x200/?electronics" },
                    new Category { Name = "Clothing", Description = "Fashionable clothing items", ImageUrl = "https://source.unsplash.com/random/300x200/?clothing" },
                    new Category { Name = "Books", Description = "Books of various genres", ImageUrl = "https://source.unsplash.com/random/300x200/?books" },
                    new Category { Name = "Home & Garden", Description = "Items for home and garden", ImageUrl = "https://source.unsplash.com/random/300x200/?home" },
                    new Category { Name = "Beauty", Description = "Beauty and personal care products", ImageUrl = "https://source.unsplash.com/random/300x200/?beauty" },
                    new Category { Name = "Sports", Description = "Sports equipment and accessories", ImageUrl = "https://source.unsplash.com/random/300x200/?sports" }
                };

                context.Categories.AddRange(categories);
                await context.SaveChangesAsync();
            }

            // Seed products if none exist
            if (!context.Products.Any())
            {
                var categories = await context.Categories.ToListAsync();
                
                var electronics = categories.First(c => c.Name == "Electronics");
                var clothing = categories.First(c => c.Name == "Clothing");
                var books = categories.First(c => c.Name == "Books");
                var homeGarden = categories.First(c => c.Name == "Home & Garden");
                var beauty = categories.First(c => c.Name == "Beauty");
                var sports = categories.First(c => c.Name == "Sports");

                var products = new List<Product>
                {
                    // Electronics
                    new Product
                    {
                        Name = "Smartphone X",
                        Description = "Latest smartphone with advanced features",
                        Price = 999.99m,
                        StockQuantity = 50,
                        CategoryId = electronics.Id,
                        ImageUrl = "https://source.unsplash.com/random/300x200/?smartphone",
                        Rating = 4.5f,
                        IsOnSale = true,
                        SalePrice = 899.99m
                    },
                    new Product
                    {
                        Name = "Laptop Pro",
                        Description = "High-performance laptop for professionals",
                        Price = 1499.99m,
                        StockQuantity = 30,
                        CategoryId = electronics.Id,
                        ImageUrl = "https://source.unsplash.com/random/300x200/?laptop",
                        Rating = 4.7f,
                        IsOnSale = false
                    },
                    new Product
                    {
                        Name = "Wireless Headphones",
                        Description = "Premium noise-cancelling wireless headphones",
                        Price = 199.99m,
                        StockQuantity = 100,
                        CategoryId = electronics.Id,
                        ImageUrl = "https://source.unsplash.com/random/300x200/?headphones",
                        Rating = 4.3f,
                        IsOnSale = true,
                        SalePrice = 149.99m
                    },

                    // Clothing
                    new Product
                    {
                        Name = "Summer Dress",
                        Description = "Lightweight summer dress for hot days",
                        Price = 49.99m,
                        StockQuantity = 75,
                        CategoryId = clothing.Id,
                        ImageUrl = "https://source.unsplash.com/random/300x200/?dress",
                        Rating = 4.0f,
                        IsOnSale = false
                    },
                    new Product
                    {
                        Name = "Men's Casual Shirt",
                        Description = "Comfortable casual shirt for everyday wear",
                        Price = 29.99m,
                        StockQuantity = 120,
                        CategoryId = clothing.Id,
                        ImageUrl = "https://source.unsplash.com/random/300x200/?shirt",
                        Rating = 4.2f,
                        IsOnSale = true,
                        SalePrice = 24.99m
                    },

                    // Books
                    new Product
                    {
                        Name = "The Mystery Novel",
                        Description = "Bestselling mystery novel with unexpected twists",
                        Price = 14.99m,
                        StockQuantity = 200,
                        CategoryId = books.Id,
                        ImageUrl = "https://source.unsplash.com/random/300x200/?book",
                        Rating = 4.6f,
                        IsOnSale = false
                    },
                    new Product
                    {
                        Name = "Cookbook Collection",
                        Description = "Collection of international recipes",
                        Price = 24.99m,
                        StockQuantity = 80,
                        CategoryId = books.Id,
                        ImageUrl = "https://source.unsplash.com/random/300x200/?cookbook",
                        Rating = 4.4f,
                        IsOnSale = true,
                        SalePrice = 19.99m
                    },

                    // Home & Garden
                    new Product
                    {
                        Name = "Indoor Plant Set",
                        Description = "Set of 3 easy-to-maintain indoor plants",
                        Price = 34.99m,
                        StockQuantity = 60,
                        CategoryId = homeGarden.Id,
                        ImageUrl = "https://source.unsplash.com/random/300x200/?plants",
                        Rating = 4.1f,
                        IsOnSale = false
                    },
                    new Product
                    {
                        Name = "Kitchen Knife Set",
                        Description = "Professional kitchen knife set with stand",
                        Price = 89.99m,
                        StockQuantity = 40,
                        CategoryId = homeGarden.Id,
                        ImageUrl = "https://source.unsplash.com/random/300x200/?knives",
                        Rating = 4.8f,
                        IsOnSale = true,
                        SalePrice = 69.99m
                    },

                    // Beauty
                    new Product
                    {
                        Name = "Luxury Skincare Set",
                        Description = "Complete skincare routine with natural ingredients",
                        Price = 59.99m,
                        StockQuantity = 85,
                        CategoryId = beauty.Id,
                        ImageUrl = "https://source.unsplash.com/random/300x200/?skincare",
                        Rating = 4.4f,
                        IsOnSale = false
                    },
                    new Product
                    {
                        Name = "Perfume Collection",
                        Description = "Set of 3 premium fragrances",
                        Price = 79.99m,
                        StockQuantity = 50,
                        CategoryId = beauty.Id,
                        ImageUrl = "https://source.unsplash.com/random/300x200/?perfume",
                        Rating = 4.3f,
                        IsOnSale = true,
                        SalePrice = 59.99m
                    },

                    // Sports
                    new Product
                    {
                        Name = "Yoga Mat",
                        Description = "Non-slip yoga mat for all types of yoga",
                        Price = 29.99m,
                        StockQuantity = 100,
                        CategoryId = sports.Id,
                        ImageUrl = "https://source.unsplash.com/random/300x200/?yoga",
                        Rating = 4.5f,
                        IsOnSale = false
                    },
                    new Product
                    {
                        Name = "Running Shoes",
                        Description = "Comfortable running shoes with great support",
                        Price = 99.99m,
                        StockQuantity = 70,
                        CategoryId = sports.Id,
                        ImageUrl = "https://source.unsplash.com/random/300x200/?shoes",
                        Rating = 4.6f,
                        IsOnSale = true,
                        SalePrice = 79.99m
                    }
                };

                context.Products.AddRange(products);
                await context.SaveChangesAsync();
            }
        }
    }
}