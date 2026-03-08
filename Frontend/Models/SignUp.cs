using System.ComponentModel.DataAnnotations;

namespace Instagram.Models
{
    public class SignUp
    {
        public int id { get; set; }

        [Required]
        public string username { get; set; } = string.Empty;

        [Required]
        public string? email { get; set; }
        
        public string? phoneNumber { get; set; }

        [Required]
        public string password { get; set; } = string.Empty;

        [Required]
        public string otp { get; set; }

        public DateTime? expiresAt { get; set; }

        public DateTime? createdAt { get; set; }

        public DateTime? updatedAt { get; set; }
    }
}
