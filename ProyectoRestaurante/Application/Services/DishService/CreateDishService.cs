using Application.Interfaces.ICategory;
using Application.Interfaces.IDish;
using Application.Interfaces.IDish.IDishService;
using Application.Models.Request;
using Application.Models.Response;
using Application.Models.Responses;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
            // Paso 1: Verificar si el plato ya existe por su nombre.
            var dishExists = await _dishQuery.FoundDish(dishRequest.Name);
            if (dishExists)
            {
                return null; // Devuelve null si ya existe.
            }
            var category = await _categoryQuery.GetCategoryById(dishRequest.Category);

            // Paso 2: Mapear el DTO a la entidad de dominio (Dish).
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
                CreateDate = DateTime.Now,
                UpdateDate = DateTime.Now
            };

            // Paso 3: Usar el comando para agregar el nuevo plato.
            var createdDish = await _dishCommand.CreateDish(newDish);


            // Paso 4: Mapear la entidad de dominio de regreso al DTO de respuesta.
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
                // Mapear la categoría
            };

            return response;
        }
    }
}
