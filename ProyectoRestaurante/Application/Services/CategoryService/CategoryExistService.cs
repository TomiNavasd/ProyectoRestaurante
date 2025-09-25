using Application.Interfaces.ICategory;
using Application.Interfaces.ICategory.ICategoryService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.CategoryService
{
    public class CategoryExistService : ICategoryExistService
    {
        private readonly ICategoryQuery _categoryQuery;
        public CategoryExistService(ICategoryQuery categoryQuery)
        {
            _categoryQuery = categoryQuery;
        }
        public Task<bool> CategoryExist(int? categoryId)
        {
            return _categoryQuery.CategoryExist(categoryId);
        }
    }
}
