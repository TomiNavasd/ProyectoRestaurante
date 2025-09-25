using Application.Models.Request;
using Application.Models.Responses.Dish;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.IDish.IDishService
{
    public interface IUpdateDishService
    {
        Task<DishResponse?> UpdateDish(Guid id, DishUpdateRequest DishUpdateRequest);
    }
}
