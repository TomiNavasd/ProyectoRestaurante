using Application.Models.Request;
using Application.Models.Responses.Order;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.IOrder.IOrderService
{
    public interface ICreateOrderService
    {
        Task<OrderCreateResponse?> CreateOrder(OrderRequest orderRequest);
    }
}
