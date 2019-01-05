using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

namespace VRP.Model
{
    [Table("Packages")]
    public class Package: MapElement
    {
        public string PlaceInfo { get; set; }
    }
}