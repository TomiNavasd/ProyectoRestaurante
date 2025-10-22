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

            int newStatus = request.status;
            var statusExists = await _statusQuery.StatusExists(newStatus);
            if (!statusExists)
            {
                throw new BadRequestException("El estado especificado no es válido.");
            }

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

            itemToUpdate.Status = newStatus;

            decimal newTotal = 0;
            foreach (var item in order.OrderItems)
            {
                // solo sumamos los ítems que NO están cancelados/cerrados.
                if (item.Status != (int)StatusOrderEnum.Closed)
                {
                    // es crucial que item.Dish no sea nulo, por eso el cambio en la consulta.
                    if (item.Dish != null)
                    {
                        newTotal += item.Dish.Price * item.Quantity;
                    }
                }
            }

            // asignamos el nuevo precio y la fecha de actualización.
            order.Price = newTotal;
            order.UpdateDate = DateTime.UtcNow;

            var activeItems = order.OrderItems.Where(i => i.Status != (int)StatusOrderEnum.Closed).ToList();
            if (activeItems.Any() && activeItems.All(i => i.Status == activeItems.First().Status))
            {
                order.OverallStatus = activeItems.First().Status;
            }
            else if (!activeItems.Any()) // si no quedan items activos
            {
                order.OverallStatus = (int)StatusOrderEnum.Closed;
            }

            // guardar todos los cambios en la orden y sus ítems.
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
