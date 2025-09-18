using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces.IOrder;
using Domain.Entities;
using Infrastructure.Data;

namespace Infrastructure.Command
{
    public class OrderCommand : IOrderCommand
    {
        private readonly AppDbContext _context;
        public OrderCommand(AppDbContext context)
        {
            _context = context;
        }
        public async Task DeleteOrder(Order order)
        {
            _context.Remove(order);
            await _context.SaveChangesAsync();
        }
        public async Task InsertOrder(Order order)
        {
            _context.Add(order);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateOrder(Order order)
        {
            _context.Update(order);
            await _context.SaveChangesAsync();
        }
    }
}
