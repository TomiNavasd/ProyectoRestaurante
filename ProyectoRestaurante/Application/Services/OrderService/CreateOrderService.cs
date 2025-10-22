using Application.Exceptions;
using Application.Interfaces.IDeliveryType;
using Application.Interfaces.IDish;
using Application.Interfaces.IOrder;
using Application.Interfaces.IOrder.IOrderService;
using Application.Interfaces.IOrderItem;
using Application.Models.Request;
using Application.Models.Responses.Order;
using Domain.Entities;


namespace Application.Services.OrderService
{
    
    public class CreateOrderService : ICreateOrderService
    {
        private readonly IOrderCommand _orderCommand;
        private readonly IDeliveryTypeQuery _deliveryTypeQuery;
        private readonly IDishQuery _dishQuery;
        private readonly IOrderItemCommand _orderItemCommand;

        public CreateOrderService(IOrderCommand orderCommand, IDeliveryTypeQuery deliveryTypeQuery, IDishQuery dishQuery, IOrderItemCommand orderItemCommand)
        {
            _orderCommand = orderCommand;
            _deliveryTypeQuery = deliveryTypeQuery;
            _dishQuery = dishQuery;
            _orderItemCommand = orderItemCommand;
        }
        public async Task<OrderCreateResponse?> CreateOrder(OrderRequest orderRequest)
        {
            var delivery = orderRequest.delivery;
            if (delivery == null)
            {
                throw new BadRequestException("Debe especificar un tipo de entrega válido.");
            }

            switch (delivery.id)
            {
                case 1: // Delivery
                    if (string.IsNullOrWhiteSpace(delivery.to))
                    {
                        throw new BadRequestException("Para el tipo 'Delivery', se requiere una dirección de destino.");
                    }
                    break;
                case 2: // Take Away (Retiro en local)
                    if (string.IsNullOrWhiteSpace(delivery.to))
                    {
                        throw new BadRequestException("Para el tipo 'Take Away', se requiere el nombre del cliente.");
                    }
                    break;
                case 3: // Dine In (Comer en el local)
                    if (string.IsNullOrWhiteSpace(delivery.to))
                    {
                        throw new BadRequestException("Para el tipo 'Dine In', se requiere un número de mesa válido.");
                    }
                    break;
            }

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

            // Convertir a Diccionario para búsqueda rápida (Opcional pero recomendado)
            var dishDictionary = dishesFromDb.ToDictionary(d => d.DishId);

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
                UpdateDate = DateTime.UtcNow,
                CreateDate = DateTime.UtcNow
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

            order.Price = CalculateTotalPrice(listadeItems, dishDictionary);

            await _orderItemCommand.InsertOrderItems(listaorderItems);
            await _orderCommand.UpdateOrder(order);
            

            return new OrderCreateResponse
            {
                orderNumber = (int) order.OrderId,
                totalAmount = (double)order.Price,
                createdAt = DateTime.UtcNow
            };

        }
        private decimal CalculateTotalPrice(List<Items> orderItems, Dictionary<Guid, Dish> dishDictionary)
        {
            decimal totalPrice = 0;
            foreach (var item in orderItems)
            {
                // Busca el plato en el diccionario (mucho más rápido)
                if (dishDictionary.TryGetValue(item.id, out var dish))
                {
                    totalPrice += dish.Price * item.quantity;
                }
                else
                {
                    // Esto no debería ocurrir si las validaciones anteriores están bien, pero es buena práctica
                    throw new NotFoundException($"Plato con ID {item.id} no encontrado en la lista pre-cargada durante el cálculo del total.");
                }
            }
            return totalPrice;
        }
    }
}
