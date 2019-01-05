using Microsoft.EntityFrameworkCore.Migrations;

namespace VRP.Migrations
{
    public partial class No5 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CapacityForCouriers",
                table: "Warehouses",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CapacityForCouriers",
                table: "Warehouses");
        }
    }
}
