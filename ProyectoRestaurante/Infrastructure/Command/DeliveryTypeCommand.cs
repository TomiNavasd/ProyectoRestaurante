using Application.Interfaces.IDeliveryType;
using Domain.Entities;
using Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Command
{
    public class DeliveryTypeCommand : IDeliveryTypeCommand
    {
        private readonly AppDbContext _context;
        public DeliveryTypeCommand(AppDbContext context)
        {
            _context = context;
        }
        public async Task DeleteDeliveryType(DeliveryType deliveryType)
        {
            _context.Remove(deliveryType);
            await _context.SaveChangesAsync();
        }

        public async Task InsertDeliveryType(DeliveryType deliveryType)
        {
            _context.Add(deliveryType);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateDeliveryType(DeliveryType deliveryType)
        {
            _context.Update(deliveryType);
            await _context.SaveChangesAsync();
        }
    }
}
