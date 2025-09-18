using Application.Interfaces.IStatus;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.AccessControl;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Query
{
    public class StatusQuery : IStatusQuery
    {
        private readonly AppDbContext _context;
        public StatusQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Status>> GetAllStatuses()
        {
            return await _context.Statuses.ToListAsync();
        }

        public async Task<Status?> GetStatusById(int id)
        {
            return await _context.Statuses.FindAsync(id);
        }
    }
}
