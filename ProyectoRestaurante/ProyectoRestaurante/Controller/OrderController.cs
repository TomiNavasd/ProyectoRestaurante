using Application.Interfaces.IOrder.IOrderService;
using Application.Models.Request;
using Application.Models.Response;
using Application.Models.Responses.Order;
using Application.Services.OrderService;
using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
        /// Crear nueva orden.
        /// </summary>
        /// <remarks>
        /// Crea un nueva orden en el menú del restaurante.
        /// </remarks>
        [HttpPost]
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
                Console.WriteLine(ex.Message);
                return BadRequest(new ApiError("An error occurred while processing the request."));
            }
        }

        //GET
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<OrderDetailsResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOrders([FromQuery] int? statusId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            //sacar try
            try
            {
                var result = await _getOrderFechaStatusService.GetOrderFechaStatus(from, to, statusId);
                if (result == null || !result.Any())
                {
                    return NotFound(new ApiError("No orders found with the specified filters."));
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return BadRequest(new ApiError("An error occurred while processing the request."));
            }
        }

        // PUT: api/v1/order/1001
        [HttpPut("{orderId}")]
        public async Task<IActionResult> UpdateOrder(int orderId, [FromBody] OrderUpdateRequest request)
        {
            try
            {
                var response = await _updateOrderService.UpdateOrder(orderId, request);
                return Ok(response); // Respuesta 200 OK
            }
            catch (Exception ex)
            {
                // Si la orden no está en estado "Pending", devolverá un 400
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/v1/order/1001
        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrderById(long orderId)
        {
            var response = await _getOrderByIdService.GetOrderById(orderId);

            if (response == null)
            {
                return NotFound(new { message = "Orden no encontrada" }); // 404 Not Found
            }

            return Ok(response); // 200 OK
        }


        // PATCH: api/v1/order/1001/item/1
        [HttpPatch("{orderId}/item/{itemId}")]
        public async Task<IActionResult> UpdateOrderItemStatus(long orderId, int itemId, [FromBody] OrderItemUpdateRequest request)
        {
            try
            {
                var response = await _updateStatusService.UpdateStatus(orderId, itemId, request);
                return Ok(response); // 200 OK
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message }); // 404 Not Found
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message }); // 400 Bad Request
            }
            catch (Exception ex)
            {
                // Otro error inesperado
                return StatusCode(500, new { message = "Ocurrió un error inesperado." });
            }
        }


    }
}
