using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

namespace VRP.Model
{
    [Table("Warehouses")]
    public class Warehouse: MapElement
    {
        [ForeignKey("WarehouseId")]
        public ICollection<Package> StoredPackages { get; set; }
        [ForeignKey("WarehouseId")]
        public ICollection<Courier> Couriers { get; set; }
        public string PlaceInfo { get; set; }
        public int CapacityForCouriers { get; set; }
    }
}