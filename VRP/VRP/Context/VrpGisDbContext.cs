using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using VRP.Model;

namespace VRP.Context
{
    public class VrpGisDbContext : DbContext
    {
        public VrpGisDbContext() { }
        public VrpGisDbContext(DbContextOptions<VrpGisDbContext> options) : base(options) { }
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<Courier> Couriers { get; set; }
        public DbSet<Package> Packages { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.HasPostgresExtension("postgis");
            base.OnModelCreating(builder);
        }
        protected override void OnConfiguring(DbContextOptionsBuilder builder)
        {
            builder.UseNpgsql("Host=192.168.99.100;Port=5432;Database=vrp;Username=bulletsman04;Password=12345A",
                o => o.UseNetTopologySuite());
        }
    }
}