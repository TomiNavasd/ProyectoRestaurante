using Application.Interfaces.IStatus;
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
        private readonly IStatusQuery _statusQuery;
        public GetAllStatusService(IStatusQuery statusQuery)
        {
            _statusQuery = statusQuery;
        }
        public async Task<List<StatusResponse>> GetAllStatus()
        {
            return (await _statusQuery.GetAllStatuses()).Select(s => new StatusResponse
            {
                Id = s.Id,
                Name = s.Name,
            }).ToList();
        }
    }
}
