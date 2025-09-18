using Application.Interfaces.ICategory;
using Application.Interfaces.IDish;
using Application.Interfaces.IDish.IDishService;
using Application.Models.Request;
using Application.Models.Response;
using Application.Models.Responses;
using Application.Models.Responses.Dish;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.DishService
{ 
    public class UpdateDishService : IUpdateDishService
    {
        private readonly IDishQuery _dishQuery;
        private readonly IDishCommand _dishCommand;
        private readonly ICategoryQuery _categoryQuery;
        public UpdateDishService(IDishQuery dishQuery, IDishCommand dishCommand, ICategoryQuery categoryQuery)
        {
            _dishQuery = dishQuery;
            _dishCommand = dishCommand;
            _categoryQuery = categoryQuery;
        }

        public async Task<UpdateDishResult> UpdateDish(Guid id, DishUpdateRequest DishUpdateRequest)
        {
            var existDish = await _dishQuery.GetDishById(id);
            if (existDish == null)
            {
                return new UpdateDishResult { NotFound = true };
            }
            var alreadyExist = await _dishQuery.FoundDish(DishUpdateRequest.Name,id);
            if (alreadyExist )
            {
                return new UpdateDishResult { NameConflict = true };
            }

            

            existDish.Name = DishUpdateRequest.Name;
            existDish.Description = DishUpdateRequest.Description;
            existDish.Price = DishUpdateRequest.Price;
            existDish.Available = DishUpdateRequest.IsActive;
            existDish.Category = DishUpdateRequest.Category;
            existDish.ImageUrl = DishUpdateRequest.Image;
            existDish.UpdateDate = DateTime.Now;

            await _dishCommand.UpdateDish(existDish);
            var category = await _categoryQuery.GetCategoryById(existDish.Category);

            return new UpdateDishResult
            {
                Success = true,
                UpdatedDish = new DishResponse {
                    
                    id = existDish.DishId,
                    name = existDish.Name,
                    description = existDish.Description,
                    price = existDish.Price,
                    isActive = existDish.Available,
                    image = existDish.ImageUrl,
                    category = new GenericResponse { Id = existDish.Category, Name = category.Name },
                    createdAt = existDish.CreateDate,
                    updatedAt = existDish.UpdateDate

                }
            };
        }

    }
}
