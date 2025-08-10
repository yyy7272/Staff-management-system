using Microsoft.EntityFrameworkCore;
using StaffManagementSystem.DataTransferObj;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using StaffManagementSystem.DbContexts;
using StaffManagementSystem.Services;
using StaffManagementSystem.Middleware;



namespace StaffManagementSystem
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add CORS policy
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins("http://localhost:3000", "http://localhost:8000", "http://localhost:5173") // Support multiple frontend ports
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            builder.Services.AddControllers();
            builder.Services.AddOpenApi(); // OpenAPI/Swagger
            builder.Services.AddDbContext<StaffDbContext>(options =>
              options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
            builder.Services.AddDbContext<AuthDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Configure Company Access options
            builder.Services.Configure<CompanyAccessOptions>(
                builder.Configuration.GetSection(CompanyAccessOptions.SectionName));

            // Register Company Access Validator
            builder.Services.AddScoped<ICompanyAccessValidator, CompanyAccessValidator>();

            // Register Department Hierarchy Service
            builder.Services.AddScoped<IDepartmentHierarchyService, DepartmentHierarchyService>();

            // Configure Email settings
            builder.Services.Configure<EmailSettings>(
                builder.Configuration.GetSection(EmailSettings.SectionName));

            // Register Email Service
            builder.Services.AddScoped<IEmailService, EmailService>();

            // Register Admin Initialization Service
            builder.Services.AddScoped<IAdminInitializationService, AdminInitializationService>();
            
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
              .AddJwtBearer(options =>
              {
                  options.TokenValidationParameters = new TokenValidationParameters
                  {
                      ValidateIssuerSigningKey = true,
                      IssuerSigningKey = new SymmetricSecurityKey(
                          Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
                      ValidateIssuer = true,
                      ValidateAudience = true,
                      ValidIssuer = builder.Configuration["Jwt:Issuer"],
                      ValidAudience = builder.Configuration["Jwt:Audience"],
                      ValidateLifetime = true,
                      ClockSkew = TimeSpan.Zero // Reduce token lifetime tolerance
                  };
              });

            builder.Services.AddAuthorization();

            



            var app = builder.Build();

            // Initialize default administrator account
            using (var scope = app.Services.CreateScope())
            {
                var adminService = scope.ServiceProvider.GetRequiredService<IAdminInitializationService>();
                await adminService.InitializeDefaultAdminAsync();
            }

            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            // Use CORS (must be before MapControllers)
            app.UseCors("AllowFrontend");

            // Authentication must come before Authorization
            app.UseAuthentication();
            app.UseAuthorization();

            // Add Company Access Validation middleware after authentication
            app.UseCompanyAccessValidation();

            app.MapControllers();

            app.Run();
        }
    }
}

