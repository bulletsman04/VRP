using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using Newtonsoft.Json;
using VRP.Context;
using VRP.Functionality;
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
        public string GetCouriers() => Json(Db.Couriers);

        [HttpGet, Route("getPackages")]
        public string GetPackages() => Json(Db.Packages);

        [HttpPost]
        public void Post([FromBody] Collections input)
        {
            Db.Warehouses.RemoveRange(Db.Warehouses);
            Db.Couriers.RemoveRange(Db.Couriers);
            Db.Packages.RemoveRange(Db.Packages);
            //Db.Database.ExecuteSqlCommand("TRUNCATE TABLE public.\"Packages\"");
            //Db.Database.ExecuteSqlCommand("TRUNCATE TABLE public.\"Couriers\"");
            //Db.Database.ExecuteSqlCommand("TRUNCATE TABLE public.\"Warehouses\"");

            Db.AddRange(input.Warehouses);
            Db.AddRange(input.Couriers);
            Db.AddRange(input.Packages);

            Db.SaveChanges();
        }

        [HttpPost, Route("calculateRoutes")]
        public List<List<int>> CalculateRoutes([FromBody] DistancesInfo data)
        {
            NaiveMultipleTspSolver solver = new NaiveMultipleTspSolver(data.Fields);
            int[] couriers = new int[data.Fields.GetLength(0)-data.CourierId];

            for (int i = 0; i < couriers.Length; i++)
            {
                couriers[i] = data.CourierId + i;
            }

            var routes = solver.Solve(couriers);

            return routes;
        }

        public void Dispose()
        {
            Db.Dispose();
        }
    }
}
