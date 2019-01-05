using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using NetTopologySuite.Geometries;
using Newtonsoft.Json;

namespace VRP.Model
{
    public class MapElement
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [JsonConverter(typeof(PointLatLngConverter)), Column("Location")]
        public Point LatLng { get; set; }
        public string Name { get; set; }
    }
}