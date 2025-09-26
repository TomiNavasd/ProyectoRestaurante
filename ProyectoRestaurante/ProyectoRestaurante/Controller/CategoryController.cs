using Application.Interfaces.ICategory.ICategoryService;
using Application.Services.CategoryService;
using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ProyectoRestaurante.Controller
{
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    public class CategoryController : ControllerBase
    {
        private readonly IGetAllCategoriesService _categoryGetAll;

        public CategoryController(IGetAllCategoriesService service)
        {
            _categoryGetAll = service;
        }

        // GET
        /// <summary>
        /// Obtener categorias de platos
        /// </summary>
        /// <remarks>
        /// Obtiene todas las categorías disponibles para clasificar platos.
        /// 
        /// ## Casos de uso:
        ///
        /// * Mostrar categorías en formularios de creación/edición de platos
        /// * Filtros de búsqueda en el menú
        /// * Organización del menú por secciones
        /// </remarks>
        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            try
            {
                var categories = await _categoryGetAll.GetAllCategories();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Ocurrió un error interno en el servidor.");
            }
        }
    }
}
