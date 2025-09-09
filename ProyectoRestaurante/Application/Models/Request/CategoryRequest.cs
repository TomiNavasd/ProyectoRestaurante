using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Models.Request
{
    public class CategoryRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int order { get; set; }
    }
}
