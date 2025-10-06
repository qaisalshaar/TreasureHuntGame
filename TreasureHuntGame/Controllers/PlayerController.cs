using Microsoft.AspNetCore.Mvc;
using TreasureHuntGame.Data;
using TreasureHuntGame.Models;

namespace TreasureHuntGame.Controllers
{
    [Route("api/player")]
    [ApiController]
    public class PlayerController : Controller
    {
        private readonly ApplicationDbContext _context;

        public PlayerController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }
        [HttpGet("/Player/Playersrank")]
        public IActionResult Playersrank()
        {

            var players = _context.Players
                          .OrderByDescending(p => p.FinalScore)
                          .ToList();

            return View(players);
        }

        [HttpPost("Save")]
        public async Task<IActionResult> SavePlayer([FromBody] Player player)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Players.Add(player);
            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = "Player Created successfully!";
            return Ok(new { message = "Player saved successfully!" });
            //return Json(new { message = TempData["SuccessMessage"] });
        }
    }
}
