using Microsoft.EntityFrameworkCore.Migrations;

namespace VRP.Migrations
{
    public partial class migrationNo2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CapacityForCouriers",
                table: "Warehouses",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Warehouses",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PlaceInfo",
                table: "Warehouses",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CourierId",
                table: "Packages",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Packages",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PlaceInfo",
                table: "Packages",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WarehouseId",
                table: "Packages",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Couriers",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WarehouseId",
                table: "Couriers",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Packages_CourierId",
                table: "Packages",
                column: "CourierId");

            migrationBuilder.CreateIndex(
                name: "IX_Packages_WarehouseId",
                table: "Packages",
                column: "WarehouseId");

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

            migrationBuilder.AddForeignKey(
                name: "FK_Packages_Couriers_CourierId",
                table: "Packages",
                column: "CourierId",
                principalTable: "Couriers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Packages_Warehouses_WarehouseId",
                table: "Packages",
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

            migrationBuilder.DropForeignKey(
                name: "FK_Packages_Couriers_CourierId",
                table: "Packages");

            migrationBuilder.DropForeignKey(
                name: "FK_Packages_Warehouses_WarehouseId",
                table: "Packages");

            migrationBuilder.DropIndex(
                name: "IX_Packages_CourierId",
                table: "Packages");

            migrationBuilder.DropIndex(
                name: "IX_Packages_WarehouseId",
                table: "Packages");

            migrationBuilder.DropIndex(
                name: "IX_Couriers_WarehouseId",
                table: "Couriers");

            migrationBuilder.DropColumn(
                name: "CapacityForCouriers",
                table: "Warehouses");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Warehouses");

            migrationBuilder.DropColumn(
                name: "PlaceInfo",
                table: "Warehouses");

            migrationBuilder.DropColumn(
                name: "CourierId",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "PlaceInfo",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "WarehouseId",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Couriers");

            migrationBuilder.DropColumn(
                name: "WarehouseId",
                table: "Couriers");
        }
    }
}
