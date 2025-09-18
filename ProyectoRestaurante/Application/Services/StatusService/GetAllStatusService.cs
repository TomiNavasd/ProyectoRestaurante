using Application.Interfaces.IStatus.IStatusService;
using Application.Models.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.StatusService
{
    public class GetAllStatusService : IGetAllStatusService
    {
        public Task<List<StatusResponse>> GetAllStatus()
        {
            throw new NotImplementedException();
        }
    }
}
