using Application.Interfaces.IDish;
using Application.Interfaces.IDish.IDishService;
using Application.Models.Response;
using Application.Models.Responses.Dish;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.DishService
{
    public class GetDishByIdService : IGetDishByIdService
    {
        private readonly IDishQuery _dishQuery;
        private readonly IDishCommand _dishCommand;
        public GetDishByIdService(IDishQuery dishQuery, IDishCommand dishCommand)
        {
            _dishQuery = dishQuery;
            _dishCommand = dishCommand;
        }
        public async Task<DishResponse?> GetDishById(Guid id)
        {
            var dish = await _dishQuery.GetDishById(id);
            if (dish == null)
            {
                return null;
            }
            return new DishResponse
            {
                id = dish.DishId,
                name = dish.Name,
                description = dish.Description,
                price = dish.Price,
                isActive = dish.Available,
                image = dish.ImageUrl,
                category = new GenericResponse { Id = dish.Category, Name = dish.CategoryEnt.Name },
                createdAt = dish.CreateDate,
                updatedAt = dish.UpdateDate
            };
        }
    }
}
