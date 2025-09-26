using Application.Exceptions;
using Application.Interfaces.IDish;
using Application.Interfaces.IOrder;
using Application.Interfaces.IOrder.IOrderService;
using Application.Interfaces.IOrderItem;
using Application.Models.Request;
using Application.Models.Responses.Order;
using Application.Enums;
using Azure.Core;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.OrderService
{
    public class UpdateOrderService : IUpdateOrderService
    {
        private readonly IOrderQuery _orderQuery;
        private readonly IOrderCommand _orderCommand;
        private readonly IOrderItemQuery _orderItemQuery;
        private readonly IOrderItemCommand _orderItemCommand;
        private readonly IDishQuery _dishQuery;

        public UpdateOrderService(IOrderQuery orderQuery, IOrderCommand orderCommand, IOrderItemQuery orderItemQuery, IOrderItemCommand orderItemCommand, IDishQuery dishQuery)
        {
            _orderQuery = orderQuery;
            _orderCommand = orderCommand;
            _orderItemQuery = orderItemQuery;
            _orderItemCommand = orderItemCommand;
            _dishQuery = dishQuery;
        }
        public async Task<OrderUpdateResponse> UpdateOrder(long orderId, OrderUpdateRequest ItemRequest)
        {
            // Validacion 1 Orden Encontrada y Modificable
            var order = await _orderQuery.GetOrderById(orderId); // Asegúrate que este método usa .Include(o => o.OrderItems)
            if (order == null)
            {
                throw new NotFoundException($"La orden con ID {orderId} no existe.");
            }
            if (order.OverallStatus >= (int)StatusOrderEnum.Pending) 
            {
                throw new BadRequestException("No se puede modificar una orden que ya está en preparación.");
            }
            // Items Válidos
            if (ItemRequest.Items == null || !ItemRequest.Items.Any())
                throw new BadRequestException("La orden debe contener al menos un ítem.");
            if (ItemRequest.Items.Any(item => item.quantity <= 0))
                throw new BadRequestException("La cantidad de cada ítem debe ser mayor a 0.");
            
            // Platos Válidos Optimizado
            var dishIds = ItemRequest.Items.Select(i => i.id).ToList();
            var dishesFromDb = await _dishQuery.GetDishesByIds(dishIds);

            if (dishesFromDb.Count != dishIds.Count)
                throw new BadRequestException("Uno o más platos especificados no existen.");
            if (dishesFromDb.Any(d => !d.Available))
                throw new BadRequestException("Uno o más platos especificados no están disponibles.");


            // Borrar los items antiguos
            await _orderItemCommand.DeleteOrderItems(order.OrderItems);

            // crear la nueva lista de items

            var newOrderItems = ItemRequest.Items.Select(item => new OrderItem
            {
                Order = orderId,
                DishId = item.id,
                Quantity = item.quantity,
                Notes = item.notes,
                Status = 1
            }).ToList();

            await _orderItemCommand.InsertOrderItems(newOrderItems);

            // Recalcular el precio total de la orden
            decimal newTotalPrice = 0;
            foreach (var item in newOrderItems)
            {
                var dish = await _dishQuery.GetDishById(item.DishId);
                newTotalPrice += dish.Price * item.Quantity;
            }

            // actualizar la orden principal
            order.Price = newTotalPrice;
            order.UpdateDate = DateTime.Now;
            await _orderCommand.UpdateOrder(order);

            return new OrderUpdateResponse
            {
                orderNumber = (int) order.OrderId,
                totalAmount = (double)order.Price,
                updateAt = order.UpdateDate //modificar
            };
        }
    }
}
