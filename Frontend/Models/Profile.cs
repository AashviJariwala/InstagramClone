namespace Instagram.Models
{
    public class Profile
    {
        public bool success { get; set; }

        public User? data { get; set; }
        public string status { get; set; }
        public int? postCount { get; set; }

        public int? followersCount { get; set; } 
        public int? followingCount { get; set; } 
    }
}
