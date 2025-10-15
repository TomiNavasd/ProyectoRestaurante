using Application.Exceptions;
using Application.Interfaces.ICategory;
using Application.Interfaces.IDish;
using Application.Interfaces.IDish.IDishService;
using Application.Models.Response;
using Application.Models.Responses.Dish;

namespace Application.Services.DishService
{
    public class GetDishByIdService : IGetDishByIdService
    {
        private readonly IDishQuery _dishQuery;
        private readonly ICategoryQuery _categoryQuery;
        public GetDishByIdService(IDishQuery dishQuery, ICategoryQuery categoryQuery)
        {
            _dishQuery = dishQuery;
            _categoryQuery = categoryQuery;
        }
        public async Task<DishResponse?> GetDishById(Guid id)
        {
            var dish = await _dishQuery.GetDishById(id);
            if (dish == null)
            {
                // En lugar de devolver null, lanzamos la excepción.
                throw new NotFoundException($"El plato con la id {id} no fue encontrado.");
            }
            var category = await _categoryQuery.GetCategoryById(dish.Category);
            
            return new DishResponse
            {
                id = dish.DishId,
                name = dish.Name,
                description = dish.Description,
                price = dish.Price,
                isActive = dish.Available,
                image = dish.ImageUrl,
                category = new GenericResponse { Id = dish.Category, Name = category.Name },
                createdAt = dish.CreateDate,
                updatedAt = dish.UpdateDate
            };
        }
    }
}
