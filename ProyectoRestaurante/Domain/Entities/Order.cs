using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Order
    {
        public long OrderId { get; set; }
        //public DeliveryType DeliveryType { get; set; }
        public string? DeliveryTo { get; set; }
        public string? Notes { get; set; }
        public decimal Price { get; set; }
        public DateTime CreateDate { get; set; }
        public DateTime UpdateDate { get; set; }

        // Relacion para OrderItem
        public ICollection<OrderItem> OrderItems { get; set; }

        public int OverallStatus { get; set; } // FK property
        public Status OverallStatusEnt { get; set; }

        public int DeliveryType { get; set; }
        public DeliveryType DeliveryTypeEnt { get; set; }


    }
}
