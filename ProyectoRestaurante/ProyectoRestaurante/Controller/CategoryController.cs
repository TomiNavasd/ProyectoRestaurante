using Application.Services.CategoryService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Application.Interfaces.ICategory.ICategoryService;

namespace ProyectoRestaurante.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly IGetAllCategoriesService _categoryGetAll;

        public CategoryController(IGetAllCategoriesService service)
        {
            _categoryGetAll = service;
        }

        // GET: api/v1/Category
        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            try
            {
                var categories = await _categoryGetAll.GetAllCategories();
                // Devolvemos un código 200 OK con la lista de categorías.
                return Ok(categories);
            }
            catch (Exception ex)
            {
                // En caso de un error inesperado, devolvemos un 500.
                return StatusCode(500, "Ocurrió un error interno en el servidor.");
            }
        }
    }
}
