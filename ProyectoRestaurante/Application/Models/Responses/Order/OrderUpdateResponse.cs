using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Models.Responses.Order
{
    public class OrderUpdateResponse
    {
        public int orderNumber { get; set; }
        public double totalAmount { get; set; }
        public DateTime createdAt { get; set; }
    }
}
