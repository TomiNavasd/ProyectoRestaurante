using Application.Exceptions;
using Application.Interfaces.IOrder;
using Application.Interfaces.IOrder.IOrderService;
using Application.Interfaces.IStatus;
using Application.Models.Response;
using Application.Models.Responses.Dish;
using Application.Models.Responses.Order;
using Application.Models.Responses.OrderItem;

namespace Application.Services.OrderService
{
    public class GetOrderFechaStatusService : IGetOrderFechaStatusService
    {
        private readonly IOrderQuery _orderQuery;
        private readonly IStatusQuery _statusQuery;
        public GetOrderFechaStatusService(IOrderQuery orderQuery, IStatusQuery statusQuery)
        {
            _orderQuery = orderQuery;
            _statusQuery = statusQuery;
        }
        public async Task<IEnumerable<OrderDetailsResponse?>> GetOrderFechaStatus(DateTime? from, DateTime? to, int? statusid)
        {
            // Validación de Rango de Fechas
            if (from.HasValue && to.HasValue && from.Value > to.Value)
            {
                throw new BadRequestException("Rango de fechas inválido: la fecha 'desde' no puede ser posterior a la fecha 'hasta'.");
            }
            // Validación de existencia del Status
            if (statusid.HasValue)
            {
                var statusExists = await _statusQuery.StatusExists(statusid.Value);
                if (!statusExists)
                {
                    throw new BadRequestException($"El estado con ID {statusid.Value} no es válido.");
                }
            }
            var orders = await _orderQuery.GetOrderFechaStatus(from, to, statusid);
            var orderResponses = orders.Select(o => new OrderDetailsResponse
            {
                orderNumber = (int)o.OrderId,
                totalAmount = (double)o.Price,
                deliveryTo = o.DeliveryTo,
                notes = o.Notes,
                status = new GenericResponse { Id = o.OverallStatus, Name = o.OverallStatusEnt.Name},
                deliveryType = new GenericResponse { Id = o.DeliveryType, Name = o.DeliveryTypeEnt.Name},
                items = o.OrderItems.Select(oi => new OrderItemResponse
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
                createdAt = o.CreateDate,
                updatedAt = o.UpdateDate
            });
            return orderResponses;
        }
    }
}
