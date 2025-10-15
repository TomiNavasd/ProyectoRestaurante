using Application.Exceptions;
using Application.Interfaces.ICategory;
using Application.Interfaces.IDish;
using Application.Interfaces.IDish.IDishService;
using Application.Models.Request;
using Application.Models.Response;
using Application.Models.Responses.Dish;
using Domain.Entities;

namespace Application.Services.DishService
{
    public class CreateDishService : ICreateDishService
    {
        private readonly IDishQuery _dishQuery;
        private readonly IDishCommand _dishCommand;
        private readonly ICategoryQuery _categoryQuery;
        public CreateDishService(IDishQuery dishQuery, IDishCommand dishCommand, ICategoryQuery categoryQuery)
        {
            _dishQuery = dishQuery;
            _dishCommand = dishCommand;
            _categoryQuery = categoryQuery;
        }

        public async Task<DishResponse?> CreateDish(DishRequest dishRequest)
        {
            // Dejo solo las validaciones de negocio
            // Validación de existencia de la Categoría
            var category = await _categoryQuery.GetCategoryById(dishRequest.Category);
            if (category == null)
            { throw new BadRequestException($"La categoría con ID {dishRequest.Category} no existe."); }
            // Validación de conflicto por nombre duplicado
            var dishExists = await _dishQuery.FoundDish(dishRequest.Name);
            if (dishExists)
            { throw new ConflictException($"El plato con el nombre '{dishRequest.Name}' ya existe.");}


            var newDish = new Dish
            {
                // Mapeo manual de las propiedades
                Name = dishRequest.Name,
                Description = dishRequest.Description,
                Price = dishRequest.Price,
                Category = dishRequest.Category,
                Available = true,
                ImageUrl = dishRequest.Image,
                // Otras propiedades como CreateDate, UpdateDate, etc.
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow
            };

            var createdDish = await _dishCommand.CreateDish(newDish);


            var response = new DishResponse
            {
                id = createdDish.DishId,
                name = createdDish.Name,
                description = createdDish.Description,
                price = createdDish.Price,
                isActive = createdDish.Available,
                image = createdDish.ImageUrl,
                category = new GenericResponse { Id= createdDish.Category, Name = category.Name },
                createdAt = createdDish.CreateDate,
                updatedAt = createdDish.UpdateDate
            };

            return response;
        }
    }
}
