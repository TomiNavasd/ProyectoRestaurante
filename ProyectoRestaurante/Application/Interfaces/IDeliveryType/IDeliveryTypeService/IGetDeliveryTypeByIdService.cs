using Application.Models.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.IDeliveryType.IDeliveryTypeService
{
    public interface IGetDeliveryTypeByIdService
    {
        Task<DeliveryTypeResponse> GetDeliveryTypeById(int id);
    }
}
