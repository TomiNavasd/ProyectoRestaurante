using Application.Interfaces.IDeliveryType;
using Application.Interfaces.IDish;
using Application.Interfaces.IOrder;
using Application.Interfaces.IOrder.IOrderService;
using Application.Interfaces.IOrderItem;
using Application.Models.Request;
using Application.Models.Responses.Order;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.OrderService
{
    
    public class CreateOrderService : ICreateOrderService
    {
        private readonly IOrderQuery _orderQuery;
        private readonly IOrderCommand _orderCommand;
        private readonly IDeliveryTypeQuery _deliveryTypeQuery;
        private readonly IDishCommand _dishCommand;
        private readonly IDishQuery _dishQuery;
        private readonly IOrderItemCommand _orderItemCommand;
        private readonly IOrderItemQuery _orderItemQuery;

        public CreateOrderService(IOrderQuery orderQuery, IOrderCommand orderCommand, IDeliveryTypeQuery deliveryTypeQuery, IDishCommand dishCommand, IDishQuery dishQuery, IOrderItemQuery orderItemQuery, IOrderItemCommand orderItemCommand)
        {
            _orderQuery = orderQuery;
            _orderCommand = orderCommand;
            _deliveryTypeQuery = deliveryTypeQuery;
            _dishCommand = dishCommand;
            _dishQuery = dishQuery;
            _orderItemQuery = orderItemQuery;
            _orderItemCommand = orderItemCommand;
        }
        public async Task<OrderCreateResponse?> CreateOrder(OrderRequest orderRequest)
        {
            var deliveryType = await _deliveryTypeQuery.GetDeliveryTypeById(orderRequest.delivery.id);
            var order = new Order
            {
                DeliveryTo = orderRequest.delivery.to,
                DeliveryType = orderRequest.delivery.id,
                Price = 0,
                OverallStatus = 1, // Pending
                Notes = orderRequest.notes,
                UpdateDate = DateTime.Now,
                CreateDate = DateTime.Now
            };
            await _orderCommand.InsertOrder(order);
            var listadeItems = orderRequest.items;
            var listaorderItems = listadeItems.Select(item => new OrderItem
            {
                DishId = item.id,
                Quantity = item.quantity,
                Notes = item.notes,
                Status = 1,
                Order = order.OrderId,
            }).ToList();
            order.Price = await CalculateTotalPrice(listadeItems);
            await _orderItemCommand.InsertOrderItems(listaorderItems);
            await _orderCommand.UpdateOrder(order);
            

            return new OrderCreateResponse
            {
                orderNumber = (int) order.OrderId,
                totalAmount = (double)order.Price,
                createdAt = DateTime.Now
            };

        }
        private async Task<decimal> CalculateTotalPrice(List<Items> orderItems)
        {
            decimal totalPrice = 0;
            foreach (var item in orderItems)
            {
                var dish = await _dishQuery.GetDishById(item.id);
                totalPrice += dish.Price * item.quantity;
                
            }
            return totalPrice;
        }
    }
}
