using Application.Exceptions;
using Application.Interfaces.ICategory;
using Application.Interfaces.IDish;
using Application.Interfaces.IDish.IDishService;
using Application.Interfaces.IOrder;
using Application.Interfaces.IOrderItem;
using Application.Models.Request;
using Application.Models.Response;
using Application.Models.Responses;
using Application.Models.Responses.Dish;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.DishService
{
    public class DeleteDishService : IDeleteDishService
    {
        private readonly IDishCommand _dishCommand;
        private readonly IDishQuery _dishQuery;
        private readonly ICategoryQuery _categoryQuery;
        private readonly IOrderItemQuery _orderItemQuery;
        public DeleteDishService(IDishCommand dishCommand, IDishQuery dishQuery, ICategoryQuery categoryQuery, IOrderItemQuery orderItemQuery)
        {
            _dishCommand = dishCommand;
            _dishQuery = dishQuery;
            _categoryQuery = categoryQuery;
            _orderItemQuery= orderItemQuery;
        }
        public async Task<DishResponse> DeleteDish(Guid id)
        {
            var dish = await _dishQuery.GetDishById(id);
            if (dish == null)
            {
                // lanzamos la excepción. 404
                throw new NotFoundException($"El plato con la id {id} no fue encontrado.");
            }
            // Validacion de negocio (PLATO EN USO) (lanza 409)
            var isDishInUse = await _orderItemQuery.IsDishInActiveOrder(id);
            if (isDishInUse)
            {
                throw new ConflictException("No se puede eliminar el plato porque está incluido en órdenes activas.");
            }

            dish.Available = false;
            await _dishCommand.UpdateDish(dish);
            var category = await _categoryQuery.GetCategoryById(dish.Category);

            var response = new DishResponse
            {
                id = dish.DishId,
                name = dish.Name,
                description = dish.Description,
                price = dish.Price,
                category = new GenericResponse { Id = dish.Category, Name = category.Name },
                isActive = dish.Available,
                image = dish.ImageUrl,
                createdAt = dish.CreateDate,
                updatedAt = dish.UpdateDate
            };
            return response;
        }
    }
}
