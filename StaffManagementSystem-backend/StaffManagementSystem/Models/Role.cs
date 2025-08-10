using System.ComponentModel.DataAnnotations;

namespace StaffManagementSystem.Models
{
    public class Role
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required(ErrorMessage = "Role name is required")]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(255)]
        public string? Description { get; set; }

        [StringLength(20)]
        public string Level { get; set; } = "user"; // user, admin, super_admin

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Many-to-many relationship with permissions
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();

        // Many-to-many relationship with users/employees
        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

        public Role()
        {
            Id = Guid.NewGuid().ToString();
        }
    }
}