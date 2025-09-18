using Application.Interfaces.IOrder;
using Application.Interfaces.IOrder.IOrderService;
using Application.Models.Response;
using Application.Models.Responses.Dish;
using Application.Models.Responses.Order;
using Application.Models.Responses.OrderItem;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.OrderService
{
    public class GetOrderFechaStatusService : IGetOrderFechaStatusService
    {
        private readonly IOrderQuery _orderQuery;
        private readonly IOrderCommand _orderCommand;
        public GetOrderFechaStatusService(IOrderQuery orderQuery, IOrderCommand orderCommand)
        {
            _orderQuery = orderQuery;
            _orderCommand = orderCommand;
        }
        public async Task<IEnumerable<OrderDetailsResponse?>> GetOrderFechaStatus(DateTime? from, DateTime? to, int? statusid)
        {
            var orders = await _orderQuery.GetOrderFechaStatus(from, to, statusid);
            var orderResponses = orders.Select(o => new OrderDetailsResponse
            {
                orderNumber = (int)o.OrderId,
                totalAmount = (double)o.Price,
                deliveryTo = o.DeliveryTo,
                notes = o.Notes,
                status = new GenericResponse { Id = o.OverallStatus, Name = o.OverallStatusEnt.Name},
                deliveryType = new GenericResponse { Id = o.DeliveryType, Name = o.DeliveryTypeEnt.Name},
                items = o.OrderItems.Select(oi => new OrderItemResponse
                {
                    id = oi.OrderItemId,
                    quantity = oi.Quantity,
                    notes = oi.Notes,
                    status = new GenericResponse { Id = oi.Status, Name = oi.StatusEnti.Name },
                    dish = new DishShortResponse
                    {
                        id = oi.DishId,
                        name = oi.Dish.Name,
                        image = oi.Dish.ImageUrl
                    }

                }).ToList(),
                createdAt = o.CreateDate,
                updatedAt = o.UpdateDate
            });
            return orderResponses;
        }
    }
}
