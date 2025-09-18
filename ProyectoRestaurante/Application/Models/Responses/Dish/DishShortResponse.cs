using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Models.Responses.Dish
{
    public class DishShortResponse
    {
        public Guid id { get; set; }
        public string name { get; set; }
        public string image { get; set; }
    }
}
