using Application.Enums;
using Application.Exceptions;
using Application.Interfaces.IOrder;
using Application.Interfaces.IOrder.IOrderService;
using Application.Interfaces.IStatus;
using Application.Models.Request;
using Application.Models.Responses.Order;

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

                (1, 5) => true, // Pendiente -> Cancelado/Cerrado
                _ => false      // Cualquier otra transición no es válida
            };

            if (!isValidTransition)
            {
                throw new BadRequestException($"No se puede cambiar de estado '{currentStatus}' a '{newStatus}'.");
            }

            // Actualizar el estado del item y la fecha de la orden
            itemToUpdate.Status = newStatus;

            // CAMBIO CLAVE 2: Recalcular el precio total de la orden.
            decimal newTotal = 0;
            foreach (var item in order.OrderItems)
            {
                // Solo sumamos los ítems que NO están cancelados/cerrados.
                if (item.Status != (int)StatusOrderEnum.Closed)
                {
                    // Es crucial que item.Dish no sea nulo, por eso el cambio en la consulta.
                    if (item.Dish != null)
                    {
                        newTotal += item.Dish.Price * item.Quantity;
                    }
                }
            }

            // Asignamos el nuevo precio y la fecha de actualización.
            order.Price = newTotal;
            order.UpdateDate = DateTime.UtcNow;

            // Lógica mejorada para el estado general de la orden
            var activeItems = order.OrderItems.Where(i => i.Status != (int)StatusOrderEnum.Closed).ToList();
            if (activeItems.Any() && activeItems.All(i => i.Status == activeItems.First().Status))
            {
                order.OverallStatus = activeItems.First().Status;
            }
            else if (!activeItems.Any()) // Si no quedan items activos
            {
                order.OverallStatus = (int)StatusOrderEnum.Closed;
            }

            // Guardar todos los cambios en la orden y sus ítems.
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
