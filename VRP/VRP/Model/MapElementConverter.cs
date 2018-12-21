using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace VRP.Model
{
    public class MapElementConverter : JsonConverter
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            var mapElement = value as MapElement;
            var point = mapElement.Location;
            LatLng latLng = new LatLng()
            {
                Lat = point.Coordinates[0].X,
                Lng = point.Coordinates[0].Y
            };
            JObject o = JObject.FromObject(latLng);
            
            o.WriteTo(writer);
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
            return objectType == typeof(MapElement);
        }
    }
}
