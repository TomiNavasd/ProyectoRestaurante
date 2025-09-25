using Application.Enums;
using Application.Exceptions;
using Application.Interfaces.ICategory;
using Application.Interfaces.IDish;
using Application.Interfaces.IDish.IDishService;
using Application.Models.Response;
using Application.Models.Responses.Dish;

namespace Application.Services.DishService
{
    public class SearchAsyncService : ISearchAsyncService
    {
        private readonly IDishQuery _dishQuery;
        private readonly ICategoryQuery _categoryQuery;
        public SearchAsyncService(IDishQuery dishQuery, ICategoryQuery categoryQuery)
        {
            _dishQuery = dishQuery;
            _categoryQuery = categoryQuery;
        }

        public async Task<IEnumerable<DishResponse?>> SearchAsync(string? name, int? categoryId,bool? onlyActive, OrderPrice? priceOrder = OrderPrice.asc)
        {
            //Validaciones
            if (categoryId.HasValue) // Verificamos si se proveyó un ID de categoría
            {
                if (categoryId.Value == 0)
                {
                    throw new BadRequestException("El ID de categoría 0 no es un valor válido.");
                }
                var categoryExists = await _categoryQuery.GetCategoryById(categoryId.Value);
                if (categoryExists == null)
                {
                    throw new BadRequestException($"La categoría con ID {categoryId.Value} no fue encontrada.");
                }
            }

            var list = await _dishQuery.GetAllAsync(name, categoryId, onlyActive, priceOrder);
            return list.Select(dishes => new DishResponse
            {
                id = dishes.DishId,
                name = dishes.Name,
                description = dishes.Description,
                price = dishes.Price,
                isActive = dishes.Available,
                image = dishes.ImageUrl,
                category = new GenericResponse { Id = dishes.Category, Name = dishes.CategoryEnt?.Name },
                createdAt = dishes.CreateDate,
                updatedAt = dishes.UpdateDate
            }).ToList();
        }
    }
}
