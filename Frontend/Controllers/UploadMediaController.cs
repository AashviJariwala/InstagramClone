using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using Instagram.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using static System.Runtime.InteropServices.JavaScript.JSType;


namespace Instagram.Controllers
{
    public class UploadMediaController : Controller
    {
        private readonly string url;
        private IWebHostEnvironment _webHostEnvironment;

        public UploadMediaController(IConfiguration configuration,IWebHostEnvironment webHostEnvironment)
        {
            url = configuration["ApiSettings:url"];
            _webHostEnvironment = webHostEnvironment;
        }
        // GET: UploadMediaController
        public ActionResult Index()
        {
            return View();
        }

        // GET: UploadMediaController/Details/5
        public ActionResult Details(int id)
        {
            return View();
        }

        // GET: UploadMediaController/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: UploadMediaController/Create
        [HttpPost]
        public IActionResult Create(IFormFile file, string SelectedType)
        {
            HttpContext.Session.SetString("SelectedType", SelectedType);
            if (file != null && file.Length > 0)
            {
                string fileName = Path.GetFileName(file.FileName);

                // Create a temp folder inside wwwroot (or any accessible location)
                string tempFolder = Path.Combine(_webHostEnvironment.WebRootPath, "temp");
                if (!Directory.Exists(tempFolder))
                    Directory.CreateDirectory(tempFolder);

                string fullPath = Path.Combine(tempFolder, fileName);

                // Save the uploaded file to the temp folder
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    file.CopyTo(stream);
                }

                string webPath = "/temp/" + fileName;

                // 👉 If it's a reel → skip crop → save original path → go directly to Upload()
                if (SelectedType.Equals("reel", StringComparison.OrdinalIgnoreCase))
                {
                    HttpContext.Session.SetString("CroppedFilePath",
                        Path.Combine(_webHostEnvironment.WebRootPath, webPath.TrimStart('/')));

                    return RedirectToAction("Upload", "UploadMedia", new { ImagePath = webPath });
                }

                ViewBag.ImagePath = webPath;

                return View("Crop");
            }

            return RedirectToAction("Index");
        }

        public ActionResult Crop()
        {
            var type = HttpContext.Session.GetString("SelectedType");
            ViewBag.type = type;
            return View();
        }
        [HttpPost]
        [HttpPost]
        public IActionResult Crop(string CroppedImage)
        {
            try
            {
                if (string.IsNullOrEmpty(CroppedImage))
                    return Json(new { success = false, message = "No media data received." });

                string filePath = string.Empty;

                if (CroppedImage.StartsWith("data:image"))
                {
                    var base64Data = CroppedImage.Split(',')[1];
                    var bytes = Convert.FromBase64String(base64Data);

                    string uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "Uploads");
                    if (!Directory.Exists(uploadsFolder))
                        Directory.CreateDirectory(uploadsFolder);

                    string fileName = Guid.NewGuid().ToString() + ".png";
                    filePath = Path.Combine(uploadsFolder, fileName);
                    System.IO.File.WriteAllBytes(filePath, bytes);
                }
                else
                {
                    return Json(new { success = false, message = "Invalid media format." });
                }

                HttpContext.Session.SetString("CroppedFilePath", filePath);

                var type = HttpContext.Session.GetString("SelectedType") ?? "post";

                if (type.Equals("prompt", StringComparison.OrdinalIgnoreCase))
                {
                    return RedirectToAction("UploadPrompt", "UploadMedia", new { ImagePath = "/Uploads/" + Path.GetFileName(filePath) });
                }
                else
                {
                    return RedirectToAction("Upload", "UploadMedia", new { ImagePath = "/Uploads/" + Path.GetFileName(filePath) });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }


        public async Task<ActionResult> UploadPrompt(string ImagePath)
        {
            try
            {
                var croppedFilePath = HttpContext.Session.GetString("CroppedFilePath");
                ViewBag.ImagePath = ImagePath;
                if (string.IsNullOrEmpty(croppedFilePath) || !System.IO.File.Exists(croppedFilePath))
                {
                    ViewBag.Response = "Cropped file not found.";
                    return View();
                }
                byte[] fileBytes = await System.IO.File.ReadAllBytesAsync(croppedFilePath);

                var stream = new MemoryStream(fileBytes);
                IFormFile croppedFile = new FormFile(stream, 0, stream.Length, "file", Path.GetFileName(croppedFilePath));

                ViewBag.ImagePath = "/Uploads/" + Path.GetFileName(croppedFilePath);

                var token = HttpContext.Session.GetString("Token");

                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

                Prompt prompt = new Prompt();
                var profileTask = httpClient.GetAsync(url + "/user/userProfile");
                if (profileTask.Result.IsSuccessStatusCode)
                {
                    string apiResponse1 = await profileTask.Result.Content.ReadAsStringAsync();
                    var user = JsonConvert.DeserializeObject<ResponseData>(apiResponse1);
                    prompt.user = user.data;
                }

                return View(prompt);
            }
            catch (Exception ex)
            {
                ViewBag.Response = ex.Message;
                return View();
            }
        }
        // GET: UploadMediaController/Edit/5
        public async Task<ActionResult> Upload(string ImagePath)
        {
            try
            {
                var type = HttpContext.Session.GetString("SelectedType");
                ViewBag.type = type;
                var croppedFilePath = HttpContext.Session.GetString("CroppedFilePath");
                ViewBag.ImagePath = ImagePath;
                if (string.IsNullOrEmpty(croppedFilePath) || !System.IO.File.Exists(croppedFilePath))
                {
                    ViewBag.Response = "Cropped file not found.";
                    return View();
                }


                byte[] fileBytes = await System.IO.File.ReadAllBytesAsync(croppedFilePath);

                var stream = new MemoryStream(fileBytes);
                IFormFile croppedFile = new FormFile(stream, 0, stream.Length, "file", Path.GetFileName(croppedFilePath));

                if(type.Equals("post"))
                    ViewBag.ImagePath = "/Uploads/" + Path.GetFileName(croppedFilePath);


                var token = HttpContext.Session.GetString("Token");

                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

                Post post = new Post();
                var profileTask = httpClient.GetAsync(url + "/user/userProfile");
                if (profileTask.Result.IsSuccessStatusCode)
                {
                    string apiResponse1 = await profileTask.Result.Content.ReadAsStringAsync();
                    var user = JsonConvert.DeserializeObject<ResponseData>(apiResponse1);
                    post.user = user.data;
                }

                return View(post);
            }
            catch (Exception ex)
            {
                ViewBag.Response = ex.Message;
                return View();
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Upload(Post p,Prompt p1)
        {
            try
            {

                var token = HttpContext.Session.GetString("Token");
                var type = HttpContext.Session.GetString("SelectedType");
                if (string.IsNullOrEmpty(token))
                    return RedirectToAction("Login");
                var croppedFilePath = HttpContext.Session.GetString("CroppedFilePath");
                if (string.IsNullOrEmpty(croppedFilePath) || !System.IO.File.Exists(croppedFilePath))
                {
                    ViewBag.Response = "Cropped file not found.";
                    return View();
                }
                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", token);
                if (type == "prompt")
                {
                    int showLikes = p1.showLikes ? 1 : 0;
                    var multipartContent = new MultipartFormDataContent();

                    multipartContent.Add(new StringContent(p1.caption ?? ""), "caption");
                    multipartContent.Add(new StringContent(showLikes.ToString()), "showLikes");

                    var fileStream = new FileStream(croppedFilePath, FileMode.Open, FileAccess.Read);
                    var fileContent = new StreamContent(fileStream);
                    fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/png");
                    multipartContent.Add(fileContent, "media", Path.GetFileName(croppedFilePath));

                    var response = await httpClient.PostAsync(url + "/spinPrompt/createPromptPost", multipartContent);

                    if (response.IsSuccessStatusCode)
                    {
                        string apiResponse = await response.Content.ReadAsStringAsync();
                        HttpContext.Session.Remove("CroppedFilePath");
                        fileStream.Close();
                        return RedirectToAction("Profile", "Profile");
                    }
                    else
                    {
                        ViewBag.Response = "Failed to upload post: " + response.ReasonPhrase;
                        return View(p);
                    }
                }
                else 
                {
                    int showLikes = p.showLikes ? 1 : 0;
                    int allowComments = p.allowComments ? 1 : 0;
                    var multipartContent = new MultipartFormDataContent();

                    multipartContent.Add(new StringContent(p.caption ?? ""), "caption");
                    multipartContent.Add(new StringContent(allowComments.ToString()), "allowComments");
                    multipartContent.Add(new StringContent(showLikes.ToString()), "showLikes");
                    var fileStream = new FileStream(croppedFilePath, FileMode.Open, FileAccess.Read);
                    var fileContent = new StreamContent(fileStream);
                    fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/png");
                    multipartContent.Add(fileContent, "media", Path.GetFileName(croppedFilePath));
                    var response = await httpClient.PostAsync(url + "/posts/create", multipartContent);
                    if (response.IsSuccessStatusCode)
                    {
                        string apiResponse = await response.Content.ReadAsStringAsync();
                        HttpContext.Session.Remove("CroppedFilePath");
                        fileStream.Close();
                        return RedirectToAction("Profile", "Profile");
                    }
                    else
                    {
                        ViewBag.Response = "Failed to upload post: " + response.ReasonPhrase;
                        return View(p);
                    }
                }
            }
            catch (Exception ex)
            {
                ViewBag.Response = ex.Message;
                return View(p);
            }
        }



        // GET: UploadMediaController/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> UploadStory(IFormFile story)
        {
            try
            {
                var token = HttpContext.Session.GetString("Token");
                if (string.IsNullOrEmpty(token))
                    return RedirectToAction("Login");
                if (story == null || story.Length == 0)
                    return RedirectToAction(nameof(Profile));

                using var content = new MultipartFormDataContent();
                using var stream = story.OpenReadStream();
                var fileContent = new StreamContent(stream);
                fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(story.ContentType);

                content.Add(fileContent, "media", story.FileName);

                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                using (var response = await httpClient.PostAsync(url + "/story/uploadStory", content))
                {
                    string apiResponse = await response.Content.ReadAsStringAsync();
                }
                return RedirectToAction("Dashboard","Post");
            }
            catch
            {
                return View();
            }
        }
    }
}
