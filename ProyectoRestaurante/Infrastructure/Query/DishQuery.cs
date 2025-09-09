using Application.Enums;
using Application.Interfaces.IDish;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Query
{
    public class DishQuery : IDishQuery
    {
        private readonly AppDbContext _context;
        public DishQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Dish>> GetAllAsync(string? name = null, int? categoryId = null, bool? onlyActive = null, OrderPrice? priceOrder = OrderPrice.ASC)
        {
            var query = _context.Dishes.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(d => d.Name.Contains(name));
            }

            if (categoryId>=1 && categoryId <= 10)
            {
                query = query.Where(d => d.Category == categoryId.Value);
            }

            switch (onlyActive)
            {
                case true:
                    query = query.Where(d => d.Available == true);
                    break;
                case false:
                    query = query.Where(d => d.Available == false);
                    break;
                default:
                    break;
            }


            switch (priceOrder)
            {
                case OrderPrice.ASC:
                    query = query.OrderBy(d => d.Price);
                    break;
                case OrderPrice.DESC:
                    query = query.OrderByDescending(d => d.Price);
                    break;
                default:
                    throw new InvalidOperationException("Valor de ordenamiento inválido");

            }
            return await query.Include(d => d.CategoryEnt).ToListAsync();

        }
        public async Task<bool> FoundDish(string name)
        {
            return await _context.Dishes.AnyAsync(d => d.Name == name);
        }

        public async Task<List<Dish>> GetAllDishes()
        {
            return await _context.Dishes.ToListAsync();
        }
        public async Task<Dish?> GetDishById(Guid id)
        {
            return await _context.Dishes.FindAsync(id).AsTask();
        }

    }
}
