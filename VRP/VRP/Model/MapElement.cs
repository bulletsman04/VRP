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
    [JsonConverter(typeof(MapElementConverter))]
    public class MapElement
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [JsonConverter(typeof(PointConverter))]
        public Point Location { get; set; }
    }
}
