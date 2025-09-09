using Application.Enums;
using Application.Models.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.IDish.IDishService
{
    public interface ISearchAsyncService
    {
        Task<IEnumerable<DishResponse>> SearchAsync(string? name, int? categoryId, bool? onlyActive = true, OrderPrice? priceOrder = OrderPrice.ASC);
    }
}
