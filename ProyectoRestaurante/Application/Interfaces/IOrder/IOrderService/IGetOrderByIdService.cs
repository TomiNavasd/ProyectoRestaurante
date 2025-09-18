using Application.Models.Responses.Order;
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
        Task<OrderDetailsResponse> GetOrderById(long orderId);
    }
}
