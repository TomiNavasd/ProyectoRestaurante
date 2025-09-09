using Application.Models.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Models.Responses
{
    public class DishResponse
    {
        public Guid id { get; set; } 
        public string name { get; set; }
        public string description { get; set; }
        public decimal price { get; set; }
        public bool isActive { get; set; }
        public string image { get; set; }
        public GenericResponse category { get; set; }

        public DateTime createdAt { get; set; }
        public DateTime updatedAt { get; set; }
    }
}
