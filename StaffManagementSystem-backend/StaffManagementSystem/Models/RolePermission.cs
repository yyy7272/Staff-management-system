using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StaffManagementSystem.Models
{
    public class RolePermission
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [ForeignKey("Role")]
        public string RoleId { get; set; }

        public Role? Role { get; set; }

        [Required]
        [ForeignKey("Permission")]
        public string PermissionId { get; set; }

        public Permission? Permission { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public RolePermission()
        {
            Id = Guid.NewGuid().ToString();
        }
    }
}