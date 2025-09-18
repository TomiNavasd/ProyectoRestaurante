using Application.Models.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.ICategory.ICategoryService
{
    public interface IGetAllCategoriesService
    {
        Task<List<CategoryResponse>> GetAllCategories();
    }
}
