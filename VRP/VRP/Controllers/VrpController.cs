using System;
using Microsoft.AspNetCore.Mvc;
using NetTopologySuite.Geometries;
using VRP.Context;
using VRP.Model;

namespace VRP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VrpController : ControllerBase, IDisposable
    {
        public VrpGisDbContext Db { get; set; } = new VrpGisDbContext();

        [HttpPost]
        public void Post([FromBody] Collections input)
        {
            foreach (var warehouse in input.Warehouses)
                Db.Warehouses.Add(new Warehouse {Location = new Point(warehouse.Lat, warehouse.Lng)});
            foreach (var courier in input.Couriers)
                Db.Couriers.Add(new Courier { Location = new Point(courier.Lat, courier.Lng) });
            foreach (var package in input.Packages)
                Db.Packages.Add(new Package { Location = new Point(package.Lat, package.Lng) });
            Db.SaveChanges();
        }

        public void Dispose()
        {
            Db.Dispose();
        }
    }
}
