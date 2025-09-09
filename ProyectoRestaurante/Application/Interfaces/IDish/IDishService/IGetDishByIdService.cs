using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Models.Request;
using Application.Models.Responses;

namespace Application.Interfaces.IDish.IDishService
{
    public interface IGetDishByIdService
    {
        Task<DishResponse> GetDishById(Guid id);
    }
}
