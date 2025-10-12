using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TreasureHuntGame.Migrations
{
    /// <inheritdoc />
    public partial class levelstables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Age",
                table: "Players",
                newName: "Level");

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Gender",
                table: "Players");

            migrationBuilder.RenameColumn(
                name: "Level",
                table: "Players",
                newName: "Age");
        }
    }
}
