using Application.Enums;
using Application.Interfaces.ICategory;
using Application.Interfaces.IDish;
using Application.Interfaces.IDish.IDishService;
using Application.Models.Response;
using Application.Models.Responses;

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

        public async Task<IEnumerable<DishResponse?>> SearchAsync(string? name, int? categoryId,bool? onlyActive, OrderPrice? priceOrder = OrderPrice.ASC)
        {

            var list = await _dishQuery.GetAllAsync(name, categoryId, onlyActive, priceOrder);
            return list.Select(dishes => new DishResponse
            {
                id = dishes.DishId,
                name = dishes.Name,
                description = dishes.Description,
                price = dishes.Price,
                isActive = dishes.Available,
                image = dishes.ImageUrl,
                category = new GenericResponse { Id = dishes.CategoryId, Name = dishes.Category?.Name },
                createdAt = dishes.CreateDate,
                updatedAt = dishes.UpdateDate
            }).ToList();
        }
    }
}
