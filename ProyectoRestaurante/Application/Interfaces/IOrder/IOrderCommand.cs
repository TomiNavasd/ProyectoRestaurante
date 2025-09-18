using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces.IOrder
{
    public interface IOrderCommand
    {
        Task InsertOrder(Order order);
        Task UpdateOrder(Order order);
        Task DeleteOrder(Order order);
    }
}
