using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces.IOrderItem;
using Domain.Entities;
using Infrastructure.Data;

namespace Infrastructure.Command
{
    public class OrderItemCommand : IOrderItemCommand
    {
        private readonly AppDbContext _context;
        public OrderItemCommand(AppDbContext context)
        {
            _context = context;
        }
        public async Task DeleteOrderItem(OrderItem orderItem)
        {
            _context.Remove(orderItem);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteOrderItems(IEnumerable<OrderItem> items)
        {
            if (items == null || !items.Any())
            {
                return;
            }
            _context.OrderItems.RemoveRange(items);
            await _context.SaveChangesAsync();
        }
        public async Task InsertOrderItem(OrderItem orderItem)
        {
            _context.Add(orderItem);
            await _context.SaveChangesAsync();
        }
        public async Task InsertOrderItems(List<OrderItem> orderItems)
        {
            _context.AddRange(orderItems);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateOrderItem(OrderItem orderItem)
        {
            _context.Update(orderItem);
            await _context.SaveChangesAsync();
        }
    }
}
