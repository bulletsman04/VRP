using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using Newtonsoft.Json;
using VRP.Context;
using VRP.Model;

namespace VRP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VrpController : ControllerBase, IDisposable
    {
        public VrpGisDbContext Db { get; set; } = new VrpGisDbContext();

        [NonAction]
        public string Json(object value)
        {
            JsonSerializer serializer = GeoJsonSerializer.Create();
            var json = new StringWriter();
            serializer.Serialize(json, value);
            return json.ToString();
        }

        [HttpGet, Route("getWarehouses")]
        public string GetWarehouses() => Json(Db.Warehouses);

        [HttpGet, Route("getCouriers")]
        public IEnumerable<Courier> GetCouriers() => Db.Couriers.ToList();

        [HttpGet, Route("getPackages")]
        public string GetPackages() => Json(Db.Packages);

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

        //[HttpPost, Route("calculateRoutes")]
        //public List<List<int>> CalculateRoutes([FromBody] List<int> input)
        //{

        //    return null;
        //}

        public void Dispose()
        {
            Db.Dispose();
        }
    }
}
