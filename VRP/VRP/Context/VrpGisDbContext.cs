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

            builder.UseNpgsql("Host=89.70.244.118;Port=5432;Database=gis;Username=admin;Password=admin123",
                o => o.UseNetTopologySuite());
        }
    }
}