using Instagram.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Security.Policy;
using System.Text;

namespace Instagram.Controllers
{
    public class PostController : Controller
    {
        private readonly string url;

        public PostController(IConfiguration configuration)
        {
            url = configuration["ApiSettings:url"];

        }
        public ActionResult Index()
        {
            return View();
        }
        // GET: PostController
        public async Task<ActionResult> Dashboard()
        {
            try
            {
                List<int> storyIds = new List<int>();
                var token = HttpContext.Session.GetString("Token");
                if (string.IsNullOrEmpty(token))
                    return RedirectToAction("Login");

                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

                var postsTask = httpClient.GetAsync(url + "/posts/getOtherPost");
                var storyTask = httpClient.GetAsync(url + "/story/getAllStory");
                var profileTask = httpClient.GetAsync(url + "/user/userProfile");
                var storyStatusTask = httpClient.GetAsync(url + "/story/storyStatus");

                await Task.WhenAll( postsTask, storyTask,profileTask,storyStatusTask);

                var viewModel = new Dashboard();

                if (postsTask.Result.IsSuccessStatusCode)
                {
                    string apiResponse2 = await postsTask.Result.Content.ReadAsStringAsync();
                    viewModel.UserPosts = JsonConvert.DeserializeObject<FeedViewModel>(apiResponse2);
                }
                if (storyTask.Result.IsSuccessStatusCode)
                {
                    string apiResponse3 = await storyTask.Result.Content.ReadAsStringAsync();
                    viewModel.UserStories = JsonConvert.DeserializeObject<FeedViewModel>(apiResponse3);

                }
                if (profileTask.Result.IsSuccessStatusCode)
                {
                    string apiResponse1 = await profileTask.Result.Content.ReadAsStringAsync();
                    viewModel.profile = JsonConvert.DeserializeObject<Profile>(apiResponse1);
                }
                if (storyStatusTask.Result.IsSuccessStatusCode)
                {
                    string apiResponse4 = await storyStatusTask.Result.Content.ReadAsStringAsync();
                    viewModel.data = JsonConvert.DeserializeObject<ResponseData>(apiResponse4);
                }
                return View(viewModel);
            }
            catch (Exception ex)
            {
                ViewBag.Response = ex.Message;
                return View();
            }
        }
        public async Task<ActionResult> ViewStory(int id)
        {
            try
            {
                var token = HttpContext.Session.GetString("Token");
                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                var storyResponse = await httpClient.GetAsync(url + "/story/getUserStory/" + id);
                if (storyResponse.IsSuccessStatusCode)
                {
                    string apiResponse = await storyResponse.Content.ReadAsStringAsync();
                    var story = JsonConvert.DeserializeObject<ResponseData>(apiResponse);
                    return View(story);
                }
                return View();
            }
            catch
            {
                return View();
            }
        }


        // GET: PostController/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        // POST: PostController/Edit/5
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

        // GET: PostController/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        // POST: PostController/Delete/5
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
