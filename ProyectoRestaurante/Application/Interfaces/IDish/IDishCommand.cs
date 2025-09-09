using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces.IDish
{
    public interface IDishCommand
    {
        Task<Dish> CreateDish(Dish newDish);
        Task InsertDish(Dish dish);
        Task<Dish> UpdateDish(Dish dish);
        Task DeleteDish(Dish dish);
    }
}
