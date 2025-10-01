using Application.Interfaces.IStatus.IStatusService;
using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ProyectoRestaurante.Controller
{
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    public class StatusController : ControllerBase
    {
        private readonly IGetAllStatusService _getAllStatusService;
        public StatusController(IGetAllStatusService getAllStatusService)
        {
            _getAllStatusService = getAllStatusService;
        }
        // GET
        /// <summary>
        /// Obtener estados de órdenes
        /// </summary>
        /// <remarks>
        /// Obtiene todos los estados posibles para las órdenes y sus items.
        /// 
        /// ## Estados típicos:
        ///
        /// * Pendiente: orden recién creada
        /// * En preparación: cocina comenzó a preparar
        /// * Listo: orden lista para entregar
        /// * Entregado: orden completada
        /// * Cerrado: orden cerrada
        /// </remarks>
        [HttpGet]
        public async Task<IActionResult> GetAllStatus()
        {
            try
            {
                var statuses = await _getAllStatusService.GetAllStatus();
                return Ok(statuses);
            }
            catch (Exception ex)
            { 
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
