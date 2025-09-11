using Application.Enums;
using Application.Interfaces.IDish.IDishService;
using Application.Models.Request;
using Application.Models.Response;
using Application.Models.Responses;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Numerics;

namespace ProyectoRestaurante.Controller
{
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    public class DishController : ControllerBase
    {
        private readonly ICreateDishService _dishCreate;
        private readonly IUpdateDishService _dishUpdate;
        private readonly ISearchAsyncService _dishAsync;
         

        public DishController(ICreateDishService dishCreate, ISearchAsyncService dishAsync, IUpdateDishService dishUpdate)
        {
            _dishCreate = dishCreate;
            _dishAsync = dishAsync;
            _dishUpdate = dishUpdate;
        }

        // POST
        /// <summary>
        /// Crear nuevo plato
        /// </summary>
        /// <remarks>
        /// Crea un nuevo plato en el menú del restaurante.
        ///
        /// ## Validaciones:
        /// * El nombre del plato debe ser único
        /// * El precio debe ser mayor a 0
        /// * La categoría debe debe existir en el sistema
        ///
        /// ## Casos de uso:
        /// * Agregar nuevos platos al menú
        /// * Platos estacionales o especiales del chef
        /// </remarks>
        [HttpPost]
        [SwaggerOperation(
            Summary = "Crear nuevo plato",
            Description = "Crea un nuevo plato en el menú del restaurante."
        )]
        [ProducesResponseType(typeof(DishResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status409Conflict)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateDish([FromBody] DishRequest dishRequest)
        {

            if (dishRequest == null)
            {
                return BadRequest(new ApiError("Los datos del plato son necesarios"));
            }
            if (string.IsNullOrWhiteSpace(dishRequest.Name))
            {
                return BadRequest(new ApiError("No se ingreso nombre del plato"));
            }
            if (dishRequest.Category == 0 || dishRequest.Category >= 11)
            {
                return BadRequest(new ApiError("No se ingreso una categoria valida"));
            }
            if (dishRequest.Price <= 0)
            {
                return BadRequest(new ApiError("El precio debe ser mayor a cero"));
            }

            var createdDish = await _dishCreate.CreateDish(dishRequest);

            if (createdDish == null)
            {
                return Conflict(new ApiError($"El plato {dishRequest.Name} ya existe"));
            }

            return CreatedAtAction(nameof(Search), new { id = createdDish.id }, createdDish);
        }

        //GET
        /// <summary>
        /// Buscar platos
        /// </summary>
        /// <remarks>
        /// Obtiene una lista de platos del menú con opciones de filtrado y ordenamiento.
        /// 
        /// ## Filtros disponibles:
        /// * Por nombre(búsqueda parcial)
        /// * Por categoría
        /// * Solo platos activos/todos
        /// 
        /// ## Ordenamiento:
        /// * Por precio ascendente o descendente
        /// * Sin ordenamiento específico
        /// 
        /// ## Casos de uso:
        ///
        /// * Mostrar menú completo a los clientes
        /// * Buscar platos específicos
        /// * Filtrar por categorías(entrantes, principales, postres)
        /// * Administración del menú(incluyendo platos inactivos)
        /// </remarks>
        [HttpGet]
        [SwaggerOperation(
        Summary = "Buscar platos",
        Description = "Obtiene una lista de platos del menú con opciones de filtrado y ordenamiento."
        )]
        [ProducesResponseType(typeof(IEnumerable<DishResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Search(
            [FromQuery] string? name,
            [FromQuery] int? category,
            [FromQuery] OrderPrice? sortByPrice = OrderPrice.asc,
            [FromQuery] bool? onlyActive = null)
            

        {
            if (category == 0 || category >= 11)
            {
                return BadRequest(new ApiError("No se ingreso una categoria valida"));
            }
            var list = await _dishAsync.SearchAsync(name, category, onlyActive, sortByPrice);
            if (list == null || !list.Any())
            {
                return BadRequest(new ApiError("No se encontraron platos que coincidan con los criterios."));
            }
            


            return Ok(list);

        }

        //PUT
        /// <summary>
        /// Actualizar plato existente
        /// </summary>
        /// <remarks>
        /// Actualiza todos los campos de un plato existente en el menú.
        /// 
        /// ## Validaciones:
        /// * El plato debe existir en el sistema
        /// * Si se cambia el nombre, debe ser único
        /// * El precio debe ser mayor a 0
        /// * La categoría debe existir
        /// 
        /// ## Casos de uso:
        ///
        /// * Actualizar precios de platos
        /// * Modificar descripciones o ingredientes
        /// * Cambiar categorías de platos
        /// * Activar/desactivar platos del menú
        /// * Actualizar imágenes de platos
        /// </remarks>
        [HttpPut("{id}")]
        [SwaggerOperation(
        Summary = "Actualizar plato existente",
        Description = "Actualiza todos los campos de un plato existente en el menú."
        )]
        [ProducesResponseType(typeof(DishResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> UpdateDish(Guid id, [FromBody] DishUpdateRequest dishRequest)
        {
            if (dishRequest == null)
            {
                return BadRequest(new ApiError("Los datos del plato son necesarios"));
            }
            if (string.IsNullOrWhiteSpace(dishRequest.Name))
            {
                return BadRequest(new ApiError("No se ingreso nombre del plato"));
            }
            if (dishRequest.Category == 0)
            {
                return BadRequest(new ApiError("No se ingreso una categoria valida"));
            }
            if (dishRequest.Price <= 0)
            {
                return BadRequest(new ApiError("El precio debe ser mayor a cero"));
            }

            var result = await _dishUpdate.UpdateDish(id, dishRequest);
            if (result.NotFound)
            {
                return NotFound(new ApiError($"El plato con la id {id} no fue encontrado."));
            }

            if (result.NameConflict)
            {
                return Conflict(new ApiError($"El plato {dishRequest.Name} ya existe"));
            }

            return Ok(result.UpdatedDish);
        }
    }
}
