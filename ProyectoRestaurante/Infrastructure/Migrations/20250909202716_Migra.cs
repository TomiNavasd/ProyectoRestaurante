using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Migra : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Dish_Category_CategoryId",
                table: "Dish");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "Dish",
                newName: "Category");

            migrationBuilder.RenameIndex(
                name: "IX_Dish_CategoryId",
                table: "Dish",
                newName: "IX_Dish_Category");

            migrationBuilder.AddForeignKey(
                name: "FK_Dish_Category_Category",
                table: "Dish",
                column: "Category",
                principalTable: "Category",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Dish_Category_Category",
                table: "Dish");

            migrationBuilder.RenameColumn(
                name: "Category",
                table: "Dish",
                newName: "CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_Dish_Category",
                table: "Dish",
                newName: "IX_Dish_CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Dish_Category_CategoryId",
                table: "Dish",
                column: "CategoryId",
                principalTable: "Category",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
