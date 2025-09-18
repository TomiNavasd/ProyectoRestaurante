using Application.Models.Responses.Order;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Models.Request;

namespace Application.Interfaces.IOrder.IOrderService
{
    public interface IUpdateOrderItemStatusService
    {
        Task<OrderUpdateResponse> UpdateStatus(long orderId, int itemId, OrderItemUpdateRequest request);
    }
}
