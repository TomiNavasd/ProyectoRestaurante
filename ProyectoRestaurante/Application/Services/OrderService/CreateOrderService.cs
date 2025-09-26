using Application.Exceptions;
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
            // Validaciones de datos básicos
            if (orderRequest?.delivery == null)
                throw new BadRequestException("Debe especificar los datos de entrega.");
            if (orderRequest.items == null || !orderRequest.items.Any())
                throw new BadRequestException("La orden debe contener al menos un ítem.");

            // validación de tipo de entrega
            var deliveryType = await _deliveryTypeQuery.GetDeliveryTypeById(orderRequest.delivery.id);
            if (deliveryType == null)
                throw new BadRequestException("Debe especificar un tipo de entrega válido.");

            // Validación de ítems (platos y cantidades)
            // validamos las cantidades
            if (orderRequest.items.Any(item => item.quantity <= 0))
                throw new BadRequestException("La cantidad de cada ítem debe ser mayor a 0.");

            // validamos los platos en una sola consulta a la BD
            var dishIds = orderRequest.items.Select(i => i.id).ToList();
            var dishesFromDb = await _dishQuery.GetDishesByIds(dishIds);

            if (dishesFromDb.Count != dishIds.Count)
                throw new BadRequestException("Uno o más platos especificados no existen.");

            if (dishesFromDb.Any(d => !d.Available))
                throw new BadRequestException("Uno o más platos especificados no están disponibles.");


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
