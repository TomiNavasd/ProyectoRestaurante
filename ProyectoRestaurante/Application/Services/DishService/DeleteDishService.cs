using Application.Interfaces.IDish;
using Application.Interfaces.IDish.IDishService;
using Application.Models.Request;
using Application.Models.Responses;
using Application.Models.Responses.Dish;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.DishService
{
    public class DeleteDishService : IDeleteDishService
    {
        public Task<DishResponse> DeleteDish(DishRequest dishRequest)
        {
            throw new NotImplementedException();
        }
    }
}
