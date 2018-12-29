﻿$().ready(function() {
    var vrp = new VrpHelper('map',
         'http://192.168.99.100:32769/styles/osm-bright/style.json',
        'http://192.168.99.100:32776/route',
        [52.237049, 21.017532],
        13);
    $('#applyButton').on('click', event => vrp.SendData());
    $('#calculateButton').on('click', event => vrp.CalculateRoutes());

    vrp.GetData();
});

class VrpHelper {
    constructor(mapContainer, mapServer, graphHopperServer, initialView, initialZoom) {
        this.map = L.map(mapContainer).setView(initialView, initialZoom);

        L.mapboxGL({
            style: mapServer,
            accessToken: 'no-token'
        }).addTo(this.map);

        this.GHServer = graphHopperServer;
        this.Controller = L.Routing.control({
            router: L.Routing.graphHopper(undefined,
                {
                    serviceUrl: graphHopperServer
                })

        });

        this.CurrentMarker = null;

        this.routingControllers = [[], []];
        this.routingControllersCount = 0;

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
        // ToDo: Better remove whole popup
     
        if (this.CurrentMarker !== null) {
            this.map.removeLayer(this.CurrentMarker);
            this.CurrentMarker.closePopup();
        }
        this.PlaceMarker(event.latlng, $("input[name='pointType']:checked").val());
    }

    PlaceMarker(latLng, type) {
        var marker;
        var element = new Object();
        element.Lat = latLng.lat;
        element.Lng = latLng.lng;
        switch (type) {
        case "warehouse":
                marker = L.marker(latLng, { icon: VrpLibrary.warehouseIcon });
            this.AddElementsForm(marker, element, this.warehouses,type,"add");
            break;
        case "package":
            marker = L.marker(latLng, { icon: VrpLibrary.packageIcon });
            this.AddElementsForm(marker, element, this.packages, type, "add");
            break;
        default:
            return;
        }
    }

    async AddElementsForm(marker, element,elements, type, mode) {
  
        var clone = $("#form-template").clone();
        var content = clone.prop('content');

        var form = content.firstElementChild;
        
        await marker.bindPopup($(form).html(), { minWidth: 300, autoPanPaddingBottomRight: (0, 0) });

        marker.addTo(this.map).openPopup();
        marker.on('popupclose', event => marker.unbindPopup());

        this.CurrentMarker = marker;
        $(".leaflet-popup-content").find("#added-X").val(element.Lat);
        $(".leaflet-popup-content").find("#added-Y").val(element.Lng);

        if (type === "package") {
            $(".leaflet-popup-content").find("#couriers-form-group").remove();
        }

        if (mode === "add") {
            $(".leaflet-popup-content").find("#elements-form-btn")
                .on('click', this.AddElement.bind(this, element, elements, marker, type));
        }
        else if (mode === "edit") {
            $(".leaflet-popup-content").find("#added-name").val(element.name);
            $(".leaflet-popup-content").find("#elements-form-btn")
                .on('click', this.EditElement.bind(this, element, elements, marker, type));
        }


    }

    AddElement(element, elements, marker, type) {
        // ToDo: probably needed counter becouse of removing problems - also dictionaries insted of arrays of elements
        element.localId = elements.length;
        element.name = $(".leaflet-popup-content").find("#added-name").val();
        elements.push(element);
        this.CurrentMarker = null;
        marker.closePopup();
        marker.on('click', this.AddElementsForm.bind(this,marker, element, elements, type, "edit"));
        this.AddPackageToList(element);
    }

    EditElement(element, elements, marker, type) {
        element.name = $(".leaflet-popup-content").find("#added-name").val();
        element.Lat = $(".leaflet-popup-content").find("#added-X").val();
        element.Lng = $(".leaflet-popup-content").find("#added-Y").val();
        elements[element.localId] = element;
        // ToDo: repeated code
        this.CurrentMarker = null;
        marker.closePopup();
        marker.on('click', this.AddElementsForm.bind(this, marker, element, elements, type, "edit"));

        // ToDo: Change items info in packages, werehouses and couriers lists 
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
            success: function(result) {
                result.forEach(warehouse => {
                    vpr.warehouses.push(warehouse);
                    L.marker({ lat: warehouse.Lat, lng: warehouse.Lng }, { icon: VrpLibrary.warehouseIcon })
                        .bindPopup("Package at Lat: " + warehouse.Lat + ", Long: " + warehouse.Lng)
                        .addTo(vpr.map);
                });
            },
            error: function(error) {
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
            success: function(result) {
                result.forEach(courier => {
                    vpr.couriers.push(courier);
                    L.marker({ lat: courier.Lat, lng: courier.Lng }, { icon: VrpLibrary.courierIcon })
                        .bindPopup("Package at Lat: " + courier.Lat + ", Long: " + courier.Lng)
                        .addTo(vpr.map);
                });
            },
            error: function(error) {
                var err = eval("(" + error.responseText + ")");
                alert(err.Message);
            }
        });
    }

    GetPackages() {
        var vpr = this;
        $.ajax({
            type: 'GET',
            url: 'api/vrp/getPackages',
            dataType: 'json',
            contentType: 'application/json',
            success: function(result) {
                result.forEach(pack => {
                    vpr.packages.push(pack);
                    L.marker({ lat: pack.Lat, lng: pack.Lng }, { icon: VrpLibrary.packageIcon })
                        .bindPopup("Package at Lat: " + pack.Lat + ", Long: " + pack.Lng)
                        .addTo(vpr.map);
                    vpr.AddPackageToList(pack);
                });
            },
            error: function(error) {
                alert("buu packages");
            }
        });
    }

     AddPackageToList(item) {

       

        var clone = $("#package-template").clone();
        var content = clone.prop('content');
        var pack = $(content).find("#package");
        pack.attr("id", "package" + item.id);
        $(content).find("#package-name").html(item.name);
        $(content).find("#package-x").html(item.Lng.toString().substring(0,6));
         $(content).find("#package-y").html(item.Lat.toString().substring(0,6));
        //$(content).find("#edit").click(packageManager.editItem.bind(packageManager, item.id));
        $(content).find("#edit").attr("id", "edit" + item.id);
        //$(content).find("#remove").click(packageManager.removeItem.bind(packageManager, item.id));
        $(content).find("#remove").attr("id", "remove" + item.id);
        $("#packages").append(pack);

    }

    async CalculateRoutes() {

        var packages = this.packages;
        var couriers = this.couriers;

        var packagesLength = packages.length;
        var couriersLength = couriers.length;


        var distances = new Array(packagesLength + couriersLength);

        for (var i = 0; i < packagesLength + couriersLength; i++) {
            distances[i] = new Array(packagesLength);
        }
        var distance = 0;

        for (var i = 0; i < packages.length; i++) {

            var package1 = packages[i];

            for (var j = i; j < packages.length; j++) {

                var package2 = packages[j];
                
                // ask graphhopper for dist between two packages
                distance = await this.GetDistanceBetweenPoints(
                    { latLng: L.latLng([package1.Lat, package1.Lng]) },
                    { latLng: L.latLng([package2.Lat, package2.Lng]) });


                distances[i][j] = distance;
                distances[j][i] = distance;
            }
        }
        
        for (var i = 0; i < couriers.length; i++) {

            var courier = couriers[i];

            for (var j = 0; j < packages.length; j++) {

                var packageC = packages[j];
                
                // ask graphhopper for dist between courier and package
                distance = await this.GetDistanceBetweenPoints(
                    { latLng: L.latLng([courier.Lat, courier.Lng]) },
                    { latLng: L.latLng([packageC.Lat, packageC.Lng]) });

                distances[packagesLength + i][j] = distance;
            }
        }

        var routingArguments = {};
        routingArguments.Fields = distances;
        routingArguments.CourierId = packagesLength;
        
        var vrpHelper = this;

        // Asking server to solve TSP and after success showing routes
        $.ajax({
            type: 'POST',
            url: 'api/vrp/calculateRoutes',
            data: JSON.stringify(routingArguments),
            contentType: 'application/json',
            dataType: "json",
            success: function (result) {
                vrpHelper.ShowRoutes(result);
            },
            error: function(error) {
                alert("buu");
            }
        });

    }

    ShowRoutes(result) {

        for (var i = 0; i < result.length; i++) {

            var controller = L.Routing.control({
                router: L.Routing.graphHopper(undefined,
                    {
                        serviceUrl: this.GHServer
                    })

            }).addTo(this.map);

            this.routingControllers[0].push(controller);
            this.routingControllers[1].push(true);

            // controller.hide(); - hides window with directions

            var coordinates = [];

            var courier = this.couriers[i];
            coordinates.push(L.latLng([courier.Lat, courier.Lng]));

            var points = result[i];

            for (var j = 0; j < points.length; j++) {

                var packageC = this.packages[points[j]];

                coordinates.push(L.latLng([packageC.Lat, packageC.Lng]));
            }

            // Back to home
            // coordinates.push(L.latLng([courier.Lat, courier.Lng]));

            controller.setWaypoints(coordinates);
            var router = controller.getRouter();

            var promise = new Promise((resolve, reject) => {
                router.route(coordinates,
                    (err, routes) => {

                        if (routes !== undefined) {
                            resolve(routes[0].summary.totalDistance / 1000);
                        }

                    });
            });
            promise.then(this.addRemovingButton());
        }


    }

    addRemovingButton() {
        var button = document.createElement("button");
        button.innerHTML = "Add/remove route " + (this.routingControllersCount + 1);
        button.addEventListener('click', this.addRemoveController.bind(this, this.routingControllersCount));
        this.routingControllersCount++;
        $("#settings").append(button);
    }

    addRemoveController(index) {
        var controller = this.routingControllers[0][index];
        var isShown = this.routingControllers[1][index];

        if (isShown) {
            this.map.removeControl(controller);
            this.routingControllers[1][index] = false;
        } else {
            controller.addTo(this.map);
            this.routingControllers[1][index] = true;
        }

    }

    async GetDistanceBetweenPoints(latLng1, latLng2) {

        var coordinates = [];
        coordinates.push(latLng1);
        coordinates.push(latLng2);

        var router = this.Controller.getRouter();
        var distance = 0;

        var promise = new Promise((resolve, reject) => {
            router.route(coordinates,
                (err, routes) => {

                    if (routes !== undefined) {
                        resolve(routes[0].summary.totalDistance / 1000);
                    }

                });
        });
        distance = await promise;

        return distance;
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