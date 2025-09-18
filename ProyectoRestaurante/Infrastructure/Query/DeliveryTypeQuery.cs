using Application.Interfaces.IDeliveryType;
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
    public class DeliveryTypeQuery : IDeliveryTypeQuery
    {
        private readonly AppDbContext _context;
        public DeliveryTypeQuery(AppDbContext context)
        {
            _context = context;
        }
        public async Task<DeliveryType?> GetDeliveryTypeById(int id)
        {
            return await _context.DeliveryTypes.FindAsync(id);
        }

        public async Task<List<DeliveryType>> GetDeliveryTypes()
        {
            return await _context.DeliveryTypes.ToListAsync();
        }
    }
}
