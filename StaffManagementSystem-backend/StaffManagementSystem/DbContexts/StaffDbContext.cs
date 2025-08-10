using Microsoft.EntityFrameworkCore;
using StaffManagementSystem.Models;

namespace StaffManagementSystem.DbContexts
{
    public class StaffDbContext : DbContext
    {
        public StaffDbContext(DbContextOptions<StaffDbContext> options)
            : base(options)
        {
        }

        public DbSet<Employee> Employees { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Approval> Approvals { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Department hierarchy - Self-referencing relationship
            modelBuilder.Entity<Department>()
                .HasOne(d => d.ParentDepartment)
                .WithMany(d => d.SubDepartments)
                .HasForeignKey(d => d.ParentDepartmentId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascading deletes

            // Employee-Department relationship
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Department)
                .WithMany(d => d.Employees)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Approval relationships
            modelBuilder.Entity<Approval>()
                .HasOne(a => a.Applicant)
                .WithMany(e => e.ApplicantApprovals)
                .HasForeignKey(a => a.ApplicantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Approval>()
                .HasOne(a => a.Approver)
                .WithMany(e => e.ApproverApprovals)
                .HasForeignKey(a => a.ApproverId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Approval>()
                .HasOne(a => a.Department)
                .WithMany()
                .HasForeignKey(a => a.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Role-Permission many-to-many relationship
            modelBuilder.Entity<RolePermission>()
                .HasOne(rp => rp.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(rp => rp.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RolePermission>()
                .HasOne(rp => rp.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(rp => rp.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);

            // User-Role many-to-many relationship
            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure automatic update of UpdatedAt fields
            modelBuilder.Entity<Employee>()
                .Property(e => e.UpdatedAt)
                .ValueGeneratedOnUpdate();

            modelBuilder.Entity<Department>()
                .Property(d => d.UpdatedAt)
                .ValueGeneratedOnUpdate();

            modelBuilder.Entity<Approval>()
                .Property(a => a.UpdatedAt)
                .ValueGeneratedOnUpdate();

            modelBuilder.Entity<Role>()
                .Property(r => r.UpdatedAt)
                .ValueGeneratedOnUpdate();

            modelBuilder.Entity<Permission>()
                .Property(p => p.UpdatedAt)
                .ValueGeneratedOnUpdate();

            modelBuilder.Entity<User>()
                .Property(u => u.UpdatedAt)
                .ValueGeneratedOnUpdate();

            base.OnModelCreating(modelBuilder);
        }
    }
}

