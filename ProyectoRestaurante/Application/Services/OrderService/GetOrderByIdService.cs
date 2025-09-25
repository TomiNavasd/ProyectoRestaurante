using Application.Exceptions;
using Application.Interfaces.IOrder;
using Application.Interfaces.IOrder.IOrderService;
using Application.Models.Request;
using Application.Models.Response;
using Application.Models.Responses.Dish;
using Application.Models.Responses.Order;
using Application.Models.Responses.OrderItem;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.OrderService
{
    public class GetOrderByIdService : IGetOrderByIdService
    {
        private readonly IOrderQuery _orderQuery;
        public GetOrderByIdService(IOrderQuery orderQuery)
        {
            _orderQuery = orderQuery;
        }
        public async Task<OrderDetailsResponse> GetOrderById(long orderId)
        {
            var order = await _orderQuery.GetFullOrderById(orderId);
            if (order == null)
            {
                // En lugar de devolver null, lanzamos la excepción específica de "No Encontrado".
                throw new NotFoundException($"La orden con número {orderId} no fue encontrada.");
            }

            return new OrderDetailsResponse
            {
                orderNumber = (int)order.OrderId,
                totalAmount = (double)order.Price,
                deliveryTo = order.DeliveryTo,
                notes = order.Notes,
                status = new GenericResponse { Id = order.OverallStatus, Name = order.OverallStatusEnt.Name},
                deliveryType = new GenericResponse { Id = order.DeliveryType, Name = order.DeliveryTypeEnt.Name},
                items = order.OrderItems.Select(oi => new OrderItemResponse
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
                createdAt = order.CreateDate,
                updatedAt = order.UpdateDate
            };
        }
    }
}
