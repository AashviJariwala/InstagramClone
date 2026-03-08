namespace Instagram.Models
{
    public class Comment
    {
        public int id {  get; set; }
        public string commentText { get; set; }

        public User user { get; set; }
    }
}
