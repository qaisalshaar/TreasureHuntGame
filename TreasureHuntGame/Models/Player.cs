using System.ComponentModel.DataAnnotations;

namespace TreasureHuntGame.Models
{
    public class Player
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; } = null!;

        [Range(5, 120)]
        [Required]
        public int Age { get; set; }

        public int FinalScore { get; set; }
    }


}

