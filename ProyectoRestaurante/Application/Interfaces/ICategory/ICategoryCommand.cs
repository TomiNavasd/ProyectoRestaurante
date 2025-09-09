using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces.ICategory
{
    public interface ICategoryCommand
    {
        Task InsertCategory(Category category);
        Task UpdateCategory(Category category);
        Task DeleteCategory(Category category);
    }
}
