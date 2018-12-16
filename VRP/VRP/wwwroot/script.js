$().ready(function () {
    var vrp = new VrpHelper('map',
        'http://89.70.244.118:27017/styles/osm-bright/style.json',
        'http://89.70.244.118:27018',
        [52.237049, 21.017532],
        13);
});

class VrpHelper {
    constructor(mapContainer, mapServer, graphHopperServer, initialView, initialZoom) {
        this.map = L.map(mapContainer).setView(initialView, initialZoom);
        L.mapboxGL({
            style: mapServer,
            accessToken: 'no-token'
        }).addTo(this.map);

        L.Routing.control({
            router: L.Routing.graphHopper(undefined, {
                serviceUrl: graphHopperServer
            })
        }).addTo(this.map);

        var packages = [];
        var couriers = [];
        var warehouses = [];

        this.map.on('click', event => this.OnMapClick(event));
        //    L.Routing.control({
        //        waypoints: [
        //            L.latLng(lastPoint),
        //            L.latLng(e.latlng)
        //        ]
        //    }).addTo(map);
        //    L.marker(e.latlng)
        //        .bindPopup("Lat: " + e.latlng.lat + ", Long: " + e.latlng.lng)
        //        .addTo(map)
        //        .openPopup();
        //    lastPoint = e.latlng;
        //});
    }

    OnMapClick(event) {
        this.PlaceMarker(event.latlng, $("input[name='pointType']:checked").val());
    }

    PlaceMarker(latLng, type) {
        var marker;
        switch (type) {
            case "warehouse":
                marker = L.marker(latLng, { icon: VrpLibrary.warehouseIcon })
                    .bindPopup("Warehouse at Lat: " + latLng.lat + ", Long: " + latLng.lng);
                break;
            case "courier":
                marker = L.marker(latLng, { icon: VrpLibrary.courierIcon })
                    .bindPopup("Courier at Lat: " + latLng.lat + ", Long: " + latLng.lng);
                break;
            case "package":
                marker = L.marker(latLng, { icon: VrpLibrary.packageIcon })
                    .bindPopup("Package at Lat: " + latLng.lat + ", Long: " + latLng.lng);
                break;
            default:
                return;
        }
        marker.addTo(this.map).openPopup();
    }
}

class VrpLibrary {
    static get warehouseIcon() {
        return L.icon({
            iconUrl: 'icons/warehouse.ico',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });
    }
    static get courierIcon() {
        return L.icon({
            iconUrl: 'icons/courier.ico',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });
    }
    static get packageIcon() {
        return L.icon({
            iconUrl: 'icons/package.ico',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
        });
    }
}