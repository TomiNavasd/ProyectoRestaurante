using Application.Interfaces.ICategory;
using Application.Interfaces.ICategory.ICategoryService;
using Application.Models.Responses;
using Application.Models.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.CategoryService
{
    public class GetAllCategoriesService : IGetAllCategoriesService
    {
        private readonly ICategoryQuery _categoryQuery;
        public GetAllCategoriesService(ICategoryQuery categoryQuery)
        {
            _categoryQuery = categoryQuery;
        }
        public async Task<List<CategoryResponse>> GetAllCategories()
        {
            var categories = await _categoryQuery.GetAllCategories();
            var categoryResponses = categories.Select(c => new CategoryResponse
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description
            }).ToList();
            return categoryResponses;
        }
    }
}
