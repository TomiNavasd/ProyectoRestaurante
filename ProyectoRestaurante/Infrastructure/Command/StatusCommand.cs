using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces.IStatus;
using Domain.Entities;
using Infrastructure.Data;

namespace Infrastructure.Command
{
    public class StatusCommand : IStatusCommand
    {
        private readonly AppDbContext _context;
        public StatusCommand(AppDbContext context)
        {
            _context = context;
        }

        public async Task DeleteStatus(int id)
        {
            _context.Remove(new Status { Id = id });
            await _context.SaveChangesAsync().ContinueWith(t => t.Result > 0);
        }

        public async Task InsertStatus(Status status)
        {
            _context.Add(status);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateStatus(Status status)
        {
            _context.Update(status);
            await _context.SaveChangesAsync();
        }
    }
}
