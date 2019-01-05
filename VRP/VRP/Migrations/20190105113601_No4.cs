using Microsoft.EntityFrameworkCore.Migrations;

namespace VRP.Migrations
{
    public partial class No4 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WarehouseId",
                table: "Couriers",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Couriers_WarehouseId",
                table: "Couriers",
                column: "WarehouseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Couriers_Warehouses_WarehouseId",
                table: "Couriers",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Couriers_Warehouses_WarehouseId",
                table: "Couriers");

            migrationBuilder.DropIndex(
                name: "IX_Couriers_WarehouseId",
                table: "Couriers");

            migrationBuilder.DropColumn(
                name: "WarehouseId",
                table: "Couriers");
        }
    }
}
