using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces.IOrder
{
    public interface IOrderQuery
    {
        Task<List<Order>> GetOrders();
        Task<Order?> GetOrderById(long id);
        Task<IEnumerable<Order?>> GetOrderFechaStatus(DateTime? from, DateTime? to, int? statusid);
    }
}
