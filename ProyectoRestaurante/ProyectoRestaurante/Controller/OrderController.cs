using Application.Interfaces.IOrder.IOrderService;
using Application.Models.Request;
using Application.Models.Response;
using Application.Models.Responses.Order;
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
        public OrderController(ICreateOrderService createOrderService, IGetOrderFechaStatusService getOrderFechaStatusService)
        {
            _createOrderService = createOrderService;
            _getOrderFechaStatusService = getOrderFechaStatusService;
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
    }
}
