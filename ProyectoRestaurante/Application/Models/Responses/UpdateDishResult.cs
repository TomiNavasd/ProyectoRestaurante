using Application.Models.Responses;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Models.Response
{
    public class UpdateDishResult
    {
        public bool Success { get; set; }
        public bool NotFound { get; set; }
        public bool NameConflict { get; set; } 
        public DishResponse? UpdatedDish { get; set; }
    }
}
