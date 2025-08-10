using System.ComponentModel.DataAnnotations;

namespace StaffManagementSystem.Models
{
    public class User
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required(ErrorMessage = "Username is required")]
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [StringLength(100)]
        public string? FirstName { get; set; }

        [StringLength(100)]
        public string? LastName { get; set; }

        [Required]
        public byte[] PasswordHash { get; set; } = Array.Empty<byte>();

        [Required]
        public byte[] PasswordSalt { get; set; } = Array.Empty<byte>();

        public bool IsActive { get; set; } = true;

        // Email verification fields
        public bool EmailVerified { get; set; } = false;
        public string? EmailVerificationToken { get; set; }
        public DateTime? EmailVerificationTokenExpiry { get; set; }

        // Account status
        public bool IsAccountLocked { get; set; } = false;
        public DateTime? LockedUntil { get; set; }
        public int FailedLoginAttempts { get; set; } = 0;

        // Admin permissions
        public bool IsAdministrator { get; set; } = false;
        public bool CanManageUsers { get; set; } = false;
        public bool CanManageRoles { get; set; } = false;

        public DateTime? LastLoginAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Many-to-many relationship with roles
        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

        // Navigation property for approvals as applicant
        public ICollection<Approval> ApplicantApprovals { get; set; } = new List<Approval>();

        // Navigation property for approvals as approver
        public ICollection<Approval> ApproverApprovals { get; set; } = new List<Approval>();

        public User()
        {
            Id = Guid.NewGuid().ToString();
        }
    }
}

