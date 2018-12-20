using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NetTopologySuite.Geometries;
using Newtonsoft.Json;

namespace VRP.Model
{
    public class PointConverter : JsonConverter
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            var point = value as Point;
            LatLng latLng = new LatLng()
            {
                Lat = point.Coordinates[0].X,
                Lng = point.Coordinates[0].Y
            };
            //var latLng = $"lat:{point.Coordinates[0].X}, lng: {point.Coordinates[0].Y}";
            writer.WriteValue(JsonConvert.SerializeObject(latLng));
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            throw new NotImplementedException("Unnecessary because CanRead is false. The type will skip the converter.");
        }

        public override bool CanRead
        {
            get { return false; }
        }

        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(Point);
        }
    }
}
