using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces.IDish;
using Domain.Entities;
using Infrastructure.Data;


namespace Infrastructure.Command
{
    public class DishCommand : IDishCommand
    {
        private readonly AppDbContext _context;

        public DishCommand(AppDbContext context)
        {
            _context = context;
        }
        public async Task DeleteDish(Dish dish)
        {
            _context.Remove(dish);
            await _context.SaveChangesAsync();
        }
        public async Task<Dish> CreateDish(Dish newDish)
        {
            _context.Dishes.Add(newDish);
            await _context.SaveChangesAsync();
            return newDish;
        }
        public async Task InsertDish(Dish dish)
        {
            _context.Add(dish);
            await _context.SaveChangesAsync();
        }

        public async Task<Dish> UpdateDish(Dish dish)
        {
           _context.Update(dish);
           await _context.SaveChangesAsync();
           return dish;
        }   
    }
}
