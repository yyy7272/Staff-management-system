using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StaffManagementSystem.DbContexts;
using StaffManagementSystem.Models;

namespace StaffManagementSystem.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PermissionController : ControllerBase
    {
        private readonly StaffDbContext _context;

        public PermissionController(StaffDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetPermissions([FromQuery] string? resource = null)
        {
            var query = _context.Permissions.AsQueryable();

            if (!string.IsNullOrEmpty(resource))
            {
                query = query.Where(p => p.Resource == resource);
            }

            var permissions = await query
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Resource,
                    p.Action,
                    p.IsActive,
                    p.CreatedAt,
                    p.UpdatedAt,
                    RoleCount = p.RolePermissions.Count
                })
                .OrderBy(p => p.Resource)
                .ThenBy(p => p.Action)
                .ToListAsync();

            return Ok(permissions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetPermission(string id)
        {
            var permission = await _context.Permissions
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Resource,
                    p.Action,
                    p.IsActive,
                    p.CreatedAt,
                    p.UpdatedAt,
                    Roles = p.RolePermissions.Select(rp => new
                    {
                        rp.Role.Id,
                        rp.Role.Name,
                        rp.Role.Level
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (permission == null)
            {
                return NotFound();
            }

            return Ok(permission);
        }

        [HttpPost]
        public async Task<ActionResult<object>> CreatePermission(CreatePermissionRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if permission with same resource and action already exists
            var existingPermission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.Resource == request.Resource && p.Action == request.Action);

            if (existingPermission != null)
            {
                return BadRequest("Permission with this resource and action already exists");
            }

            var permission = new Permission
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                Description = request.Description,
                Resource = request.Resource,
                Action = request.Action,
                IsActive = request.IsActive ?? true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Permissions.Add(permission);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPermission), new { id = permission.Id }, permission);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePermission(string id, UpdatePermissionRequest request)
        {
            var permission = await _context.Permissions.FindAsync(id);
            if (permission == null)
            {
                return NotFound();
            }

            permission.Name = request.Name ?? permission.Name;
            permission.Description = request.Description ?? permission.Description;
            permission.Resource = request.Resource ?? permission.Resource;
            permission.Action = request.Action ?? permission.Action;
            permission.IsActive = request.IsActive ?? permission.IsActive;
            permission.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PermissionExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePermission(string id)
        {
            var permission = await _context.Permissions.FindAsync(id);
            if (permission == null)
            {
                return NotFound();
            }

            // Check if permission is assigned to any roles
            var hasActiveRoles = await _context.RolePermissions
                .AnyAsync(rp => rp.PermissionId == id);

            if (hasActiveRoles)
            {
                return BadRequest("Cannot delete permission that is assigned to roles");
            }

            _context.Permissions.Remove(permission);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("resources")]
        public async Task<ActionResult<IEnumerable<object>>> GetResources()
        {
            var resources = await _context.Permissions
                .GroupBy(p => p.Resource)
                .Select(g => new
                {
                    Resource = g.Key,
                    PermissionCount = g.Count(),
                    Actions = g.Select(p => p.Action).Distinct().ToList()
                })
                .OrderBy(r => r.Resource)
                .ToListAsync();

            return Ok(resources);
        }

        [HttpGet("actions")]
        public async Task<ActionResult<IEnumerable<string>>> GetActions([FromQuery] string? resource = null)
        {
            var query = _context.Permissions.AsQueryable();

            if (!string.IsNullOrEmpty(resource))
            {
                query = query.Where(p => p.Resource == resource);
            }

            var actions = await query
                .Select(p => p.Action)
                .Distinct()
                .OrderBy(a => a)
                .ToListAsync();

            return Ok(actions);
        }

        [HttpPost("seed")]
        public async Task<IActionResult> SeedDefaultPermissions()
        {
            var defaultPermissions = new List<Permission>
            {
                // Employee permissions
                new Permission { Name = "View Employees", Resource = "employees", Action = "read" },
                new Permission { Name = "Create Employees", Resource = "employees", Action = "create" },
                new Permission { Name = "Update Employees", Resource = "employees", Action = "update" },
                new Permission { Name = "Delete Employees", Resource = "employees", Action = "delete" },
                new Permission { Name = "Export Employees", Resource = "employees", Action = "export" },
                
                // Department permissions
                new Permission { Name = "View Departments", Resource = "departments", Action = "read" },
                new Permission { Name = "Create Departments", Resource = "departments", Action = "create" },
                new Permission { Name = "Update Departments", Resource = "departments", Action = "update" },
                new Permission { Name = "Delete Departments", Resource = "departments", Action = "delete" },
                
                // Approval permissions
                new Permission { Name = "View Approvals", Resource = "approvals", Action = "read" },
                new Permission { Name = "Create Approvals", Resource = "approvals", Action = "create" },
                new Permission { Name = "Update Approvals", Resource = "approvals", Action = "update" },
                new Permission { Name = "Delete Approvals", Resource = "approvals", Action = "delete" },
                new Permission { Name = "Approve Requests", Resource = "approvals", Action = "approve" },
                new Permission { Name = "Reject Requests", Resource = "approvals", Action = "reject" },
                
                // Role permissions
                new Permission { Name = "View Roles", Resource = "roles", Action = "read" },
                new Permission { Name = "Create Roles", Resource = "roles", Action = "create" },
                new Permission { Name = "Update Roles", Resource = "roles", Action = "update" },
                new Permission { Name = "Delete Roles", Resource = "roles", Action = "delete" },
                
                // Permission permissions
                new Permission { Name = "View Permissions", Resource = "permissions", Action = "read" },
                new Permission { Name = "Create Permissions", Resource = "permissions", Action = "create" },
                new Permission { Name = "Update Permissions", Resource = "permissions", Action = "update" },
                new Permission { Name = "Delete Permissions", Resource = "permissions", Action = "delete" },
                
                // System permissions
                new Permission { Name = "View System Stats", Resource = "system", Action = "read" },
                new Permission { Name = "System Administration", Resource = "system", Action = "admin" }
            };

            foreach (var permission in defaultPermissions)
            {
                var exists = await _context.Permissions
                    .AnyAsync(p => p.Resource == permission.Resource && p.Action == permission.Action);

                if (!exists)
                {
                    permission.Id = Guid.NewGuid().ToString();
                    permission.CreatedAt = DateTime.UtcNow;
                    _context.Permissions.Add(permission);
                }
            }

            var added = await _context.SaveChangesAsync();
            return Ok(new { message = $"Seeded {added} default permissions" });
        }

        private bool PermissionExists(string id)
        {
            return _context.Permissions.Any(p => p.Id == id);
        }
    }

    public class CreatePermissionRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Resource { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public bool? IsActive { get; set; }
    }

    public class UpdatePermissionRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Resource { get; set; }
        public string? Action { get; set; }
        public bool? IsActive { get; set; }
    }
}