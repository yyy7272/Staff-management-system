using System.ComponentModel.DataAnnotations;

namespace StaffManagementSystem.Models
{
    public class Permission
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required(ErrorMessage = "Permission name is required")]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(255)]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Resource is required")]
        [StringLength(50)]
        public string Resource { get; set; } // employees, departments, approvals, etc.

        [Required(ErrorMessage = "Action is required")]
        [StringLength(50)]
        public string Action { get; set; } // create, read, update, delete, approve, etc.

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Many-to-many relationship with roles
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();

        public Permission()
        {
            Id = Guid.NewGuid().ToString();
        }
    }
}