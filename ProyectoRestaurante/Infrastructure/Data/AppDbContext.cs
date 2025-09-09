using Microsoft.EntityFrameworkCore;
using Domain.Entities;

namespace Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        //DBSETs
        public DbSet<Status> Statuses { get; set; }
        public DbSet<DeliveryType> DeliveryTypes { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Dish> Dishes { get; set; }
         

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //Fluent API configurations
            //Category configuration
            modelBuilder.Entity<Category>(entity =>
            {
                entity.ToTable("Category");
                entity.HasKey(s => s.Id);
                entity.Property(s => s.Name).IsRequired().HasMaxLength(25);
                entity.Property(s => s.Description).HasMaxLength(255);
                entity.Property(s => s.Order).IsRequired();
                entity.HasData(
                    new Category { Id = 1, Name = "Entradas", Description = "Pequeñas porciones para abrir el apetito antes del plato principal.", Order = 1 },
                    new Category { Id = 2, Name = "Ensaladas", Description = "Opciones frescas y livianas, ideales como acompañamiento o plato principal.", Order = 2 },
                    new Category { Id = 3, Name = "Minutas", Description = "Platos rápidos y clásicos de bodegón: milanesas, tortillas, revueltos.", Order = 3 },
                    new Category { Id = 4, Name = "Pastas", Description = "Variedad de pastas caseras y salsas tradicionales.", Order = 5 },
                    new Category { Id = 5, Name = "Parrilla", Description = "Cortes de carne asados a la parrilla, servidos con guarniciones.", Order = 4 },
                    new Category { Id = 6, Name = "Pizzas", Description = "Pizzas artesanales con masa casera y variedad de ingredientes.", Order = 7 },
                    new Category { Id = 7, Name = "Sandwiches", Description = "Sandwiches y lomitos completos preparados al momento.", Order = 6 },
                    new Category { Id = 8, Name = "Bebidas", Description = "Gaseosas, jugos, aguas y opciones sin alcohol.", Order = 8 },
                    new Category { Id = 9, Name = "Cerveza Artesanal", Description = "Cervezas de producción artesanal, rubias, rojas y negras.", Order = 9 },
                    new Category { Id = 10, Name = "Postres", Description = "Clásicos dulces caseros para cerrar la comida.", Order = 10 });
                

            });
            //Dish configuration
            modelBuilder.Entity<Dish>(entity =>
            {
                entity.ToTable("Dish");
                entity.HasKey(s => s.DishId);
                entity.Property(s => s.Name).IsRequired().HasMaxLength(255);
                entity.Property(s => s.Price).IsRequired().HasPrecision(18,2);
                entity.Property(s => s.Available).IsRequired();
                entity.Property(s => s.ImageUrl).HasMaxLength(255);
                entity.Property(s => s.CreateDate).IsRequired();
                entity.Property(s => s.UpdateDate);

                //Relation with Category
                entity.HasOne(s => s.CategoryEnt)
                      .WithMany(c => c.Dishes)
                      .HasForeignKey(s => s.Category)
                      .OnDelete(DeleteBehavior.Restrict);



            });
            //Order configuration
            modelBuilder.Entity<Order>(entity =>
            {
                entity.ToTable("Order");
                entity.HasKey(s => s.OrderId);
                entity.Property(s => s.DeliveryTo).IsRequired().HasMaxLength(255);
                entity.Property(s => s.Price).IsRequired().HasPrecision(18,2);
                entity.Property(s => s.CreateDate).IsRequired();
                entity.Property(s => s.UpdateDate);

                //Relation with DeliveryType
                entity.HasOne(o => o.DeliveryType)
                      .WithMany(dt => dt.Orders)
                      .HasForeignKey(o => o.DeliveryTypeId)
                      .OnDelete(DeleteBehavior.Restrict);
                //Relation with Status
                entity.HasOne(o => o.OverallStatus)
                      .WithMany(s => s.Orders)
                      .HasForeignKey(o => o.StatusId)
                      .OnDelete(DeleteBehavior.Restrict);
    
            });
            //OrderItem configuration
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.ToTable("OrderItem");
                entity.HasKey(s => s.OrderItemId);
                entity.Property(s => s.Quantity).IsRequired();
                entity.Property(s => s.CreateDate).IsRequired();

                //Relation with Dish
                entity.HasOne(oi => oi.Dish)
                      .WithMany(d => d.OrderItems)
                      .HasForeignKey(oi => oi.DishId)
                      .OnDelete(DeleteBehavior.Restrict);
                //Relation with Order
                entity.HasOne(oi => oi.Order)
                      .WithMany(o => o.OrderItems)
                      .HasForeignKey(oi => oi.OrderId)
                      .OnDelete(DeleteBehavior.Restrict);
                //Relation with Status
                entity.HasOne(oi => oi.Status)
                      .WithMany(s => s.OrderItems)
                      .HasForeignKey(oi => oi.StatusId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            //Status configuration
            modelBuilder.Entity<Status>(entity =>
            {
                entity.ToTable("Status");
                entity.HasKey(s => s.Id);
                entity.Property(s => s.Name).IsRequired().HasMaxLength(25);
                entity.HasData(
                    new Status { Id = 1, Name = "Pending" },
                    new Status { Id = 2, Name = "In progress" },
                    new Status { Id = 3, Name = "Ready" },
                    new Status { Id = 4, Name = "Delivery" },
                    new Status { Id = 5, Name = "Closed" }
                );
            });
            //DeliveryType configuration
            modelBuilder.Entity<DeliveryType>(entity =>
            {
                entity.ToTable("DeliveryType");
                entity.HasKey(s => s.Id);
                entity.Property(s => s.Name).IsRequired().HasColumnType("nvarchar(25)");
                entity.HasData(
                    new DeliveryType { Id = 1, Name = "Delivery" },
                    new DeliveryType { Id = 2, Name = "Takeaway" },
                    new DeliveryType { Id = 3, Name = "Dine in" }
                );
            });
        }

    }
}
