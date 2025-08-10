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
    public class ApprovalController : ControllerBase
    {
        private readonly StaffDbContext _context;

        public ApprovalController(StaffDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetApprovals([FromQuery] string? status = null, [FromQuery] string? type = null)
        {
            var query = _context.Approvals
                .Include(a => a.Applicant)
                .Include(a => a.Approver)
                .Include(a => a.Department)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(a => a.Status == status);
            }

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(a => a.Type == type);
            }

            var approvals = await query
                .Select(a => new
                {
                    a.Id,
                    a.Title,
                    a.Description,
                    a.Type,
                    a.Priority,
                    a.Status,
                    a.RequestDate,
                    a.ResponseDate,
                    a.DueDate,
                    a.ApprovalNotes,
                    a.Amount,
                    a.CreatedAt,
                    a.UpdatedAt,
                    Applicant = new { a.Applicant.Id, a.Applicant.Name, a.Applicant.Email },
                    Approver = a.Approver != null ? new { a.Approver.Id, a.Approver.Name, a.Approver.Email } : null,
                    Department = a.Department != null ? new { a.Department.Id, a.Department.Name } : null
                })
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return Ok(approvals);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetApproval(string id)
        {
            var approval = await _context.Approvals
                .Include(a => a.Applicant)
                .Include(a => a.Approver)
                .Include(a => a.Department)
                .Where(a => a.Id == id)
                .Select(a => new
                {
                    a.Id,
                    a.Title,
                    a.Description,
                    a.Type,
                    a.Priority,
                    a.Status,
                    a.RequestDate,
                    a.ResponseDate,
                    a.DueDate,
                    a.ApprovalNotes,
                    a.Amount,
                    a.CreatedAt,
                    a.UpdatedAt,
                    Applicant = new { a.Applicant.Id, a.Applicant.Name, a.Applicant.Email },
                    Approver = a.Approver != null ? new { a.Approver.Id, a.Approver.Name, a.Approver.Email } : null,
                    Department = a.Department != null ? new { a.Department.Id, a.Department.Name } : null
                })
                .FirstOrDefaultAsync();

            if (approval == null)
            {
                return NotFound();
            }

            return Ok(approval);
        }

        [HttpPost]
        public async Task<ActionResult<object>> CreateApproval(Approval approval)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            approval.Id = Guid.NewGuid().ToString();
            approval.CreatedAt = DateTime.UtcNow;
            approval.Status = "pending";

            _context.Approvals.Add(approval);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetApproval), new { id = approval.Id }, approval);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateApproval(string id, Approval approval)
        {
            if (id != approval.Id)
            {
                return BadRequest();
            }

            var existingApproval = await _context.Approvals.FindAsync(id);
            if (existingApproval == null)
            {
                return NotFound();
            }

            existingApproval.Title = approval.Title;
            existingApproval.Description = approval.Description;
            existingApproval.Type = approval.Type;
            existingApproval.Priority = approval.Priority;
            existingApproval.Status = approval.Status;
            existingApproval.ApproverId = approval.ApproverId;
            existingApproval.DepartmentId = approval.DepartmentId;
            existingApproval.ResponseDate = approval.ResponseDate;
            existingApproval.DueDate = approval.DueDate;
            existingApproval.ApprovalNotes = approval.ApprovalNotes;
            existingApproval.Amount = approval.Amount;
            existingApproval.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ApprovalExists(id))
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
        public async Task<IActionResult> DeleteApproval(string id)
        {
            var approval = await _context.Approvals.FindAsync(id);
            if (approval == null)
            {
                return NotFound();
            }

            _context.Approvals.Remove(approval);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveRequest(string id, [FromBody] ApprovalDecision decision)
        {
            var approval = await _context.Approvals.FindAsync(id);
            if (approval == null)
            {
                return NotFound();
            }

            approval.Status = "approved";
            approval.ResponseDate = DateTime.UtcNow;
            approval.ApprovalNotes = decision.Notes;
            approval.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Approval request approved successfully" });
        }

        [HttpPost("{id}/reject")]
        public async Task<IActionResult> RejectRequest(string id, [FromBody] ApprovalDecision decision)
        {
            var approval = await _context.Approvals.FindAsync(id);
            if (approval == null)
            {
                return NotFound();
            }

            approval.Status = "rejected";
            approval.ResponseDate = DateTime.UtcNow;
            approval.ApprovalNotes = decision.Notes;
            approval.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Approval request rejected" });
        }

        [HttpPost("bulk-action")]
        public async Task<IActionResult> BulkAction([FromBody] BulkApprovalRequest request)
        {
            var approvals = await _context.Approvals
                .Where(a => request.Ids.Contains(a.Id))
                .ToListAsync();

            if (approvals.Count == 0)
            {
                return NotFound("No approvals found for the provided IDs");
            }

            foreach (var approval in approvals)
            {
                approval.Status = request.Action;
                approval.ResponseDate = DateTime.UtcNow;
                approval.ApprovalNotes = request.Notes;
                approval.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Bulk action {request.Action} completed for {approvals.Count} approvals" });
        }

        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetStatistics()
        {
            var total = await _context.Approvals.CountAsync();
            var pending = await _context.Approvals.CountAsync(a => a.Status == "pending");
            var approved = await _context.Approvals.CountAsync(a => a.Status == "approved");
            var rejected = await _context.Approvals.CountAsync(a => a.Status == "rejected");

            var byType = await _context.Approvals
                .GroupBy(a => a.Type)
                .Select(g => new { Type = g.Key, Count = g.Count() })
                .ToListAsync();

            var byPriority = await _context.Approvals
                .GroupBy(a => a.Priority)
                .Select(g => new { Priority = g.Key, Count = g.Count() })
                .ToListAsync();

            return Ok(new
            {
                total,
                pending,
                approved,
                rejected,
                byType,
                byPriority
            });
        }

        private bool ApprovalExists(string id)
        {
            return _context.Approvals.Any(e => e.Id == id);
        }
    }

    public class ApprovalDecision
    {
        public string? Notes { get; set; }
    }

    public class BulkApprovalRequest
    {
        public List<string> Ids { get; set; } = new();
        public string Action { get; set; } = string.Empty; // "approved", "rejected", "pending"
        public string? Notes { get; set; }
    }
}