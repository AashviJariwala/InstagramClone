using System.Numerics;

namespace Instagram.Models
{
    public class media
    {
        public string url { get; set; }
        public string resourceType { get; set; }
        public BigInteger fileSize { get; set; }
        public double duration  { get; set; }
        public string thumbnail { get; set; }
    }
    public class Story
    {
        public int id { get; set; }
        public User user { get; set; }
        public media media { get; set; }
        public DateTime? createdAt { get; set; }
    }

    public class Prompt
    {
        public int id { get; set; }
        public User user { get; set; }
        public media media { get; set; }
        public string caption { get; set; }
        public int likeCnt { get; set; }
        public bool showLikes { get; set; }
        public bool likeStatus { get; set; }
        public DateTime? createdAt { get; set; }
    }

    public class Post
    {
        public int id { get; set; }
        public User user { get; set; }
        public List<media> media { get; set; }
        public string caption { get; set; }
        //public string location { get; set; }
        //public string tagPeople { get; set; }
        public int likeCnt { get; set; }
        public bool showLikes { get; set; }
        public bool allowComments { get; set; }
        public int commentCnt { get; set; }
        public bool likeStatus { get; set; }
        public string timeAgo { get; set; }
        public DateTime? createdAt { get; set; }
        public DateTime? updatedAt { get; set; }
    }

    public class FeedViewModel
    {
        public bool success { get; set; }
        public string type { get; set; }
        public List<Story> stories { get; set; } = new List<Story>();
        public List<Post> data { get; set; } = new List<Post>();
        public List<Prompt> promptData { get; set; } = new List<Prompt>();

    }
}
