using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces.ICategory;
using Domain.Entities;
using Infrastructure.Data;

namespace Infrastructure.Command
{
    public class CategoryCommand : ICategoryCommand
    {
        private readonly AppDbContext _context;
        public CategoryCommand(AppDbContext context)
        {
            _context = context;
        }
        public async Task DeleteCategory(Category category)
        {
            _context.Remove(category);
            await _context.SaveChangesAsync();
        }

        public async Task InsertCategory(Category category)
        {
            _context.Add(category);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateCategory(Category category)
        {
            _context.Update(category);
            await _context.SaveChangesAsync();
        }
    }
}
