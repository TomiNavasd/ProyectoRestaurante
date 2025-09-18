using Application.Models.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.IStatus.IStatusService
{
    public interface IGetStatusByIdService
    {
        Task<StatusResponse> GetStatusById(int id);
    }
}
