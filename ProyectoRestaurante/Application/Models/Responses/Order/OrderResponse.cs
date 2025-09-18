using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Models.Responses.Order
{
    public class OrderResponse
    {
        public long Id { get; set; }
        public string DeliveryTo { get; set; }
        public string Notes { get; set; }
        public int Price { get; set; }
        public DateTime CreateDate { get; set; }
        public DateTime UpdateDate { get; set; }
    }
}
