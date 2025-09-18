using Application.Interfaces.IOrder;
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
    public class OrderQuery : IOrderQuery
    {
        private readonly AppDbContext _context;
        public OrderQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Order?> GetOrderById(int id)
        {
            return await _context.Orders.FindAsync(id);
        }

        public async Task<List<Order>> GetOrders()
        {
            return await _context.Orders.ToListAsync();
        }
        public async Task<IEnumerable<Order?>> GetOrderFechaStatus(DateTime? from, DateTime? to, int? statusid)
        {
            var query = _context.Orders
                 .Include(o => o.OverallStatusEnt)
                 .Include(o => o.DeliveryTypeEnt)
                 .Include(o => o.OrderItems)
                 .ThenInclude(oi => oi.Dish)
                 .Include(o => o.OrderItems)
                 .ThenInclude(oi => oi.StatusEnti)
             .AsNoTracking().AsQueryable();
            if (from.HasValue)
            {
                query = query.Where(o => o.CreateDate >= from.Value);
            }
            if (to.HasValue)
            {
                query = query.Where(o => o.CreateDate <= to.Value);
            }
            if (statusid.HasValue)
            {
                query = query.Where(o => o.OverallStatus == statusid.Value);
            }
            return await query.ToListAsync();
        }
    }
}
