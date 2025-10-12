//using Microsoft.AspNetCore.Mvc;
//using TreasureHuntGame.Data;
//using TreasureHuntGame.Models;

//namespace TreasureHuntGame.Controllers
//{
//    [Route("api/player")]
//    [ApiController]
//    public class PlayerController : Controller
//    {
//        private readonly ApplicationDbContext _context;

//        public PlayerController(ApplicationDbContext context)
//        {
//            _context = context;
//        }

//        public IActionResult Index()
//        {
//            return View();
//        }
//        [HttpGet("/Player/Playersrank")]
//        public IActionResult Playersrank()
//        {

//            var players = _context.Players
//                          .OrderByDescending(p => p.FinalScore)
//                          .ToList();

//            return View(players);
//        }

//        [HttpPost("Save")]
//        public async Task<IActionResult> SavePlayer([FromBody] Player player)
//        {
//            if (!ModelState.IsValid)
//                return BadRequest(ModelState);

//            _context.Players.Add(player);
//            await _context.SaveChangesAsync();

//            TempData["SuccessMessage"] = "Player Created successfully!";
//            return Ok(new { message = "Player saved successfully!" });
//            //return Json(new { message = TempData["SuccessMessage"] });
//        }
//    }
//}


using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using TreasureHuntGame.Data;
using TreasureHuntGame.Migrations;
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

        // For debugging: you can view players ranking in browser
        [HttpGet("/Player/Playersrank")]
        public IActionResult Playersrank()
        {
            var players = _context.Players
                .OrderByDescending(p => p.FinalScore)
                .ToList();

            return View(players);
        }

        // Save player after finishing the game
        [HttpPost("save")]
        public async Task<IActionResult> SavePlayer([FromBody] Player player)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Players.Add(player);
            await _context.SaveChangesAsync();
            TempData["SuccessMessage"] = "Player Created successfully!";
            return Ok(new { message = "✅ Player saved successfully!", playerId = player.Id });
        }




        [HttpPost("SaveAnswers")]
        public async Task<IActionResult> SaveAnswers([FromBody] List<PlayerAnswerDto> answers)
        {
            if (answers == null || !answers.Any())
                return BadRequest("No answers submitted.");

            foreach (var a in answers)
            {
                // Decode any escaped Unicode (like \u002B)
                string decodedQuestion = Regex.Unescape(a.QuestionText);
                string decodedPlayerAnswer = Regex.Unescape(a.PlayerAnswer);
                string decodedCorrectAnswer = Regex.Unescape(a.CorrectAnswer);

                var playerAnswer = new PlayerAnswer
                {
                    PlayerId = a.PlayerId,
                    Questions = new List<string> { decodedQuestion },
                    PlayerAnswers = new List<string> { decodedPlayerAnswer },
                    CorrectAnswers = new List<string> { decodedCorrectAnswer },
                    Level = a.Level
                };

                _context.PlayerAnswers.Add(playerAnswer);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Player answers saved successfully!" });
        }




        // DTO to receive answers
        public class PlayerAnswerDto
        {
            public int PlayerId { get; set; }
            public string QuestionText { get; set; } = string.Empty;
            public string PlayerAnswer { get; set; } = string.Empty;
            public string CorrectAnswer { get; set; } = string.Empty;
            public int Level { get; set; }
        }




    }
}
