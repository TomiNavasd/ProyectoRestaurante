using Application.Interfaces.IDeliveryType;
using Application.Interfaces.IDeliveryType.IDeliveryTypeService;
using Application.Models.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.DeliveryTypeService
{
    public class GetAllDeliveryTypeService : IGetAllDeliveryTypeService
    {
        private readonly IDeliveryTypeQuery _deliveryTypeQuery;
        public Task<List<DeliveryTypeResponse>> GetAllDeliveryType()
        {
            throw new NotImplementedException();
        }
    }
}
