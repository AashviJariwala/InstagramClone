using Instagram.Models;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Instagram.Controllers
{
    public class RequestController : Controller
    {
        private readonly string url;
        public static List<int> followerIdArray = new List<int>();
        public static int followerCnt = 0;
        public RequestController(IConfiguration configuration)
        {
            url = configuration["ApiSettings:url"];
        }
        // GET: RequestController
        public async Task<ActionResult> PendingRequestList()
        {
            var token = HttpContext.Session.GetString("Token");
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);


            var requestResponse = await httpClient.GetAsync(url + "/relationship/pendingRequestList");
            if (requestResponse.IsSuccessStatusCode)
            {
                string apiResponse = await requestResponse.Content.ReadAsStringAsync();
                var users = JsonConvert.DeserializeObject<Request>(apiResponse);
                return View(users);
            }
            return View();
        }

        // GET: RequestController/Details/5
        public async Task<ActionResult> AcceptRequest(int id)
        {
            var token = HttpContext.Session.GetString("Token");
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);


            var requestResponse = await httpClient.GetAsync(url + "/relationship/acceptRequest/"+id);
            if (requestResponse.IsSuccessStatusCode)
            {
                string apiResponse = await requestResponse.Content.ReadAsStringAsync();
                var msg = JsonConvert.DeserializeObject<Response>(apiResponse);
                return RedirectToAction("Dashboard", "Request");
            }
            return View();
        }

        public async Task<ActionResult> RejectRequest(int id)
        {
            var token = HttpContext.Session.GetString("Token");
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);


            var requestResponse = await httpClient.GetAsync(url + "/relationship/deleteRequest/" + id);
            if (requestResponse.IsSuccessStatusCode)
            {
                string apiResponse = await requestResponse.Content.ReadAsStringAsync();
                var msg = JsonConvert.DeserializeObject<Response>(apiResponse);
                return RedirectToAction("Dashboard", "Request");
            }
            return View();
        }

        public async Task<ActionResult> Dashboard()
        {
            var token = HttpContext.Session.GetString("Token");
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var requestResponse = await httpClient.GetAsync(url + "/relationship/getAcceptedRequestList");
            if (requestResponse.IsSuccessStatusCode)
            {
                string apiResponse = await requestResponse.Content.ReadAsStringAsync();
                var users = JsonConvert.DeserializeObject<Request>(apiResponse);
                return View(users);
            }
            return View();
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
                        followerIdArray.Add(id);
                        return RedirectToAction(nameof(Dashboard));
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

        // GET: RequestController/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: RequestController/Create
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

        // GET: RequestController/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        // POST: RequestController/Edit/5
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

        // GET: RequestController/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        // POST: RequestController/Delete/5
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
