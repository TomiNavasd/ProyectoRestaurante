using Application.Exceptions;
using Application.Interfaces.ICategory;
using Application.Interfaces.IDish;
using Application.Interfaces.IDish.IDishService;
using Application.Models.Request;
using Application.Models.Response;
using Application.Models.Responses;
using Application.Models.Responses.Dish;
using Azure.Core;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.DishService
{ 
    public class UpdateDishService : IUpdateDishService
    {
        private readonly IDishQuery _dishQuery;
        private readonly IDishCommand _dishCommand;
        private readonly ICategoryQuery _categoryQuery;
        public UpdateDishService(IDishQuery dishQuery, IDishCommand dishCommand, ICategoryQuery categoryQuery)
        {
            _dishQuery = dishQuery;
            _dishCommand = dishCommand;
            _categoryQuery = categoryQuery;
        }

        public async Task<DishResponse?> UpdateDish(Guid id, DishUpdateRequest DishUpdateRequest)
        {
            if (DishUpdateRequest == null)
                throw new BadRequestException("Los datos del plato son necesarios.");
            if (string.IsNullOrWhiteSpace(DishUpdateRequest.Name))
                throw new BadRequestException("No se ingresó el nombre del plato.");
            if (DishUpdateRequest.Category == 0)
                throw new BadRequestException("No se ingresó una categoría válida.");
            if (DishUpdateRequest.Price <= 0)
                throw new BadRequestException("El precio debe ser mayor a cero.");

            var existDish = await _dishQuery.GetDishById(id);
            if (existDish == null)
            {
                throw new NotFoundException($"El plato con la id {id} no fue encontrado.");
            }
            var alreadyExist = await _dishQuery.FoundDish(DishUpdateRequest.Name,id);
            if (alreadyExist )
            {
                throw new ConflictException($"El plato con el nombre '{DishUpdateRequest.Name}' ya existe.");
            }

            existDish.Name = DishUpdateRequest.Name;
            existDish.Description = DishUpdateRequest.Description;
            existDish.Price = DishUpdateRequest.Price;
            existDish.Available = DishUpdateRequest.IsActive;
            existDish.Category = DishUpdateRequest.Category;
            existDish.ImageUrl = DishUpdateRequest.Image;
            existDish.UpdateDate = DateTime.Now;

            var category = await _categoryQuery.GetCategoryById(existDish.Category);
            if (category == null)
            {
                throw new BadRequestException($"La categoría con ID {DishUpdateRequest.Category} no existe.");
            }

            await _dishCommand.UpdateDish(existDish);

            var UpdatedDish = new DishResponse
            {

                id = existDish.DishId,
                name = existDish.Name,
                description = existDish.Description,
                price = existDish.Price,
                isActive = existDish.Available,
                image = existDish.ImageUrl,
                category = new GenericResponse { Id = existDish.Category, Name = category.Name },
                createdAt = existDish.CreateDate,
                updatedAt = existDish.UpdateDate

            };

            return UpdatedDish;
        }

    }
}
