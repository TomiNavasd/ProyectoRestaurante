using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces.IOrderItem
{
    public interface IOrderItemCommand
    {
        Task InsertOrderItem(OrderItem orderItem);
        Task InsertOrderItems(List<OrderItem> orderItems);
        Task UpdateOrderItem(OrderItem orderItem);
        Task DeleteOrderItem(OrderItem orderItem);
        Task DeleteOrderItems(IEnumerable<OrderItem> items);
    }
}
