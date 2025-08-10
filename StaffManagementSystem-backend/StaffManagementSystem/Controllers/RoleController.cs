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
    public class RoleController : ControllerBase
    {
        private readonly StaffDbContext _context;

        public RoleController(StaffDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetRoles()
        {
            var roles = await _context.Roles
                .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .Select(r => new
                {
                    r.Id,
                    r.Name,
                    r.Description,
                    r.Level,
                    r.IsActive,
                    r.CreatedAt,
                    r.UpdatedAt,
                    Permissions = r.RolePermissions.Select(rp => new
                    {
                        rp.Permission.Id,
                        rp.Permission.Name,
                        rp.Permission.Resource,
                        rp.Permission.Action
                    }).ToList(),
                    UserCount = r.UserRoles.Count(ur => ur.IsActive)
                })
                .OrderBy(r => r.Name)
                .ToListAsync();

            return Ok(roles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetRole(string id)
        {
            var role = await _context.Roles
                .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .Where(r => r.Id == id)
                .Select(r => new
                {
                    r.Id,
                    r.Name,
                    r.Description,
                    r.Level,
                    r.IsActive,
                    r.CreatedAt,
                    r.UpdatedAt,
                    Permissions = r.RolePermissions.Select(rp => new
                    {
                        rp.Permission.Id,
                        rp.Permission.Name,
                        rp.Permission.Resource,
                        rp.Permission.Action
                    }).ToList(),
                    UserCount = r.UserRoles.Count(ur => ur.IsActive)
                })
                .FirstOrDefaultAsync();

            if (role == null)
            {
                return NotFound();
            }

            return Ok(role);
        }

        [HttpPost]
        public async Task<ActionResult<object>> CreateRole(CreateRoleRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var role = new Role
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                Description = request.Description,
                Level = request.Level ?? "user",
                IsActive = request.IsActive ?? true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Roles.Add(role);

            // Add permissions if provided
            if (request.PermissionIds != null && request.PermissionIds.Any())
            {
                var permissions = await _context.Permissions
                    .Where(p => request.PermissionIds.Contains(p.Id))
                    .ToListAsync();

                foreach (var permission in permissions)
                {
                    var rolePermission = new RolePermission
                    {
                        Id = Guid.NewGuid().ToString(),
                        RoleId = role.Id,
                        PermissionId = permission.Id,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.RolePermissions.Add(rolePermission);
                }
            }

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRole), new { id = role.Id }, role);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(string id, UpdateRoleRequest request)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null)
            {
                return NotFound();
            }

            role.Name = request.Name ?? role.Name;
            role.Description = request.Description ?? role.Description;
            role.Level = request.Level ?? role.Level;
            role.IsActive = request.IsActive ?? role.IsActive;
            role.UpdatedAt = DateTime.UtcNow;

            // Update permissions if provided
            if (request.PermissionIds != null)
            {
                // Remove existing permissions
                var existingRolePermissions = await _context.RolePermissions
                    .Where(rp => rp.RoleId == id)
                    .ToListAsync();
                _context.RolePermissions.RemoveRange(existingRolePermissions);

                // Add new permissions
                if (request.PermissionIds.Any())
                {
                    var permissions = await _context.Permissions
                        .Where(p => request.PermissionIds.Contains(p.Id))
                        .ToListAsync();

                    foreach (var permission in permissions)
                    {
                        var rolePermission = new RolePermission
                        {
                            Id = Guid.NewGuid().ToString(),
                            RoleId = role.Id,
                            PermissionId = permission.Id,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.RolePermissions.Add(rolePermission);
                    }
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoleExists(id))
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
        public async Task<IActionResult> DeleteRole(string id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null)
            {
                return NotFound();
            }

            // Check if role is assigned to any users
            var hasActiveUsers = await _context.UserRoles
                .AnyAsync(ur => ur.RoleId == id && ur.IsActive);

            if (hasActiveUsers)
            {
                return BadRequest("Cannot delete role that is assigned to active users");
            }

            // Remove role permissions
            var rolePermissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == id)
                .ToListAsync();
            _context.RolePermissions.RemoveRange(rolePermissions);

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/permissions")]
        public async Task<IActionResult> AssignPermissions(string id, [FromBody] AssignPermissionsRequest request)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null)
            {
                return NotFound();
            }

            // Remove existing permissions
            var existingRolePermissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == id)
                .ToListAsync();
            _context.RolePermissions.RemoveRange(existingRolePermissions);

            // Add new permissions
            if (request.PermissionIds != null && request.PermissionIds.Any())
            {
                var permissions = await _context.Permissions
                    .Where(p => request.PermissionIds.Contains(p.Id))
                    .ToListAsync();

                foreach (var permission in permissions)
                {
                    var rolePermission = new RolePermission
                    {
                        Id = Guid.NewGuid().ToString(),
                        RoleId = role.Id,
                        PermissionId = permission.Id,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.RolePermissions.Add(rolePermission);
                }
            }

            role.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Permissions updated successfully" });
        }

        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetStatistics()
        {
            var totalRoles = await _context.Roles.CountAsync();
            var activeRoles = await _context.Roles.CountAsync(r => r.IsActive);
            
            var roleDistribution = await _context.Roles
                .GroupBy(r => r.Level)
                .Select(g => new { Level = g.Key, Count = g.Count() })
                .ToListAsync();

            var usersByRole = await _context.UserRoles
                .Include(ur => ur.Role)
                .Where(ur => ur.IsActive)
                .GroupBy(ur => ur.Role.Name)
                .Select(g => new { RoleName = g.Key, UserCount = g.Count() })
                .ToListAsync();

            return Ok(new
            {
                totalRoles,
                activeRoles,
                roleDistribution,
                usersByRole
            });
        }

        private bool RoleExists(string id)
        {
            return _context.Roles.Any(r => r.Id == id);
        }
    }

    public class CreateRoleRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Level { get; set; }
        public bool? IsActive { get; set; }
        public List<string>? PermissionIds { get; set; }
    }

    public class UpdateRoleRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Level { get; set; }
        public bool? IsActive { get; set; }
        public List<string>? PermissionIds { get; set; }
    }

    public class AssignPermissionsRequest
    {
        public List<string> PermissionIds { get; set; } = new();
    }
}