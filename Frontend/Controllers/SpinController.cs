using Instagram.Models;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Instagram.Controllers
{
    public class SpinController : Controller
    {
        private readonly string url;
        public SpinController(IConfiguration configuration)
        {
            url = configuration["ApiSettings:url"];
        }
        // GET: SpinController
        public async Task<ActionResult> PromptIndex()
        {
            try
            {
                var token = HttpContext.Session.GetString("Token");
                if (string.IsNullOrEmpty(token))
                    return RedirectToAction("Login");

                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

                var promptTask = httpClient.GetAsync(url + "/spinPrompt/getOtherPromptPost");

                var viewModel = new FeedViewModel();

                if (promptTask.Result.IsSuccessStatusCode)
                {
                    string apiResponse2 = await promptTask.Result.Content.ReadAsStringAsync();
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

        // GET: SpinController/Details/5
        public ActionResult Details(int id)
        {
            return View();
        }

        // GET: SpinController/Create
        public ActionResult LoadSpin()
        {
            return View();
        }

        public async Task<ActionResult> AddSpinPrompt()
        {
            try
            {
                var token = HttpContext.Session.GetString("Token");
                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

                var postsResponse = await httpClient.GetAsync(url + "/spinPrompt/getNewPrompt");
                if (postsResponse.IsSuccessStatusCode)
                {
                    string apiResponse = await postsResponse.Content.ReadAsStringAsync();
                    var promp = JsonConvert.DeserializeObject<Response>(apiResponse);
                    return View(promp);
                }
                return View();
            }
            catch
            {
                return View();
            }
        }

        // GET: SpinController/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        // POST: SpinController/Edit/5
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

        // GET: SpinController/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        // POST: SpinController/Delete/5
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
