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
            // VALIDACIÓN 1: Orden e Item existen (lanzan 404)
            // Asegúrate que GetOrderById usa .Include(o => o.OrderItems)
            var order = await _orderQuery.GetOrderById(orderId);
            if (order == null)
            {
                // Cambiamos la excepción genérica por la nuestra
                throw new NotFoundException("Orden no encontrada.");
            }

            // Buscar el item específico dentro de la orden
            var itemToUpdate = order.OrderItems.FirstOrDefault(item => item.OrderItemId == itemId);
            if (itemToUpdate == null)
            {
                // Cambiamos la excepción genérica por la nuestra
                throw new NotFoundException("Item no encontrado en la orden.");
            }

            // VALIDACIÓN 2: El nuevo estado es válido (lanza 400)
            int newStatus = request.status;
            var statusExists = await _statusQuery.StatusExists(newStatus);
            if (!statusExists)
            {
                throw new BadRequestException("El estado especificado no es válido.");
            }

            // 3. Lógica del Flujo de Estados
            int currentStatus = itemToUpdate.Status;

            bool isValidTransition = (currentStatus, newStatus) switch
            {
                (1, 2) => true, // Pending -> In preparation
                (2, 3) => true, // In preparation -> Ready
                (3, 4) => true, // Ready -> Delivered
                _ => false      // Cualquier otra transición no es válida
            };

            if (!isValidTransition)
            {
                // Cambiamos la excepción genérica por la nuestra
                throw new BadRequestException($"No se puede cambiar de estado '{currentStatus}' a '{newStatus}'.");
            }

            // 4. Actualizar el estado del item y la fecha de la orden
            itemToUpdate.Status = newStatus;
            order.UpdateDate = DateTime.Now;

            // 5. VERIFICAR SI TODOS LOS ITEMS AHORA TIENEN EL MISMO ESTADO
            // Primero, obtenemos el estado del primer ítem.
            var firstItemStatus = order.OrderItems.First().Status;

            // Luego, usamos All() para comprobar si todos los demás ítems coinciden.
            var allItemsHaveSameStatus = order.OrderItems.All(item => item.Status == firstItemStatus);

            // 6. ACTUALIZAR LA ORDEN PRINCIPAL SI LA CONDICIÓN SE CUMPLE
            if (allItemsHaveSameStatus)
            {
                // Si todos los items están, por ejemplo, en estado "3" (Ready),
                // la orden principal también pasará a estado "3".
                order.OverallStatus = firstItemStatus;
            }
            // No hay 'else'. Si no todos los items tienen el mismo estado, la orden principal no cambia.

            // 7. GUARDAR TODOS LOS CAMBIOS (del ítem y de la orden si aplica)
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
