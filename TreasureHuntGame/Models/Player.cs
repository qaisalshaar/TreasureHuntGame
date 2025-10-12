using System.ComponentModel.DataAnnotations;

namespace TreasureHuntGame.Models
{
    public class Player
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string FullName { get; set; } = null!;


        [Required]
        public string Gender { get; set; } = null!;
        [Range(1, 3)]
        public int Level { get; set; }

        [Range(0, int.MaxValue)]
        public int FinalScore { get; set; }

        // 🔹 Navigation property for the related answers
        public ICollection<PlayerAnswer> PlayerAnswers { get; set; } = new List<PlayerAnswer>();
    }


}

