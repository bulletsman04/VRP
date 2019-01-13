using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace VRP.Model
{
    public class Collections
    {
        public List<Warehouse> Warehouses { get; set; }
        public List<Package> Packages { get; set; }
    }
}