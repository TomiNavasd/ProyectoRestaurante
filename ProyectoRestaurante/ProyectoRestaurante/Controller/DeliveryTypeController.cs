using Application.Interfaces.IDeliveryType.IDeliveryTypeService;
using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ProyectoRestaurante.Controller
{
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    public class DeliveryTypeController : ControllerBase
    {
        private readonly IGetAllDeliveryTypeService _getAllDeliveryTypeService;
        public DeliveryTypeController(IGetAllDeliveryTypeService getAllDeliveryTypeService)
        {
            _getAllDeliveryTypeService = getAllDeliveryTypeService;
        }
        // GET
        /// <summary>
        /// Obtener tipos de entrega
        /// </summary>
        /// <remarks>
        /// Obtiene todos los tipos de entrega disponibles para las órdenes.
        /// 
        /// ## Casos de uso:
        ///
        /// * Mostrar opciones de entrega al cliente durante el pedido
        /// * Configurar diferentes métodos de entrega
        /// * Calcular costos de envío según el tipo
        /// </remarks>
        [HttpGet]
        public async Task<IActionResult> GetAllDeliveryTypes()
        {
            try
            {
                var deliveryTypes = await _getAllDeliveryTypeService.GetAllDeliveryType();
                return Ok(deliveryTypes);
            }
            catch (Exception ex)
            { 
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
