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

        [HttpGet, Route("createUserId")]
        public string CreateUserId() => Request.GetHashCode().ToString() + Request.HttpContext.GetHashCode();

        [HttpGet, Route("getWarehouses/{id}")]
        public string GetWarehouses(string id) => Json(Db.Warehouses.Where(warehouse => warehouse.UserId == id));

        [HttpGet, Route("getPackages/{id}")]
        public string GetPackages(string id) => Json(Db.Packages.Where(package => package.UserId == id));

        [HttpPost, Route("{id}")]
        public void Post(string id, [FromBody] Collections input)
        {
            Db.Warehouses.RemoveRange(Db.Warehouses);
            Db.Packages.RemoveRange(Db.Packages);

            input.Warehouses.ForEach(warehouse => warehouse.UserId = id);
            input.Packages.ForEach(package => package.UserId = id);

            Db.AddRange(input.Warehouses);
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
