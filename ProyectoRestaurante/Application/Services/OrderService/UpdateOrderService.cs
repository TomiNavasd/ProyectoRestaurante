using Application.Interfaces.IDish;
using Application.Interfaces.IOrder;
using Application.Interfaces.IOrder.IOrderService;
using Application.Interfaces.IOrderItem;
using Application.Models.Request;
using Application.Models.Responses.Order;
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
            // 1. Buscar la orden existente con sus items
            var order = await _orderQuery.GetOrderById(orderId);
            if (order == null)
            {
                throw new Exception("La orden no existe."); // O manejarlo como prefieras
            }

            // 2. Validar regla de negocio: no se puede modificar si no está 'Pending'
            if (order.OverallStatus != 1) // Asumiendo que 1 = "Pending"
            {
                throw new Exception("No se puede modificar una orden que ya está en preparación");
            }

            // 3. Borrar los items antiguos
            await _orderItemCommand.DeleteOrderItems(order.OrderItems);

            // 4. Crear la nueva lista de items

            var newOrderItems = ItemRequest.Items.Select(item => new OrderItem
            {
                Order = orderId,
                DishId = item.id,
                Quantity = item.quantity,
                Notes = item.notes,
                Status = 1
            }).ToList();

            // 5. Insertar los nuevos items
            await _orderItemCommand.InsertOrderItems(newOrderItems);

            // 6. Recalcular el precio total de la orden
            decimal newTotalPrice = 0;
            foreach (var item in newOrderItems)
            {
                var dish = await _dishQuery.GetDishById(item.DishId);
                newTotalPrice += dish.Price * item.Quantity;
            }

            // 7. Actualizar la orden principal
            order.Price = newTotalPrice;
            order.UpdateDate = DateTime.Now;
            await _orderCommand.UpdateOrder(order);

            // 8. Devolver la respuesta formateada
            return new OrderUpdateResponse
            {
                orderNumber = (int) order.OrderId,
                totalAmount = (double)order.Price,
                updateAt = order.UpdateDate //modificar
            };
        }
    }
}
