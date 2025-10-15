using Application.Enums;
using Application.Exceptions;
using Application.Interfaces.ICategory.ICategoryService;
using Application.Interfaces.IDish.IDishService;
using Application.Models.Request;
using Application.Models.Response;
using Application.Models.Responses.Dish;
using Asp.Versioning;
using Domain.Entities;
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
        private readonly IGetDishByIdService _getDishByIdService;
        private readonly ICategoryExistService _categoryExistService;
        private readonly IDeleteDishService _deletedishService;


        public DishController(ICreateDishService dishCreate, ISearchAsyncService dishAsync, IUpdateDishService dishUpdate, IGetDishByIdService getDishByIdService, ICategoryExistService categoryExistService, IDeleteDishService deletedishService)
        {
            _dishCreate = dishCreate;
            _dishAsync = dishAsync;
            _dishUpdate = dishUpdate;
            _getDishByIdService = getDishByIdService;
            _categoryExistService = categoryExistService;
            _deletedishService = deletedishService;
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
        /// <param name="dishRequest">Datos del plato a crear.</param>
        /// <returns>El plato recién creado.</returns>
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
            try
            {
                var createdDish = await _dishCreate.CreateDish(dishRequest);
                return CreatedAtAction(nameof(GetDishById), new { id = createdDish.id }, createdDish);
            }
            catch (BadRequestException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
            catch (ConflictException ex)
            {
                return Conflict(new ApiError(ex.Message));
            }
        }

        //GET
        /// <summary>
        /// Buscar platos
        /// </summary>
        /// <remarks>
        /// Obtiene una lista de platos del menú con opciones de filtrado y ordenamiento.
        /// 
        /// **Filtros disponibles:**
        /// - Por nombre(búsqueda parcial)
        /// - Por categoría
        /// - Solo platos activos/todos
        /// 
        /// **Ordenamiento:**
        /// - Por precio ascendente o descendente
        /// - Sin ordenamiento específico
        /// 
        /// **Casos de uso:**
        ///
        /// - Mostrar menú completo a los clientes
        /// - Buscar platos específicos
        /// - Filtrar por categorías(entrantes, principales, postres)
        /// - Administración del menú(incluyendo platos inactivos)
        /// </remarks>
        /// <param name="name">Buscar platos por nombre (búsqueda parcial).</param>
        /// <param name="category">Filtrar por ID de categoría de plato.</param>
        /// <param name="sortByPrice">Ordenar por precio. Valores permitidos: `asc`, `desc`.</param>
        /// <param name="onlyActive">Filtrar por estado. `true` para solo disponibles, `false` para todos.</param>
        /// <returns>Una lista de platos que coinciden con los criterios.</returns>
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
            try
            { 
                var list = await _dishAsync.SearchAsync(name, category, onlyActive, sortByPrice);
                return Ok(list);
            }
            catch (BadRequestException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
        }

        //GET by id
        /// <summary>
        /// Obtiene un plato por su ID.
        /// </summary>
        /// <remarks>
        /// Obtiene los detalles completos de un plato específico.
        ///
        /// **Casos de uso:**
        ///
        /// - Ver detalles de un plato antes de agregarlo a la orden
        /// - Mostrar información detallada en el menú
        /// - Verificación de disponibilidad
        /// <param name="id">ID único del plato</param>
        /// </remarks>
        [HttpGet("{id}")]
        [SwaggerOperation(
        Summary = "Buscar platos por ID",
        Description = "Actualiza todos los campos de un plato existente en el menú."
        )]
        [ProducesResponseType(typeof(DishResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetDishById(Guid id)
        {
            try
            {
                var dish = await _getDishByIdService.GetDishById(id);
                return Ok(dish);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new ApiError(ex.Message));
            }
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
        /// <param name="id">ID único del plato a actualizar.</param>
        /// <param name="dishRequest">Datos actualizados del plato.</param>
        /// <returns>El plato actualizado.</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(DishResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> UpdateDish(Guid id, [FromBody] DishUpdateRequest dishRequest)
        {
            try
            {
                var updatedDish = await _dishUpdate.UpdateDish(id, dishRequest);
                return Ok(updatedDish);
            }
            catch (BadRequestException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
            catch (NotFoundException ex)
            {
                return NotFound(new ApiError(ex.Message));
            }
            catch (ConflictException ex)
            {
                return Conflict(new ApiError(ex.Message));
            }
        }


        //DELETE
        /// <summary>
        /// Eliminar plato
        /// </summary>
        /// <remarks>
        /// Elimina un plato del menú del restaurante.
        /// 
        /// ## Importante:
        /// * Solo se pueden eliminar platos que no estén en órdenes activas
        /// * Típicamente se recomienda desactivar (isActive=false) en lugar de eliminar
        /// 
        /// ## Casos de error 409:
        /// * El plato está incluido en órdenes pendientes o en proceso
        /// * El plato tiene dependencias que impiden su eliminación
        /// </remarks>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> DeleteDish(Guid id)
        {
            try
            {
                var result = await _deletedishService.DeleteDish(id);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new ApiError(ex.Message));
            }
            catch (ConflictException ex)
            {
                return Conflict(new ApiError(ex.Message));
            }
        }


    }
}
