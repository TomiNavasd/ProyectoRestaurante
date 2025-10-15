using Application.Exceptions;
using Application.Interfaces.ICategory;
using Application.Interfaces.IDish;
using Application.Interfaces.IDish.IDishService;
using Application.Interfaces.IOrderItem;
using Application.Models.Request;
using Application.Models.Response;
using Application.Models.Responses.Dish;

namespace Application.Services.DishService
{ 
    public class UpdateDishService : IUpdateDishService
    {
        private readonly IDishQuery _dishQuery;
        private readonly IDishCommand _dishCommand;
        private readonly ICategoryQuery _categoryQuery;
        private readonly IOrderItemQuery _orderItemQuery;
        public UpdateDishService(IDishQuery dishQuery, IDishCommand dishCommand, ICategoryQuery categoryQuery, IOrderItemQuery orderItemQuery)
        {
            _dishQuery = dishQuery;
            _dishCommand = dishCommand;
            _categoryQuery = categoryQuery;
            _orderItemQuery = orderItemQuery;
        }

        public async Task<DishResponse?> UpdateDish(Guid id, DishUpdateRequest DishUpdateRequest)
        {

            // Validaciones de logica de negocio se quedan
            // Validacion de negocio (PLATO EN USO) (lanza 409)
            var isDishInUse = await _orderItemQuery.IsDishInActiveOrder(id);
            if (isDishInUse)
            {
                throw new ConflictException("No se puede eliminar el plato porque está incluido en órdenes activas.");
            }
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
            existDish.UpdateDate = DateTime.UtcNow;

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
