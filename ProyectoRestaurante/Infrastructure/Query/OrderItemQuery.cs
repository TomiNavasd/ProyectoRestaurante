using Application.Interfaces.IOrderItem;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Query
{
    public class OrderItemQuery : IOrderItemQuery
    {
        private readonly AppDbContext _context;
        public OrderItemQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<OrderItem?> GetOrderItemById(int id)
        {
            return await _context.OrderItems.FindAsync(id);
        }

        public async Task<List<OrderItem>> GetOrderItems()
        {
            return await _context.OrderItems.ToListAsync();
        }
        public async Task<bool> IsDishInActiveOrder(Guid dishId)
        {
            //por si ya estan inactivos
            var inactiveStatuses = new[] { 4, 5 }; // por ejemplo 4=Delivered, 5=Closed

            return await _context.OrderItems
                .AnyAsync(item =>
                    item.DishId == dishId && 
                    !inactiveStatuses.Contains(item.OrderEnt.OverallStatus)
                );
        }

    }
}
