using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace VRP.Model
{
    public class Collections
    {
        public List<LatLng> Warehouses { get; set; }
        public List<LatLng> Couriers { get; set; }
        public List<LatLng> Packages { get; set; }
    }
}