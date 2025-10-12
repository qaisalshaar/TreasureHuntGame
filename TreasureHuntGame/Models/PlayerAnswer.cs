using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace TreasureHuntGame.Models
{
    public class PlayerAnswer
    {

        public int Id { get; set; }
        public int PlayerId { get; set; }       // FK to Player
        public List<string> Questions { get; set; } = new List<string>();
        public List<string> PlayerAnswers { get; set; } = new List<string>();
        public List<string> CorrectAnswers { get; set; } = new List<string>();
        public int Level { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        // Navigation property

        public Player Player { get; set; } = null!;


    }
}
