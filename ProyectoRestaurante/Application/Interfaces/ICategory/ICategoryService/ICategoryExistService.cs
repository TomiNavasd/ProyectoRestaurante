using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.ICategory.ICategoryService
{
    public interface ICategoryExistService
    {
        Task<bool> CategoryExist(int? categoryId);
    }
}
