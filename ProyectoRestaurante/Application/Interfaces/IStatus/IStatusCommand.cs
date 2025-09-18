using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces.IStatus
{
    public interface IStatusCommand
    {
        Task InsertStatus(Status status);
        Task UpdateStatus(Status status);
        Task DeleteStatus(int id);
    }
    
}
