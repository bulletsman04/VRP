﻿using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

namespace VRP.Model
{
    [Table("Couriers")]
    public class Courier: MapElement
    {
        [ForeignKey("CourierId")]
        public ICollection<Package> Packages { get; set; }
    }
}