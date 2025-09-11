using Application.Enums;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.IDish
{
    public interface IDishQuery
    {
        Task<List<Dish>> GetAllDishes();
        Task<Dish?> GetDishById(Guid id);
        Task<IEnumerable<Dish>> GetAllAsync(string? name = null, int? categoryId = null, bool? onlyActive = true, OrderPrice? priceOrder = OrderPrice.asc);
        Task<bool> FoundDish(string name, Guid? idToExclude = null);
    }
}
