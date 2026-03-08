using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Policy;
using System.Text;
using Instagram.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using NuGet.Common;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Instagram.Controllers
{
    public class ProfileController : Controller
    {
        private readonly string url;
        public ProfileController(IConfiguration configuration)
        {
            url = configuration["ApiSettings:url"];
        }
        public ActionResult Index()
        {
            return View();
        }
        // GET: ProfileController
        public async Task<ActionResult> Profile(int id, string type)
        {
            try
            {
                var token = HttpContext.Session.GetString("Token");
                if (string.IsNullOrEmpty(token))
                    return RedirectToAction("Login");

                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

                var profileTask = httpClient.GetAsync(url + "/user/userProfile");
                var postsTask = httpClient.GetAsync(url + "/posts/getOwnPost");
                var reelsTask = httpClient.GetAsync(url + "/posts/getOwnReel");
                var spinTask = httpClient.GetAsync(url + "/spinPrompt/getOwnPromptPost");

                await Task.WhenAll(profileTask, postsTask, reelsTask, spinTask);

                var viewModel = new UserProfilePageViewModel();

                if (profileTask.Result.IsSuccessStatusCode)
                {
                    string apiResponse1 = await profileTask.Result.Content.ReadAsStringAsync();
                    viewModel.UserProfile = JsonConvert.DeserializeObject<Profile>(apiResponse1);
                }

                if (postsTask.Result.IsSuccessStatusCode)
                {
                    string apiResponse2 = await postsTask.Result.Content.ReadAsStringAsync();
                    viewModel.UserPosts = JsonConvert.DeserializeObject<FeedViewModel>(apiResponse2);
                }

                if (type == "post")
                {
                    ViewBag.postId = id;
                    return View("MyPosts", viewModel);
                }
                else if (type == "reel")
                {
                    if (reelsTask.Result.IsSuccessStatusCode)
                    {
                        string apiResponse3 = await reelsTask.Result.Content.ReadAsStringAsync();
                        viewModel.UserPosts = JsonConvert.DeserializeObject<FeedViewModel>(apiResponse3);
                    }

                    ViewBag.postId = id;
                    return View("MyReels", viewModel);
                }
                else if (type == "prompt")
                {
                    if (spinTask.Result.IsSuccessStatusCode)
                    {
                        string apiResponse4 = await spinTask.Result.Content.ReadAsStringAsync();
                        viewModel.UserPosts = JsonConvert.DeserializeObject<FeedViewModel>(apiResponse4);
                    }

                    ViewBag.postId = id;
                    return View("MyPrompts", viewModel);
                }
                else
                {
                    return View(viewModel);
                }
            }
            catch (Exception ex)
            {
                ViewBag.Response = ex.Message;
                return View();
            }
        }

        public async Task<ActionResult> LoadPosts()
        {
            var token = HttpContext.Session.GetString("Token");
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);


            var postsResponse = await httpClient.GetAsync(url + "/posts/getOwnPost");
            if (postsResponse.IsSuccessStatusCode)
            {
                string apiResponse = await postsResponse.Content.ReadAsStringAsync();
                var post = JsonConvert.DeserializeObject<FeedViewModel>(apiResponse);
                return PartialView("_PostPartial", post);
            }
            return PartialView("_PostPartial", new FeedViewModel());
        }

        public async Task<ActionResult> LoadReels()
        {
            var token = HttpContext.Session.GetString("Token");
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var reelsResponse = await httpClient.GetAsync(url + "/posts/getOwnReel");
            if (reelsResponse.IsSuccessStatusCode)
            {
                string apiResponse = await reelsResponse.Content.ReadAsStringAsync();
                var reel = JsonConvert.DeserializeObject<FeedViewModel>(apiResponse);
                return PartialView("_ReelPartial", reel);
            }

            return PartialView("_ReelPartial", new UserProfilePageViewModel());
        }

        public async Task<ActionResult> LoadPrompts()
        {
            var token = HttpContext.Session.GetString("Token");
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);


            var postsResponse = await httpClient.GetAsync(url + "/spinPrompt/getOwnPromptPost");
            if (postsResponse.IsSuccessStatusCode)
            {
                string apiResponse = await postsResponse.Content.ReadAsStringAsync();
                var post = JsonConvert.DeserializeObject<FeedViewModel>(apiResponse);
                return PartialView("_PromptPartial", post);
            }
            return PartialView("_PromptPartial", new FeedViewModel());
        }

        public ActionResult EditProfile()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> EditProfile(IFormFile profileImg)
        {
            try
            {
                var token = HttpContext.Session.GetString("Token");
                if (string.IsNullOrEmpty(token))
                    return RedirectToAction("Login");
                if (profileImg == null || profileImg.Length == 0)
                    return RedirectToAction(nameof(Profile));

                using var content = new MultipartFormDataContent();
                using var stream = profileImg.OpenReadStream();
                var fileContent = new StreamContent(stream);
                fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(profileImg.ContentType);

                content.Add(fileContent, "profile", profileImg.FileName);

                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                using (var response = await httpClient.PutAsync(url + "/user/editProfile", content))
                {
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    var userProfile = JsonConvert.DeserializeObject<Profile>(apiResponse);
                    if (userProfile.success)
                    {
                        return RedirectToAction(nameof(Profile));
                    }
                }
                return RedirectToAction(nameof(Profile));
            }
            catch
            {
                return View();
            }
        }

        // GET: ProfileController/Edit/5
        public async Task<ActionResult> UpdateUserDetails()
        {
            try
            {
                var token = HttpContext.Session.GetString("Token");
                if (string.IsNullOrEmpty(token))
                    return RedirectToAction("Login");

                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                using (var response = await httpClient.GetAsync(url + "/user/userProfile"))
                {
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    var userProfile = JsonConvert.DeserializeObject<Profile>(apiResponse);
                    if (userProfile.success)
                    {
                        return View(userProfile);
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

        // POST: ProfileController/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> UpdateUserDetails(int id, Profile p)
        {
            try
            {
                var token = HttpContext.Session.GetString("Token");
                if (string.IsNullOrEmpty(token))
                    return RedirectToAction("Login");

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                    StringContent content = new StringContent(JsonConvert.SerializeObject(p.data), Encoding.UTF8, "application/json");
                    using (var response = await httpClient.PutAsync(url + "/user/updateUserDetails", content))
                    {
                        string apiResponse = await response.Content.ReadAsStringAsync();
                        Response r = JsonConvert.DeserializeObject<Response>(apiResponse);
                        if (r.success)
                            return RedirectToAction(nameof(Profile));
                        else
                        {
                            ViewBag.error = r.msg;
                        }
                    }
                }
                return View();
            }
            catch
            {
                return View();
            }
        }

        public async Task<ActionResult> ShowPrivacyStatus()
        {
            try
            {
                var token = HttpContext.Session.GetString("Token");
                if (string.IsNullOrEmpty(token))
                    return RedirectToAction("Login");

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                    using (var response = await httpClient.GetAsync(url + "/user/showPrivacyStatus"))
                    {
                        string apiResponse = await response.Content.ReadAsStringAsync();
                        var r = JsonConvert.DeserializeObject<ResponseData>(apiResponse);
                        return View(r);
                    }
                }
            }
            catch
            {
                return View();
            }
        }

        [HttpPost]
        public async Task<ActionResult> UpdatePrivacyStatus(bool IsPrivate)
        {
            try
            {
                var privacy = "";
                if (IsPrivate == true)
                    privacy = "1";
                else
                    privacy = "0";
                var token = HttpContext.Session.GetString("Token");
                if (string.IsNullOrEmpty(token))
                    return RedirectToAction("Login");

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                    using (var response = await httpClient.GetAsync(url + "/user/updatePrivacyStatus/" + privacy))
                    {
                        string apiResponse = await response.Content.ReadAsStringAsync();
                        return RedirectToAction(nameof(ShowPrivacyStatus));
                    }
                }
            }
            catch
            {
                return View();
            }
        }

        public ActionResult Logout()
        {
            try
            {
                var token = HttpContext.Session.GetString("Token");
                if (string.IsNullOrEmpty(token))
                    return RedirectToAction("Login");

                HttpContext.Session.Clear();

                return RedirectToAction("Login","Authentication");

            }
            catch
            {
                return View();
            }
        }
    }
}
