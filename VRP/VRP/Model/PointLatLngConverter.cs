using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NetTopologySuite.Geometries;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace VRP.Model
{
    public class PointLatLngConverter : JsonConverter
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            var location = value as Point;
            if(location == null) throw new ArgumentException($"Excepted: MapElement, got: {value.GetType()}");
            JObject o = JObject.FromObject(
                new LatLng
                    {
                        Lat = location.Coordinates[0].X,
                        Lng = location.Coordinates[0].Y
                    });
            
            o.WriteTo(writer);
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            LatLng location = serializer.Deserialize<LatLng>(reader);
            return new Point(location.Lat, location.Lng);
        }

        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(Point);
        }
    }
}
