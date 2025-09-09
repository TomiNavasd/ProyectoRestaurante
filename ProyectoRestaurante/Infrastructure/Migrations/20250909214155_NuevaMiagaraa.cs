using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NuevaMiagaraa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Order_DeliveryType_DeliveryTypeId",
                table: "Order");

            migrationBuilder.DropForeignKey(
                name: "FK_Order_Status_StatusId",
                table: "Order");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderItem_Order_OrderId",
                table: "OrderItem");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderItem_Status_StatusId",
                table: "OrderItem");

            migrationBuilder.RenameColumn(
                name: "StatusId",
                table: "OrderItem",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "OrderId",
                table: "OrderItem",
                newName: "Order");

            migrationBuilder.RenameIndex(
                name: "IX_OrderItem_StatusId",
                table: "OrderItem",
                newName: "IX_OrderItem_Status");

            migrationBuilder.RenameIndex(
                name: "IX_OrderItem_OrderId",
                table: "OrderItem",
                newName: "IX_OrderItem_Order");

            migrationBuilder.RenameColumn(
                name: "StatusId",
                table: "Order",
                newName: "OverallStatus");

            migrationBuilder.RenameColumn(
                name: "DeliveryTypeId",
                table: "Order",
                newName: "DeliveryType");

            migrationBuilder.RenameIndex(
                name: "IX_Order_StatusId",
                table: "Order",
                newName: "IX_Order_OverallStatus");

            migrationBuilder.RenameIndex(
                name: "IX_Order_DeliveryTypeId",
                table: "Order",
                newName: "IX_Order_DeliveryType");

            migrationBuilder.UpdateData(
                table: "DeliveryType",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Take away");

            migrationBuilder.AddForeignKey(
                name: "FK_Order_DeliveryType_DeliveryType",
                table: "Order",
                column: "DeliveryType",
                principalTable: "DeliveryType",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Order_Status_OverallStatus",
                table: "Order",
                column: "OverallStatus",
                principalTable: "Status",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItem_Order_Order",
                table: "OrderItem",
                column: "Order",
                principalTable: "Order",
                principalColumn: "OrderId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItem_Status_Status",
                table: "OrderItem",
                column: "Status",
                principalTable: "Status",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Order_DeliveryType_DeliveryType",
                table: "Order");

            migrationBuilder.DropForeignKey(
                name: "FK_Order_Status_OverallStatus",
                table: "Order");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderItem_Order_Order",
                table: "OrderItem");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderItem_Status_Status",
                table: "OrderItem");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "OrderItem",
                newName: "StatusId");

            migrationBuilder.RenameColumn(
                name: "Order",
                table: "OrderItem",
                newName: "OrderId");

            migrationBuilder.RenameIndex(
                name: "IX_OrderItem_Status",
                table: "OrderItem",
                newName: "IX_OrderItem_StatusId");

            migrationBuilder.RenameIndex(
                name: "IX_OrderItem_Order",
                table: "OrderItem",
                newName: "IX_OrderItem_OrderId");

            migrationBuilder.RenameColumn(
                name: "OverallStatus",
                table: "Order",
                newName: "StatusId");

            migrationBuilder.RenameColumn(
                name: "DeliveryType",
                table: "Order",
                newName: "DeliveryTypeId");

            migrationBuilder.RenameIndex(
                name: "IX_Order_OverallStatus",
                table: "Order",
                newName: "IX_Order_StatusId");

            migrationBuilder.RenameIndex(
                name: "IX_Order_DeliveryType",
                table: "Order",
                newName: "IX_Order_DeliveryTypeId");

            migrationBuilder.UpdateData(
                table: "DeliveryType",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Takeaway");

            migrationBuilder.AddForeignKey(
                name: "FK_Order_DeliveryType_DeliveryTypeId",
                table: "Order",
                column: "DeliveryTypeId",
                principalTable: "DeliveryType",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Order_Status_StatusId",
                table: "Order",
                column: "StatusId",
                principalTable: "Status",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItem_Order_OrderId",
                table: "OrderItem",
                column: "OrderId",
                principalTable: "Order",
                principalColumn: "OrderId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItem_Status_StatusId",
                table: "OrderItem",
                column: "StatusId",
                principalTable: "Status",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
