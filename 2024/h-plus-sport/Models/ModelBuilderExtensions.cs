using Microsoft.EntityFrameworkCore;

namespace HPlusSport.API.Models
{
    public static class ModelBuilderExtensions
    {
        public static void Seed(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Active Wear" },
                new Category { Id = 2, Name = "Mineral Water" },
                new Category { Id = 3, Name = "Supplements" }
            );

            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 1, CategoryId = 1, Sku = "AWMGSJ", Name = "Grunge Skater Jeans", Price = 68m, IsAvailable = true },
                new Product { Id = 2, CategoryId = 2, Sku = "AWMPS", Name = "Polo Shirt", Price = 35m, IsAvailable = true },
                new Product { Id = 3, CategoryId = 3, Sku = "AWMSGT", Name = "Skater Graphic T-Shirt", Price = 33m, IsAvailable = true },
                new Product { Id = 4, CategoryId = 1, Sku = "AWMSJ", Name = "Slicker Jacket", Price = 125m, IsAvailable = true }
            );
        }
    }
}