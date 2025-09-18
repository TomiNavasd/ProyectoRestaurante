using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces.IStatus
{
    public interface IStatusQuery
    {
        Task<List<Status>> GetAllStatuses();
        Task<Status?> GetStatusById(int id);
    }
}
