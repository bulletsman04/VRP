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
            var json = JsonConvert.SerializeObject(value);
            return json;
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
            {
                Warehouse addedWarehouse = new Warehouse {Location = new Point(warehouse.Lat, warehouse.Lng)};
                if (Db.Warehouses.FirstOrDefault((item) => item.Location == addedWarehouse.Location) == null)
                {
                    Db.Warehouses.Add(addedWarehouse);
                }
            }

            foreach (var courier in input.Couriers)
            {
                Courier addedCourier = new Courier { Location = new Point(courier.Lat, courier.Lng) };
                if (Db.Couriers.FirstOrDefault((item) => item.Location == addedCourier.Location) == null)
                {
                    Db.Couriers.Add(addedCourier);
                }
            }
            foreach (var package in input.Packages)
            {
                Package addedPackage = new Package { Location = new Point(package.Lat, package.Lng) };
                if (Db.Packages.FirstOrDefault((item) => item.Location == addedPackage.Location) == null)
                {
                    Db.Packages.Add(addedPackage);
                }
            }


            Db.SaveChanges();
           
            
        }

        public void Dispose()
        {
            Db.Dispose();
        }
    }
}
