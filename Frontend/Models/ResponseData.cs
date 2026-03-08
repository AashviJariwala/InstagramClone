namespace Instagram.Models
{
    public class ResponseData
    {
        public Likes likeData {  get; set; }
        public Story storyData { get; set; }
        public string CroppedImage { get; set; }
        public User data {  get; set; }
        public bool success { get; set; }

        public List<Comment> comments { get; set; }

        public Comment comment { get; set; }

    }
}
