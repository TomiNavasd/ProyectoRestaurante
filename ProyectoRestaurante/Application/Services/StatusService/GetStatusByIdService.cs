using Application.Interfaces.IStatus.IStatusService;
using Application.Models.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.StatusService
{
    public class GetStatusByIdService : IGetStatusByIdService
    {
        public Task<StatusResponse> GetStatusById(int id)
        {
            throw new NotImplementedException();
        }
    }
}
