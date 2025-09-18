using Application.Interfaces.IOrder;
using Application.Interfaces.IOrder.IOrderService;
using Application.Models.Request;
using Application.Models.Responses.Order;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.OrderService
{
    public class UpdateOrderItemStatusService : IUpdateOrderItemStatusService
    {
        private readonly IOrderQuery _orderQuery;
        private readonly IOrderCommand _orderCommand;

        public UpdateOrderItemStatusService(IOrderQuery orderQuery, IOrderCommand orderCommand)
        {
            _orderQuery = orderQuery;
            _orderCommand = orderCommand;
        }
        public async Task<OrderUpdateResponse> UpdateStatus(long orderId, int itemId, OrderItemUpdateRequest request)
        {
            // 1. Buscar la orden y sus items
            var order = await _orderQuery.GetOrderById(orderId);
            if (order == null)
            {
                throw new KeyNotFoundException("Orden no encontrada");
            }

            // 2. Buscar el item específico dentro de la orden
            var itemToUpdate = order.OrderItems.FirstOrDefault(item => item.OrderItemId == itemId);
            if (itemToUpdate == null)
            {
                throw new KeyNotFoundException("Item no encontrado en la orden");
            }

            // 3. Lógica del Flujo de Estados
            int currentStatus = itemToUpdate.Status;
            int newStatus = request.status;

            bool isValidTransition = (currentStatus, newStatus) switch
            {
                (1, 2) => true, // Pending -> In preparation
                (2, 3) => true, // In preparation -> Ready
                (3, 4) => true, // Ready -> Delivered
                _ => false      // Cualquier otra transición no es válida
            };

            if (!isValidTransition)
            {
                throw new ArgumentException("El estado especificado no es válido o la transición no está permitida");
            }

            // 4. Actualizar el estado del item y la fecha de la orden
            itemToUpdate.Status = newStatus;
            order.UpdateDate = DateTime.Now;

            // Lógica extra: Actualizar estado general de la orden si todos los items cambiaron
            if (order.OrderItems.All(item => item.Status == 4)) // Si todos están "Delivered"
            {
                order.OverallStatus = 4;
            }
            else if (order.OrderItems.All(item => item.Status >= 3)) // Si todos están "Ready" o más
            {
                order.OverallStatus = 3;
            }

            // 5. Guardar los cambios
            await _orderCommand.UpdateOrder(order);

            // 6. Devolver la respuesta
            return new OrderUpdateResponse
            {
                orderNumber = (int)order.OrderId,
                totalAmount = (double)order.Price,
                updateAt = order.UpdateDate
            };
        }
    }
}
