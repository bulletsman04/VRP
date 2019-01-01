using Microsoft.EntityFrameworkCore.Migrations;

namespace VRP.Migrations
{
    public partial class No3 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Warehouses",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Packages",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Couriers",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "Warehouses");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Couriers");
        }
    }
}
