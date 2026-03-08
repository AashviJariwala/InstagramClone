namespace Instagram.Models
{
    public class User
    {
        public int id { get; set; }
        public string username { get; set; }
        public string fullName { get; set; }

        public string? profile { get; set; }
        public string? email { get; set; }
        public string? gender { get; set; }
        public string? phone_number { get; set; }
        public string bio { get; set; }
        public DateTime? dob { get; set; }
        public string is_verified { get; set; }
        public string is_private { get; set; }
        public bool success { get; set; }
        public string? status { get; set; }

    }
}
