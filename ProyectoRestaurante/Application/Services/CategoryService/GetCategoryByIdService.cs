using Application.Interfaces.ICategory.ICategoryService;
using Application.Models.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.CategoryService
{
    public class GetCategoryByIdService : IGetCategoryByIdService
    {
        public Task<CategoryResponse> GetCategoryById(int id)
        {
            throw new NotImplementedException();
        }
    }
}
