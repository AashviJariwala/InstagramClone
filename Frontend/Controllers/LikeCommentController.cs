using Instagram.Models;
using System.Net.Http.Headers;
using System.Security.Policy;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Text;

namespace Instagram.Controllers
{
    public class LikeCommentController : Controller
    {
        private readonly string url;
        public LikeCommentController(IConfiguration configuration)
        {
            url = configuration["ApiSettings:url"];
        }
        // GET: LikeCommentController
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Likes(int postId, string type)
        {
            var token = HttpContext.Session.GetString("Token");
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var data = new { postId = postId, type = type };
            StringContent content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");

            var likeResponse = await httpClient.PostAsync(url + "/likeComment/likePost", content);

            if (likeResponse.IsSuccessStatusCode)
            {
                string apiResponse = await likeResponse.Content.ReadAsStringAsync();
                var responseData = JsonConvert.DeserializeObject<ResponseData>(apiResponse);

                if (responseData?.likeData != null)
                {
                    return Json(new
                    {
                        success = true,
                        likeStatus = responseData.likeData.likeStatus,
                        likeCount = responseData.likeData.likeCnt
                    });
                }
            }

            return Json(new { success = false });
        }

        public async Task<IActionResult> GetComments(int postId)
        {
            var token = HttpContext.Session.GetString("Token");
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var storyResponse = await httpClient.GetAsync(url + "/likeComment/getPostComments/" + postId);
            if (storyResponse.IsSuccessStatusCode)
            {
                string apiResponse = await storyResponse.Content.ReadAsStringAsync();
                var comment = JsonConvert.DeserializeObject<ResponseData>(apiResponse);
                return Json(comment);
            }
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> AddComment(int postId, string commentText)
        {
            try
            {
                var data = new { commentText = commentText, postId = postId };
                StringContent content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json"); var token = HttpContext.Session.GetString("Token");
                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                var storyResponse = await httpClient.PostAsync(url + "/likeComment/commentPost/",content);
                if (storyResponse.IsSuccessStatusCode)
                {
                    string apiResponse = await storyResponse.Content.ReadAsStringAsync();
                    var comment = JsonConvert.DeserializeObject<ResponseData>(apiResponse);
                    return Json(comment);
                }
                return View();
            }
            catch
            {
                return View();
            }
        }

        // GET: LikeCommentController/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        // POST: LikeCommentController/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(int id, IFormCollection collection)
        {
            try
            {
                return RedirectToAction(nameof(Index));
            }
            catch
            {
                return View();
            }
        }

        // GET: LikeCommentController/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        // POST: LikeCommentController/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Delete(int id, IFormCollection collection)
        {
            try
            {
                return RedirectToAction(nameof(Index));
            }
            catch
            {
                return View();
            }
        }
    }
}
