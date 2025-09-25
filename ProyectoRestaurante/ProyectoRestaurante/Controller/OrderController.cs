using Application.Exceptions;
using Application.Interfaces.IOrder.IOrderService;
using Application.Models.Request;
using Application.Models.Response;
using Application.Models.Responses.Order;
using Application.Services.OrderService;
using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace ProyectoRestaurante.Controller
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [ApiVersion("1.0")]
    public class OrderController : ControllerBase
    {
        private readonly ICreateOrderService _createOrderService;
        private readonly IGetOrderFechaStatusService _getOrderFechaStatusService;
        private readonly IUpdateOrderService _updateOrderService;
        private readonly IUpdateOrderItemStatusService _updateStatusService;
        private readonly IGetOrderByIdService _getOrderByIdService;
        public OrderController(ICreateOrderService createOrderService, IGetOrderFechaStatusService getOrderFechaStatusService, IUpdateOrderService updateOrderService, IUpdateOrderItemStatusService updateStatusService, IGetOrderByIdService getOrderByIdService)
        {
            _createOrderService = createOrderService;
            _getOrderFechaStatusService = getOrderFechaStatusService;
            _updateOrderService = updateOrderService;
            _updateStatusService = updateStatusService;
            _getOrderByIdService = getOrderByIdService;
        }

        // POST
        /// <summary>
        /// Crea una nueva orden
        /// </summary>
        /// <remarks>
        /// Crea una nueva orden con los platos solicitados por el cliente.
        /// 
        /// **Proceso:**
        /// 1. Se valida que todos los platos existan y estén activos
        /// 2. Se calcula el total de la orden
        /// 3. Se asigna un número de orden único
        /// 4. Se crean los items individuales de la orden
        /// 
        /// **Validaciones:**
        /// - Los platos deben existir y estar activos
        /// - Las cantidades deben ser mayores a 0
        /// - Debe especificarse tipo de entrega
        /// </remarks>
        [HttpPost]
        [SwaggerOperation(
        Summary = "Crea una nueva orden",
        Description = "Crea una nueva orden con los platos solicitados por el cliente."
        )]
        [ProducesResponseType(typeof(OrderCreateResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status409Conflict)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateOrder([FromBody] OrderRequest orderRequest)
        {
            try
            {
                var result = await _createOrderService.CreateOrder(orderRequest);

                return CreatedAtAction(nameof(CreateOrder), new { id = result.orderNumber }, result);

            }
            catch (Exception ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
        }

        //GET
        /// <summary>
        /// Buscar órdenes
        /// </summary>
        /// <remarks>
        /// Obtiene una lista de órdenes con filtros opcionales.
        /// 
        /// **Filtros disponibles:**
        /// - Por rango de fechas (desde/hasta)
        /// - Por estado de la orden
        /// 
        /// **Casos de uso:**
        /// - Ver órdenes del día para cocina
        /// - Historial de órdenes del cliente
        /// - Reportes de ventas por período
        /// - Seguimiento de órdenes pendientes
        /// </remarks>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<OrderDetailsResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetOrders([FromQuery] int? statusId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            try
            {
                var result = await _getOrderFechaStatusService.GetOrderFechaStatus(from, to, statusId);
                return Ok(result);
            }
            catch (BadRequestException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
        }

        // PUT: api/v1/order/1001
        /// <summary>
        /// Actualizar una orden existente
        /// </summary>
        /// <remarks>
        /// Actualiza los items de una orden existente.
        /// 
        /// **Limitaciones:**
        /// - Solo se pueden actualizar órdenes que no esten cerradas
        /// - No se pueden agregar items de platos inactivos
        /// - El total se recalcula automáticamente
        /// 
        /// **Casos de uso:**
        /// - Cliente quiere agregar más platos a su orden
        /// - Modificar cantidades antes de que comience la preparación
        /// - Cambiar notas especiales de los platos
        /// </remarks>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(OrderUpdateResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] OrderUpdateRequest request)
        {
            try
            {
                var response = await _updateOrderService.UpdateOrder(id, request);
                return Ok(response);
            }
            catch (NotFoundException ex)
            {
                // Si el servicio lanza que la orden no existe...
                return NotFound(new ApiError(ex.Message));
            }
            catch (BadRequestException ex)
            {
                // Si el servicio lanza cualquier error de validación (orden en preparación, plato inactivo, etc.)...
                return BadRequest(new ApiError(ex.Message));
            }
        }

        // GET: api/v1/order/1001
        /// <summary>
        /// Obtener orden por número
        /// </summary>
        /// <remarks>
        /// Obtiene los detalles completos de una orden específica.
        /// 
        /// **Información incluida:**
        /// - Detalles de la orden (número, total, estado)
        /// - Información de entrega
        /// - Lista completa de items con sus estados individuales
        /// - Información de cada plato incluido
        /// 
        /// **Casos de uso:**
        /// - Seguimiento de orden por parte del cliente
        /// - Detalles para cocina y entrega
        /// - Historial detallado de órdenes
        /// </remarks>
        [HttpGet("{id}")]
        [SwaggerOperation(
            Summary = "Obtener orden por número",
            Description = "Obtiene los detalles completos de una orden específica."
        )]
        [ProducesResponseType(typeof(OrderDetailsResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOrderById(long id)
        {
            try
            {
                var response = await _getOrderByIdService.GetOrderById(id);
                return Ok(response);
            }
            catch (NotFoundException ex)
            {
                // Atrapa la excepción específica del servicio y devuelve 404 Not Found.
                return NotFound(new ApiError(ex.Message));
            }
        }


        // PATCH: api/v1/order/1001/item/1
        /// <summary>
        /// Actualizar estado de item individual
        /// </summary>
        /// <remarks>
        /// Actualiza el estado de un item específico dentro de una orden.
        /// 
        /// **Casos de uso típicos:**
        /// - Cocina marca un plato como "En preparación"
        /// - Cocina marca un plato como "Listo"
        /// - Cancelar un item específico si no se puede preparar
        /// 
        /// **Flujo de estados típico:**
        /// 1. Pendiente → En preparación (cocina comienza)
        /// 2. En preparación → Listo (plato terminado)
        /// 3. Listo → Entregado (entregado al cliente)
        /// 
        /// Nota: El estado de la orden general se actualiza automáticamente basado en el estado de todos sus items.
        /// </remarks>
        [HttpPatch("{id}/item/{itemId}")]
        [SwaggerOperation(
            Summary = "Actualizar estado de item individual",
            Description = "Actualiza el estado de un item específico dentro de una orden."
        )]
        [ProducesResponseType(typeof(OrderUpdateResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateOrderItemStatus(long id, int itemId, [FromBody] OrderItemUpdateRequest request)
        {
            try
            {
                var response = await _updateStatusService.UpdateStatus(id, itemId, request);
                return Ok(response);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new ApiError(ex.Message));
            }
            catch (BadRequestException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
        }


    }
}
