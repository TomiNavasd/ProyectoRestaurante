using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces.IDeliveryType
{
    public interface IDeliveryTypeCommand
    {
        Task InsertDeliveryType(DeliveryType deliveryType);
        Task UpdateDeliveryType(DeliveryType deliveryType);
        Task DeleteDeliveryType(DeliveryType deliveryType);
    }
}
