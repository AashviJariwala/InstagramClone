using System.Collections;
using System.Net.Http.Headers;
using System.Text;
using Instagram.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using Newtonsoft.Json;
using NuGet.Protocol.Plugins;

namespace Instagram.Controllers
{
    public class AuthenticationController : Controller
    {
        private readonly string url; 
        public static List<int> followerIdArray=new List<int>();
        public static int followerCnt = 0;
        public AuthenticationController(IConfiguration configuration)
        {
            url = configuration["ApiSettings:url"];
        }
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Details(int id)
        {
            return View();
        }

        public ActionResult SignUp()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> SignUp(SignUp s)
        {
            try
            {
                SignUp s1 = new SignUp();
                using (var httpClient = new HttpClient())
                {
                    StringContent content = new StringContent(JsonConvert.SerializeObject(s), Encoding.UTF8, "application/json");
                    using (var response = await httpClient.PostAsync(url+ "/registerDummy", content))
                    {
                        string apiResponse = await response.Content.ReadAsStringAsync();
                        Response r = JsonConvert.DeserializeObject<Response>(apiResponse);
                        if (r.success)
                        {
                            HttpContext.Session.SetString("Email", s.email);
                            return RedirectToAction(nameof(VerifyOtp));
                        }
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

        public ActionResult Login()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Login(Models.Login l)
        {
            try
            {
                using (var httpClient = new HttpClient())
                {
                    StringContent content = new StringContent(JsonConvert.SerializeObject(l), Encoding.UTF8, "application/json");
                    using (var response = await httpClient.PostAsync(url + "/login", content))
                    {
                        string apiResponse = await response.Content.ReadAsStringAsync();
                        Response r = JsonConvert.DeserializeObject<Response>(apiResponse);
                        if (r.success)
                        {
                            HttpContext.Session.SetString("Token", r.token);
                            return RedirectToAction("Dashboard", "Post");
                        }
                        ViewBag.error = r.msg;
                    }
                }
                return View();
            }
            catch
            {
                return View();
            }
        }

        public ActionResult VerifyOtp()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> VerifyOtp(SignUp s)
        {
            try
            {
                var email = HttpContext.Session.GetString("Email");
                var data = new
                {
                    otp = s.otp,
                    email = email
                };
                using (var httpClient = new HttpClient())
                {
                    StringContent content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
                    using (var response = await httpClient.PostAsync(url + "/verifyOtp", content))
                    {
                        string apiResponse = await response.Content.ReadAsStringAsync();
                        Response r = JsonConvert.DeserializeObject<Response>(apiResponse);
                        if (r.success)
                        {
                            HttpContext.Session.SetString("Token", r.token);
                            return RedirectToAction(nameof(Suggestions));
                        }
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

        public async Task<ActionResult> ResendOtp(SignUp s)
        {
            try
            {
                var email = HttpContext.Session.GetString("Email");
                var data = new
                {
                    otp = s.otp,
                    email = email
                };
                using (var httpClient = new HttpClient())
                {
                    StringContent content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
                    using (var response = await httpClient.PostAsync(url + "/resendOtp", content))
                    {
                        string apiResponse = await response.Content.ReadAsStringAsync();
                        Response r = JsonConvert.DeserializeObject<Response>(apiResponse);
                        if (r.success)
                            return RedirectToAction(nameof(VerifyOtp));
                        ViewBag.error = r.msg;
                    }
                }
                return View();
            }
            catch
            {
                return View();
            }
        }

        public async Task<ActionResult> Suggestions(List<int> followerId,int followerCnt)
        {
            try
            {
                ViewBag.followerId = followerId;
                ViewBag.followerCnt = followerCnt;
                var token = HttpContext.Session.GetString("Token");
                if (string.IsNullOrEmpty(token))
                    return RedirectToAction("Login");

                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization =new AuthenticationHeaderValue("Bearer", token);
                using (var response = await httpClient.GetAsync(url + "/relationship/suggestProfiles"))
                {
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    var suggestions = JsonConvert.DeserializeObject<UserSuggestion>(apiResponse);
                    if (suggestions.success)
                    {
                        return View(new List<UserSuggestion> { suggestions });
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

        //[HttpPost]
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
                        followerIdArray.Add(id);
                        return RedirectToAction(nameof(Suggestions), new { followerId = followerIdArray,followerCnt=followerIdArray.Count });
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
    }
}
