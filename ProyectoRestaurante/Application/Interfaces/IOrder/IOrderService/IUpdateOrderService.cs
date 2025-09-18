using Application.Models.Request;
using Application.Models.Responses.Dish;
using Application.Models.Responses.Order;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.IOrder.IOrderService
{
    public interface IUpdateOrderService
    {
        Task<OrderUpdateResponse> UpdateOrder(long orderId, OrderUpdateRequest ItemRequest);
    }
}
