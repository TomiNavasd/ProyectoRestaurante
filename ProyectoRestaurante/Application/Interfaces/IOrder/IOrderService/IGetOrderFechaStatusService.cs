using Application.Models.Responses.Order;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.IOrder.IOrderService
{
    public interface IGetOrderFechaStatusService
    {
        Task<IEnumerable<OrderDetailsResponse?>> GetOrderFechaStatus(DateTime? from, DateTime? to, int? statusid);
    }
}
