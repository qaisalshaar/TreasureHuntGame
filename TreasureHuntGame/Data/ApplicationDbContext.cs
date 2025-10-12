using Microsoft.EntityFrameworkCore;
using TreasureHuntGame.Models;

namespace TreasureHuntGame.Data
{
    public class ApplicationDbContext : DbContext
    {

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Player> Players { get; set; }
        public DbSet<PlayerAnswer> PlayerAnswers { get; set; }
    }
}
