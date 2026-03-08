using Instagram.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net.Http.Headers;

namespace Instagram.Controllers
{

    public class ReelController : Controller
    {

        private readonly string url;
        public ReelController(IConfiguration configuration)
        {
            url = configuration["ApiSettings:url"];
        }
        // GET: ReelController
        public ActionResult Index()
        {
            return View();
        }
        public async Task<ActionResult> Reels()
        {
            try
            {
                var token = HttpContext.Session.GetString("Token");
                if (string.IsNullOrEmpty(token))
                    return RedirectToAction("Login");

                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

                var reelsTask = httpClient.GetAsync(url + "/posts/getOtherReel");

                var viewModel = new FeedViewModel();

                if (reelsTask.Result.IsSuccessStatusCode)
                {
                    string apiResponse2 = await reelsTask.Result.Content.ReadAsStringAsync();
                    viewModel = JsonConvert.DeserializeObject<FeedViewModel>(apiResponse2);
                }
                return View(viewModel);
            }
            catch (Exception ex)
            {
                ViewBag.Response = ex.Message;
                return View();
            }
        }
        // GET: ReelController/Details/5
        public ActionResult Details(int id)
        {
            return View();
        }

        // GET: ReelController/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: ReelController/Create
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

        // GET: ReelController/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        // POST: ReelController/Edit/5
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

        // GET: ReelController/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        // POST: ReelController/Delete/5
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
