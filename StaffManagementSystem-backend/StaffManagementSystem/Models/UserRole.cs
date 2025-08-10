using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StaffManagementSystem.Models
{
    public class UserRole
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [ForeignKey("User")]
        public string UserId { get; set; }

        public User? User { get; set; }

        [Required]
        [ForeignKey("Role")]
        public string RoleId { get; set; }

        public Role? Role { get; set; }

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ExpiresAt { get; set; }

        public bool IsActive { get; set; } = true;

        public UserRole()
        {
            Id = Guid.NewGuid().ToString();
        }
    }
}