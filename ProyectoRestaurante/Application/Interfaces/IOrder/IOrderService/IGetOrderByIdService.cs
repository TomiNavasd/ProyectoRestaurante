using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.IOrder.IOrderService
{
    public interface IGetOrderByIdService
    {
        Task<Order?> GetOrderByIdService(int orderId);
    }
}
