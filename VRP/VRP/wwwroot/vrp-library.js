function googleLoaded() {
    var vrp = new VrpHelper('map',
        'http://89.70.244.118:27017/styles/osm-bright/style.json',
        'http://89.70.244.118:27018/route',
        [52.237049, 21.017532],
        13);
    $('#applyButton').on('click', event => vrp.SendData());
    $('#clearButton').on('click', event => vrp.ClearElements());
    $('#calculateButton').on('click', event => vrp.CalculateRoutes());
    $('#startSimulation').on('click', event => vrp.StartSimulation());
    vrp.SetSearchBox();
    vrp.GetWarehouses();
}

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
        this.CenteredElement = null;

        this.Routes = [];
        this.Controllers = [];

        this.packages = {};
        this.couriers = {};
        this.warehouses = {};
        this.PackagesMaxid = 0;
        this.CouriersMaxid = 0;
        this.WarehousesMaxid = 0;


        this.map.on('click', event => this.OnMapClick(event));
    }

    OnMapClick(event) {
        if (this.CurrentMarker !== null) {
            this.map.removeLayer(this.CurrentMarker);
            this.CurrentMarker.closePopup();
        }
        this.PlaceMarker({ Lat: event.latlng.lat, Lng: event.latlng.lng }, $("#add").val());
    }

    PlaceMarker(latLng, type,placeName) {
        var id;
        switch (type) {
            case "warehouse":
                id = this.WarehousesMaxid + 1;
                var warehouse = new Warehouse(this, id, latLng, true,placeName);
                this.warehouses[id] = warehouse;
                warehouse.BindMarker();
                this.CurrentMarker = warehouse.Marker;
                warehouse.Marker.openPopup();
                break;
            case "package":
                id = this.WarehousesMaxid + 1;
                var pack = new Package(this, id, latLng, true, placeName);
                this.packages[id] = pack;
                pack.BindMarker();
                this.CurrentMarker = pack.Marker;
                pack.Marker.openPopup();
                break;
            default:
                return;
        }
    }

    SetSearchBox() {
     
        var input = document.getElementById('searchbox');
        var options = {
            componentRestrictions: { country: 'pl' },
            types: ['geocode']
        };
        this.Autocomplete = new google.maps.places.Autocomplete(input, options);
        var vrp = this;
        this.Autocomplete.addListener('place_changed', function() {
            vrp.HandlePlaceChanged();
        });
    }

    HandlePlaceChanged() {
        var place = this.Autocomplete.getPlace();
        var latLng = { Lat: place.geometry.location.lat(), Lng: place.geometry.location.lng() };
        this.PlaceMarker(latLng, $("#add").val(), place.formatted_address);
    }

    SendData() {
        $.ajax({
            type: 'POST',
            url: 'api/vrp',
            data: JSON.stringify({
                Warehouses: Object.values(this.warehouses).map(warehouse => (
                    {
                        Name: warehouse.Name,
                        PlaceInfo: warehouse.Place,
                        CapacityForCouriers: warehouse.CapacityForCouriers,
                        LatLng:
                        {
                            Lat: warehouse.LatLng.Lat,
                            Lng: warehouse.LatLng.Lng
                        }
                    })),
                Couriers: Object.values(this.couriers).map(courier => (
                    {
                        Name: courier.Name,
                        LatLng:
                        {
                            Lat: courier.LatLng.Lat,
                            Lng: courier.LatLng.Lng
                        }
                    })),
                Packages: Object.values(this.packages).map(pack => (
                    {
                        Name: pack.Name,
                        PlaceInfo: pack.Place,
                        LatLng:
                        {
                            Lat: pack.LatLng.Lat,
                            Lng: pack.LatLng.Lng
                        }
                    }))
            }),
            contentType: 'application/json',
            success: function (result) {
                alert("udalo sie");
            },
            error: function (error) {
                alert("buu");
            }
        });
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
                    if (warehouse.Id > vpr.WarehousesMaxid) {
                        vpr.WarehousesMaxid = warehouse.Id;
                    }
                    var newWarehouse = new Warehouse(vpr, warehouse.Id, warehouse.LatLng, false);
                    vpr.warehouses[warehouse.Id] = newWarehouse;
                    newWarehouse.Name = warehouse.Name;
                    newWarehouse.Place = warehouse.PlaceInfo;
                    newWarehouse.CapacityForCouriers = warehouse.CapacityForCouriers;
                    newWarehouse.BindMarker();
                });
                vpr.GetCouriers();
            },
            error: function (error) {
                var err = eval("(" + error.responseText + ")");
                alert(err.Message);
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
                    if (courier.Id > vpr.CouriersMaxid) {
                        vpr.CouriersMaxid = courier.Id;
                    }
                    vpr.couriers[courier.Id] = courier;
                    courier.Warehouse = vpr.warehouses[courier.WarehouseId];
                    courier.Warehouse.CouriersCount++;
                    courier.Marker = VrpLibrary.courierMarker(vpr, courier);
                    courier.Marker.addTo(vpr.map);
                    courier.PackagesCount = 0;
                });
                vpr.GetPackages();
            },
            error: function (error) {
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
            success: function (result) {
                result.forEach(pack => {

                    if (pack.Id > vpr.PackagesMaxid) {
                        vpr.PackagesMaxid = pack.Id;
                    }
                    var newPackage = new Package(vpr, pack.Id, pack.LatLng, false);
                    vpr.packages[pack.Id] = newPackage;
                    newPackage.Warehouse = vpr.warehouses[pack.WarehouseId];
                    newPackage.Courier = vpr.couriers[pack.CourierId];
                    newPackage.Name = pack.Name;
                    newPackage.Place = pack.PlaceInfo;
                    newPackage.BindMarker();
                });
                vpr.UpdateAfterReceivingData();
            },
            error: function (error) {
                var err = eval("(" + error.responseText + ")");
                alert(err.Message);
            }
        });
    }

    UpdateAfterReceivingData() {
        Object.values(this.warehouses).forEach(warehouse => {
            var container = $("#warehouse" + warehouse.Id);
            container.find("#warehouse-couriers-number").html(warehouse.CouriersCount);
            container.find("#warehouse-packages-number").html(warehouse.PackagesCount);
        });
        Object.values(this.couriers).forEach(courier => {
            var container = $("#courier" + courier.Id);
            container.find("#courier-packages-number").html(courier.PackagesCount);
        });
    }

    CalculateRoutes() {
        this.ClearRoutes();
        var vrp = this;
        var packages = Object.values(this.packages);
        var warehouses = Object.values(this.warehouses);

        var packagesLength = packages.length;
        var couriersCount = 0;
        warehouses.forEach(warehouse => couriersCount += warehouse.CapacityForCouriers);

        var distances = new Array(packagesLength + couriersCount);

        for (var i = 0; i < packagesLength + couriersCount; i++) {
            distances[i] = new Array(packagesLength);
        }

        var i = 0, j;
        packages.forEach(pack1 => {
            j = 0;
            packages.forEach(pack2 => {
                distances[i][j] = distances[j][i] = vrp.GetDistanceBetweenPoints(
                    { latLng: L.latLng([pack1.LatLng.Lat, pack1.LatLng.Lng]) },
                    { latLng: L.latLng([pack2.LatLng.Lat, pack2.LatLng.Lng]) });
                j++;
            });
            i++;
        });

        i = 0;
        warehouses.forEach(warehouse => {
            for (var k = 0; k < warehouse.CapacityForCouriers; k++) {
                j = 0;
                packages.forEach(pack => {
                    distances[packagesLength + i][j] = vrp.GetDistanceBetweenPoints(
                        { latLng: L.latLng([warehouse.LatLng.Lat, warehouse.LatLng.Lng]) },
                        { latLng: L.latLng([pack.LatLng.Lat, pack.LatLng.Lng]) });
                    j++;
                });
                i++;
            }
        });

        Promise.all(distances.map(Promise.all.bind(Promise))).then(result => {
            var routingArguments = {};
            routingArguments.Fields = result;
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
                    vrpHelper.ApplyRoutes(result);
                },
                error: function (error) {
                    alert("buu");
                }
            });

        }).catch(error => {
            alert(error);
        });
    }

    GetDistanceBetweenPoints(latLng1, latLng2) {
        var coordinates = [];
        coordinates.push(latLng1);
        coordinates.push(latLng2);
        var router = this.Controller.getRouter();
        var promise = new Promise((resolve, reject) => {
            router.route(coordinates,
                (err, routes) => {
                    if (routes !== undefined) {
                        resolve(routes[0].summary.totalDistance / 1000);
                    } else
                        reject(0);
                });
        });
        return promise;
    }

    GetDistance(controller, coordinates) {
        var coords = [];
        coordinates.forEach(coord => coords.push({ latLng: { lat: coord.lat, lng: coord.lng } }));
        var router = controller.getRouter();
        var promise = new Promise(async (resolve, reject) => {
            await router.route(coords,
                (err, routes) => {
                    if (routes !== undefined) {
                        this.Routes.push(routes[0]);
                        resolve(routes[0].summary.totalDistance / 1000);
                    } else
                        reject(0);
                });
        });
        return promise;
    }

    async ApplyRoutes(result) {
        var warehouseNumber = 0, courierNumber = 0;
        for (var i = 0; i < result.length; i++) {

            var controller = L.Routing.control({
                router: L.Routing.graphHopper(undefined,
                    {
                        serviceUrl: this.GHServer
                    }),
                createMarker: function () { return null; }

            }).addTo(this.map);

            this.Controllers.push(controller);
            
            var coordinates = [];
            var packages = Object.values(this.packages);
            var warehouses = Object.values(this.warehouses);

            while (courierNumber === warehouses[warehouseNumber].CapacityForCouriers) {
                warehouseNumber++;
                courierNumber = 0;
            }
            var warehouse = warehouses[warehouseNumber];
            courierNumber++;
            coordinates.push(L.latLng([warehouse.LatLng.Lat, warehouse.LatLng.Lng]));

            var points = result[i];
            var route = $('<span/>');
            route.append($('<a/>').html(warehouse.Name)
                .addClass("route-element")
                .on('click', warehouse.Center.bind(warehouse)));
            for (var j = 0; j < points.length; j++) {
                var packageC = packages[points[j]];
                coordinates.push(L.latLng([packageC.LatLng.Lat, packageC.LatLng.Lng]));

                // Setting route in package list element
                var routePoint = $('<a/>').html(packageC.Name)
                    .addClass("route-element")
                    .on('click', packageC.Center.bind(packageC));
                route.append(" -> ");
                route.append(routePoint);
                packageC.UpdateRoute(route);
            }

            // Back to home
            // coordinates.push(L.latLng([courier.LatLng.Lat, courier.LatLng.Lng]));

            controller.setWaypoints(coordinates);

            await this.GetDistance(controller, coordinates).then(() => {
               // this.addRemovingButton();
            });
        };

        $("#startSimulation").removeAttr("disabled");
        $("#showButton").removeAttr("disabled");
        this.ShowRoutes();
        this.Simulator = new VrpSimulator(this, this.Routes);
    }

    ClearRoutes() {
        this.HideRoutes();
        this.Routes = [];
        this.Controllers = [];
    }

    ClearElements() {

        this.CouriersMaxid = 0;
        this.PackagesMaxid = 0;
        this.WarehousesMaxid = 0;

        Object.values(this.warehouses).forEach(element => {
            this.RemoveWarehouse(element);
        });

        Object.values(this.packages).forEach(element => {
            this.RemovePackage(element);
        });
    }

    addRemovingButton() {
        var button = document.createElement("button");
        button.innerHTML = "Add/remove route " + (this.routingControllersCount + 1);
        button.addEventListener('click', this.addRemoveController.bind(this, this.routingControllersCount));
        this.routingControllersCount++;
        $("#settings").append(button);
    }
    

    ShowRoute(controller) {
        controller.addTo(this.map);
    }

    HideRoute(controller) {
        this.map.removeControl(controller);
    }

    ShowRoutes() {
        $("#showButton").html("Hide routes");
        $("#showButton").off('click');
        $("#showButton").on('click', this.HideRoutes.bind(this));
        this.Controllers.forEach(controller => {
            this.HideRoute(controller);
            this.ShowRoute(controller);
            controller.hide();
        });
    }

    HideRoutes() {
        $("#showButton").html("Show routes");
        $("#showButton").off('click');
        $("#showButton").on('click',this.ShowRoutes.bind(this));
        this.Controllers.forEach(controller => {
            this.HideRoute(controller);
            controller.hide();
        });
    }

    StartSimulation() {
        if (this.Simulator !== undefined) this.Simulator.Run();

    }
}