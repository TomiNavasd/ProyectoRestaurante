using Application.Interfaces.IOrder;
using Application.Interfaces.IOrder.IOrderService;
using Application.Models.Request;
using Application.Models.Responses.Order;
using Application.Exceptions;
using Application.Interfaces.IStatus;
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
        private readonly IStatusQuery _statusQuery;

        public UpdateOrderItemStatusService(IOrderQuery orderQuery, IOrderCommand orderCommand, IStatusQuery statusQuery)
        {
            _orderQuery = orderQuery;
            _orderCommand = orderCommand;
            _statusQuery = statusQuery;
        }
        public async Task<OrderUpdateResponse> UpdateStatus(long orderId, int itemId, OrderItemUpdateRequest request)
        {
            // Orden e Item existen (lanzan 404)
            var order = await _orderQuery.GetOrderById(orderId);
            if (order == null)
            {
                throw new NotFoundException("Orden no encontrada.");
            }

            // Buscar el item específico dentro de la orden
            var itemToUpdate = order.OrderItems.FirstOrDefault(item => item.OrderItemId == itemId);
            if (itemToUpdate == null)
            {
                throw new NotFoundException("Item no encontrado en la orden.");
            }

            // El nuevo estado es válido (lanza 400)
            int newStatus = request.status;
            var statusExists = await _statusQuery.StatusExists(newStatus);
            if (!statusExists)
            {
                throw new BadRequestException("El estado especificado no es válido.");
            }

            //Lógica del Flujo de Estados
            int currentStatus = itemToUpdate.Status;

            bool isValidTransition = (currentStatus, newStatus) switch
            {
                (1, 2) => true, // Pending -> In preparation
                (2, 3) => true, // In preparation -> Ready
                (3, 4) => true, // Ready -> Delivered
                (4, 5) => true, // Delivered -> Closed
                _ => false      // Cualquier otra transición no es válida
            };

            if (!isValidTransition)
            {
                throw new BadRequestException($"No se puede cambiar de estado '{currentStatus}' a '{newStatus}'.");
            }

            // Actualizar el estado del item y la fecha de la orden
            itemToUpdate.Status = newStatus;
            order.UpdateDate = DateTime.Now;

            // VERIFICAR SI TODOS LOS ITEMS AHORA TIENEN EL MISMO ESTADO
            var firstItemStatus = order.OrderItems.First().Status;

            // Luego, usamos All() para comprobar si todos los demás ítems coinciden.
            var allItemsHaveSameStatus = order.OrderItems.All(item => item.Status == firstItemStatus);

            if (allItemsHaveSameStatus)
            {
                // Si todos los items están en estado "3",
                // la orden principal también pasará a estado "3".
                order.OverallStatus = firstItemStatus;
            }

            // GUARDAR TODOS LOS CAMBIOS
            await _orderCommand.UpdateOrder(order);

            return new OrderUpdateResponse
            {
                orderNumber = (int)order.OrderId,
                totalAmount = (double)order.Price,
                updateAt = order.UpdateDate
            };
        }
    }
}
