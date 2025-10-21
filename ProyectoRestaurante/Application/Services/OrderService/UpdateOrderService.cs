using Application.Exceptions;
using Application.Interfaces.IDish;
using Application.Interfaces.IOrder;
using Application.Interfaces.IOrder.IOrderService;
using Application.Interfaces.IOrderItem;
using Application.Models.Request;
using Application.Models.Responses.Order;
using Application.Enums;
using Domain.Entities;


namespace Application.Services.OrderService
{
    public class UpdateOrderService : IUpdateOrderService
    {
        private readonly IOrderQuery _orderQuery;
        private readonly IOrderCommand _orderCommand;
        private readonly IOrderItemCommand _orderItemCommand;
        private readonly IDishQuery _dishQuery;

        public UpdateOrderService(IOrderQuery orderQuery, IOrderCommand orderCommand, IOrderItemCommand orderItemCommand, IDishQuery dishQuery)
        {
            _orderQuery = orderQuery;
            _orderCommand = orderCommand;
            _orderItemCommand = orderItemCommand;
            _dishQuery = dishQuery;
        }
        public async Task<OrderUpdateResponse> UpdateOrder(long orderId, OrderUpdateRequest ItemRequest)
        {
            // Validacion 1 Orden Encontrada y Modificable
            var order = await _orderQuery.GetOrderById(orderId);
            if (order == null)
            {
                throw new NotFoundException($"La orden con ID {orderId} no existe.");
            }
            if (order.OverallStatus >= (int)StatusOrderEnum.InProgress) 
            {
                throw new BadRequestException("No se puede modificar una orden que ya está en preparación.");
            }
            // items validos
            if (ItemRequest.Items == null || !ItemRequest.Items.Any())
                throw new BadRequestException("La orden debe contener al menos un ítem.");
            if (ItemRequest.Items.Any(item => item.quantity < 0))
                throw new BadRequestException("La cantidad de cada ítem debe ser igual o mayor a 0.");
            
            // platos validos optimizados
            var dishIds = ItemRequest.Items.Select(i => i.id).ToList();
            var dishesFromDb = await _dishQuery.GetDishesByIds(dishIds);
            var dishDictionary = dishesFromDb.ToDictionary(d => d.DishId);

            if (dishesFromDb.Count != dishIds.Count)
                throw new BadRequestException("Uno o más platos especificados no existen.");
            if (dishesFromDb.Any(d => !d.Available))
                throw new BadRequestException("Uno o más platos especificados no están disponibles.");


            // Lista para los ítems que se van a borrar
            var itemsToRemove = new List<OrderItem>();

            foreach (var itemRequest in ItemRequest.Items)
            {
                var existingItem = order.OrderItems.FirstOrDefault(oi => oi.DishId == itemRequest.id);

                if (itemRequest.quantity > 0)
                {
                    // logica o actualizar
                    var dish = dishDictionary[itemRequest.id]; // Plato ya validado

                    if (existingItem != null)
                    {
                        // Actualizar ítem existente
                        existingItem.Quantity = itemRequest.quantity;
                        existingItem.Notes = itemRequest.notes;
                    }
                    else
                    {
                        // Añadir ítem nuevo
                        var newItem = new OrderItem
                        {
                            // OrderId se setea por EF por navegación
                            DishId = itemRequest.id,
                            Quantity = itemRequest.quantity,
                            Notes = itemRequest.notes,
                            Status = 1, // Pendiente
                        };
                        order.OrderItems.Add(newItem); // EF rastrea esto como 'Added'
                    }
                }
                else // itemRequest.quantity == 0
                {
                    // logica borrado
                    if (existingItem != null)
                    {
                        itemsToRemove.Add(existingItem);
                    }
                    // Si no existía y la cantidad es 0, no hacemos nada.
                }
            }

            // se ejecuta borrado
            if (itemsToRemove.Any())
            {
                await _orderItemCommand.DeleteOrderItems(itemsToRemove);
                foreach (var item in itemsToRemove)
                {
                    order.OrderItems.Remove(item);
                }
            }
            if (!order.OrderItems.Any())
            {
                order.OverallStatus = (int)StatusOrderEnum.Closed;
            }




            // actualizar la orden principal
            order.Price = await Calculate(order.OrderItems.ToList());
            order.UpdateDate = DateTime.UtcNow;
            await _orderCommand.UpdateOrder(order);

            return new OrderUpdateResponse
            {
                orderNumber = (int) order.OrderId,
                totalAmount = (double)order.Price,
                updateAt = order.UpdateDate //modificar
            };
        }
        private async Task<decimal> Calculate(List<OrderItem> newOrderItems)
        {
            // 2. Obtenemos los IDs de TODOS los ítems en la lista
            var dishIds = newOrderItems.Select(i => i.DishId).Distinct().ToList();

            // 3. Usamos el _dishQuery de la clase para obtener TODOS los platos
            var dishes = await _dishQuery.GetDishesByIds(dishIds);
            var dishObt = dishes.ToDictionary(d => d.DishId);

            decimal total = 0;

            foreach (var item in newOrderItems)
            {
                // El resto de tu lógica funciona perfecto
                if (dishObt.TryGetValue(item.DishId, out var dish))
                {
                    total += dish.Price * item.Quantity;
                }
                else
                {
                    // (Es bueno tener un control por si algo falla)
                    throw new NotFoundException($"No se pudo encontrar el precio del plato con ID {item.DishId} al recalcular el total.");
                }
            }
            return total;
        }
    }
}
