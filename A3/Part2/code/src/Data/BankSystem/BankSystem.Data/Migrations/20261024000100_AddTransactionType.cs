namespace BankSystem.Data.Migrations
{
    using Microsoft.EntityFrameworkCore.Infrastructure;
    using Microsoft.EntityFrameworkCore.Migrations;
    [DbContext(typeof(BankSystemDbContext))]
    [Migration("20261024000100_AddTransactionType")]
    public class AddTransactionType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
            => migrationBuilder.AddColumn<string>("TransactionType", "Transfers", maxLength: 24,
                nullable: false, defaultValue: "Transfer");
        protected override void Down(MigrationBuilder migrationBuilder)
            => migrationBuilder.DropColumn("TransactionType", "Transfers");
    }
}
