﻿$().ready(function () {
    var vrp = new VrpHelper('map',
        'http://192.168.99.100:32779/styles/osm-bright/style.json',
        'http://192.168.99.100:32777',
        [52.237049, 21.017532],
        13);
    $('#applyButton').on('click', event => vrp.SendData());
    vrp.GetData();
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

        this.packages = [];
        this.couriers = [];
        this.warehouses = [];

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
                this.warehouses.push(latLng);
                break;
            case "courier":
                marker = L.marker(latLng, { icon: VrpLibrary.courierIcon })
                    .bindPopup("Courier at Lat: " + latLng.lat + ", Long: " + latLng.lng);
                this.couriers.push(latLng);
                break;
            case "package":
                marker = L.marker(latLng, { icon: VrpLibrary.packageIcon })
                    .bindPopup("Package at Lat: " + latLng.lat + ", Long: " + latLng.lng);
                this.packages.push(latLng);
                break;
            default:
                return;
        }
        marker.addTo(this.map).openPopup();
    }

    SendData() {
        $.ajax({
            type: 'POST',
            url: 'api/vrp',
            data: JSON.stringify({
                Warehouses: this.warehouses,
                Couriers: this.couriers,
                Packages: this.packages
            }),
            contentType: 'application/json',
            success: function(result) {
                alert("udalo sie");
            },
            error: function(error) {
                alert("buu");
            }
        });
    }

    GetData() {
        this.GetWarehouses();
        this.GetCouriers();
        this.GetPackages();
    }

    GetWarehouses() {
        var vpr = this;
        $.ajax({
            type: 'GET',
            url: 'api/vrp/getWarehouses',
            dataType: 'json',
            contentType: 'application/json',
            success: function (result) {
                result.forEach(warehouse => {
                    vpr.warehouses.push(warehouse);
                    L.marker({ lat: warehouse.Lat, lng: warehouse.Lng}, { icon: VrpLibrary.warehouseIcon })
                        .bindPopup("Package at Lat: " + warehouse.Lat + ", Long: " + warehouse.Lng)
                        .addTo(vpr.map);
                });
            },
            error: function (error) {
                alert("buu warehouses");
            }
        });
    }

    GetCouriers() {
        var vpr = this;
        $.ajax({
            type: 'GET',
            url: 'api/vrp/getCouriers',
            dataType: 'json',
            contentType: 'application/json',
            success: function (result) {
                result.forEach(courier => {
                    vpr.couriers.push(courier);
                    L.marker({ lat: courier.Lat, lng: courier.Lng }, { icon: VrpLibrary.courierIcon })
                        .bindPopup("Package at Lat: " + courier.Lat + ", Long: " + courier.Lng)
                        .addTo(vpr.map);
                });
            },
            error: function (error) {
                var err = eval("(" + error.responseText + ")");
                alert(err.Message);            }
        });
    }

    GetPackages() {
        var vpr = this;
        $.ajax({
            type: 'GET',
            url: 'api/vrp/getPackages',
            dataType: 'json',
            contentType: 'application/json',
            success: function (result) {
                result.forEach(pack => {
                    vpr.packages.push(pack);
                    L.marker({ lat: pack.Lat, lng: pack.Lng }, { icon: VrpLibrary.packageIcon })
                        .bindPopup("Package at Lat: " + pack.Lat + ", Long: " + pack.Lng)
                        .addTo(vpr.map);
                });
            },
            error: function (error) {
                alert("buu packages");
            }
        });
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