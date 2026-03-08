namespace Instagram.Models
{
    public class Dashboard
    {
        public FeedViewModel? UserStories { get; set; }
        public FeedViewModel? UserPosts { get; set; }
        public Profile? profile { get; set; }
        public ResponseData? data { get; set; }


    }
}
