using Instagram.Models;
using System.Net.Http.Headers;
using System.Security.Policy;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Instagram.Controllers
{
    public class SearchController : Controller
    {
        private readonly string url;
        public static int uid = 0;

        public SearchController(IConfiguration configuration)
        {
            url = configuration["ApiSettings:url"];
        }
        // GET: SearchController
        public async Task<IActionResult> SearchProfiles(string query)
        {
            var token = HttpContext.Session.GetString("Token");
            var model = new UserSuggestion();
            model.data = new List<User>();
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);


            var requestResponse = await httpClient.GetAsync(url + "/search/searchProfiles/"+query);
            if (requestResponse.IsSuccessStatusCode)
            {
                string apiResponse = await requestResponse.Content.ReadAsStringAsync();
                var users = JsonConvert.DeserializeObject<UserSuggestion>(apiResponse);
                return Json(users.data);
            }
            return View(model);
        }

        //GET: SearchController/Details/5
        public async Task<IActionResult> UserProfile(int id,string type, int pid)
        {
            try
            {
                var token = HttpContext.Session.GetString("Token");
                if (string.IsNullOrEmpty(token))
                    return RedirectToAction("Login");

                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

                var response = await httpClient.GetAsync(url + "/user/searchOwnProfile/" + id);
                if (response.IsSuccessStatusCode)
                {
                    var apiResponse = await response.Content.ReadAsStringAsync();
                    var res = JsonConvert.DeserializeObject<Response>(apiResponse);
                    if (res.msg == "Token User")
                        return RedirectToAction("Profile", "Profile");
                    else
                    {
                        var profileTask = httpClient.GetAsync(url + "/user/searchUser/" + id);
                        var postsTask = httpClient.GetAsync(url + "/posts/getUserPost/" + id);
                        var reelsTask = httpClient.GetAsync(url + "/posts/getUserReel/" + id);

                        await Task.WhenAll(profileTask, postsTask, reelsTask);

                        var viewModel = new UserProfilePageViewModel();

                        if (profileTask.Result.IsSuccessStatusCode)
                        {
                            string apiResponse1 = await profileTask.Result.Content.ReadAsStringAsync();
                            viewModel.UserProfile = JsonConvert.DeserializeObject<Profile>(apiResponse1);
                            ViewBag.privacy = viewModel.UserProfile.data.is_private;
                            ViewBag.status = viewModel.UserProfile.status;
                            HttpContext.Session.SetString("privacy", viewModel.UserProfile.data.is_private);
                            if (viewModel.UserProfile.status != null)
                            {
                                HttpContext.Session.SetString("status", viewModel.UserProfile.status);
                            }
                        }

                        if (postsTask.Result.IsSuccessStatusCode)
                        {
                            string apiResponse2 = await postsTask.Result.Content.ReadAsStringAsync();
                            viewModel.UserPosts = JsonConvert.DeserializeObject<FeedViewModel>(apiResponse2);
                        }

                        if (type == "post")
                        {
                            ViewBag.postId = pid;
                            return View("~/Views/Profile/MyPosts.cshtml", viewModel);
                        }
                        else if (type == "reel")
                        {
                            if (reelsTask.Result.IsSuccessStatusCode)
                            {
                                string apiResponse3 = await reelsTask.Result.Content.ReadAsStringAsync();
                                viewModel.UserPosts = JsonConvert.DeserializeObject<FeedViewModel>(apiResponse3);
                            }

                            ViewBag.postId = pid;
                            return View("~/Views/Profile/MyReels.cshtml", viewModel);
                        }
                        else
                        {
                            return View(viewModel);
                        }
                    }
                }
                return View();
            }
            catch (Exception ex)
            {
                ViewBag.Response = ex.Message;
                return View();
            }
        }


        public async Task<ActionResult> LoadPosts(int id)
        {
            ViewBag.privacy= HttpContext.Session.GetString("privacy");
            var status = HttpContext.Session.GetString("status");
            if(status!=null)
            {
                ViewBag.status = HttpContext.Session.GetString("status");
            }
            else
            {
                ViewBag.status = null; 
            }
            var token = HttpContext.Session.GetString("Token");
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);


            var postsResponse = await httpClient.GetAsync(url + "/posts/getUserPost/"+id);
            if (postsResponse.IsSuccessStatusCode)
            {
                string apiResponse = await postsResponse.Content.ReadAsStringAsync();
                var post = JsonConvert.DeserializeObject<FeedViewModel>(apiResponse);
                return PartialView("_UserPostPartial", post);
            }
            return PartialView("_UserPostPartial", new FeedViewModel());
        }

        public async Task<ActionResult> LoadReels(int id)
        {
            ViewBag.privacy = HttpContext.Session.GetString("privacy");
            var status = HttpContext.Session.GetString("status");
            if (status != null)
            {
                ViewBag.status = HttpContext.Session.GetString("status");
            }
            else
            {
                ViewBag.status = null;
            }
            var token = HttpContext.Session.GetString("Token");
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var reelsResponse = await httpClient.GetAsync(url + "/posts/getUserReel/"+id);
            if (reelsResponse.IsSuccessStatusCode)
            {
                string apiResponse = await reelsResponse.Content.ReadAsStringAsync();
                var reel = JsonConvert.DeserializeObject<FeedViewModel>(apiResponse);
                return PartialView("_UserReelPartial", reel);
            }

            return PartialView("_UserReelPartial", new UserProfilePageViewModel());
        }

        public async Task<ActionResult> SendRequest(int id)
        {
            try
            {
                var token = HttpContext.Session.GetString("Token");
                if (string.IsNullOrEmpty(token))
                    return RedirectToAction("Login");

                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                using (var response = await httpClient.GetAsync(url + "/relationship/sendRequest/" + id))
                {
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    var res = JsonConvert.DeserializeObject<Response>(apiResponse);
                    if (res.success)
                    {
                        return RedirectToAction(nameof(UserProfile), new {id=id});
                    }
                }
                return View();
            }
            catch (Exception ex)
            {
                ViewBag.Response = ex.Message;
                return View();
            }
        }

        public async Task<ActionResult> Unfollow(int userId)
        {
            try
            {
                var token = HttpContext.Session.GetString("Token");
                if (string.IsNullOrEmpty(token))
                    return RedirectToAction("Login");

                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                using (var response = await httpClient.GetAsync(url + "/relationship/unfollowUser/" + userId))
                {
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    var res = JsonConvert.DeserializeObject<Response>(apiResponse);
                    if (res.success)
                    {
                        return RedirectToAction(nameof(UserProfile), new { id = userId });
                    }
                }
                return View();
            }
            catch (Exception ex)
            {
                ViewBag.Response = ex.Message;
                return View();
            }
        }

        //GET: SearchController/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: SearchController/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(IFormCollection collection)
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

        // GET: SearchController/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        // POST: SearchController/Edit/5
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

        // GET: SearchController/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        // POST: SearchController/Delete/5
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
