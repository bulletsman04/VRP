$().ready(function() {
    var vrp = new VrpHelper('map',
         'http://89.70.244.118:27017/styles/osm-bright/style.json',
        'http://89.70.244.118:27018/route',
        [52.237049, 21.017532],
        13);
    $('#applyButton').on('click', event => vrp.SendData());
    $('#clearButton').on('click', event => vrp.ClearElements());
    $('#calculateButton').on('click', event => vrp.CalculateRoutes());
    $('#startSimulation').on('click', event => vrp.StartSimulation());
    vrp.GetWarehouses();
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
        this.PlaceMarker({ Lat: event.latlng.lat, Lng: event.latlng.lng }, $("input[name='pointType']:checked").val());
    }

    PlaceMarker(latLng, type) {
        var id;
        switch (type) {
        case "warehouse":
            id = this.WarehousesMaxid + 1;
            var warehouse = new Warehouse(this, id, latLng, true);
            this.warehouses[id] = warehouse;
            warehouse.BindMarker();
            this.CurrentMarker = warehouse.Marker;
            warehouse.Marker.openPopup();
            break;
        case "package":
            id = this.WarehousesMaxid + 1;
            var pack = new Package(this, id, latLng, true);
            this.packages[id] = pack;
            pack.BindMarker();
            this.CurrentMarker = pack.Marker;
            pack.Marker.openPopup();
            break;
        default:
            return;
        }
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
            success: function(result) {
                alert("udalo sie");
            },
            error: function(error) {
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
            success: function(result) {
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
            error: function(error) {
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
            success: function(result) {
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
            error: function(error) {
                var err = eval("(" + error.responseText + ")");
                alert(err.Message);            }
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
        var vrp = this;
        this.Routes = [];
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
                    vrpHelper.ShowRoutes(result);
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

    async ShowRoutes(result) {
        var warehouseNumber = 0, courierNumber = 0;
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

            for (var j = 0; j < points.length; j++) {

                var packageC = packages[points[j]];

                coordinates.push(L.latLng([packageC.LatLng.Lat, packageC.LatLng.Lng]));
            }

            // Back to home
            // coordinates.push(L.latLng([courier.LatLng.Lat, courier.LatLng.Lng]));

            controller.setWaypoints(coordinates);

            await this.GetDistance(controller, coordinates).then(() => {
                this.addRemovingButton();
            });
        };
        this.Simulator = new VrpSimulator(this, this.Routes);
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

    StartSimulation() {
        if (this.Simulator !== undefined) this.Simulator.Run();
    }
}

class MapElement {
    constructor(manager, id, latLng, isTemporary) {
        this.Manager = manager;
        this.Id = id;
        this.LatLng = latLng;
        this.IsTemporary = isTemporary;
    }

    get GetIcon() { }
    UpdateContainer() { }
    UpdateForm() { }

    static get PopupStyles() {
        return { minWidth: 300, autoPanPaddingBottomRight: (0, 0) };
    }

    get PopupContent() {
        if (this.Marker === undefined) return undefined;
        return $(this.Marker.getPopup().getContent());
    }

    BindMarker() {
        this.Marker = L.marker({ lat: this.LatLng.Lat, lng: this.LatLng.Lng }, {
            icon: this.GetIcon, draggable: true
        });
        this.Marker.addTo(this.Manager.map);
        this.Marker.on('drag',
            event => {
                this.LatLng.Lat = event.target.getLatLng().lat;
                this.LatLng.Lng = event.target.getLatLng().lng;
                this.UpdateContainer();
            });

        if (!this.IsTemporary) this.BindContainer();
        this.BindForm();
        if (!this.IsTemporary) this.UpdateForm();

        this.Marker.on('popupclose',
            event => {
                if (this.IsTemporary) {
                    this.Manager.map.removeLayer(this.Marker);
                }
                this.Manager.CurrentMarker = null;
            });
    }
    
    Center() {
        this.Manager.map.setView(new L.LatLng(this.LatLng.Lat, this.LatLng.Lng), 14);
    }
}

class Warehouse extends MapElement {
    constructor(manager, id, latLng, isTemporary) {
        super(manager, id, latLng, isTemporary);
    }

    get GetIcon() {
        return L.icon({
            iconUrl: 'icons/warehouse.ico',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });
    }

    BindForm() {
        var clone = $("#warehouse-form-template").clone();
        var content = clone.prop('content');
        var form = $(content.firstElementChild);
        form.find('.name').attr('value', this.Name);
        form.find('.capacity-couriers').attr('value', this.CapacityForCouriers);
        if (this.Place === undefined) form.find('.place').attr('value', $('#searchbox').val());
        else form.find('.place').attr('value', this.Place);

        var div = L.DomUtil.create('div', 'form');
        div.innerHTML = form.html();
        $('.form-control.btn', div).on('click', clickEvent => this.UpdateForm());
        this.Marker.bindPopup(div, MapElement.PopupStyles);
    }

    UpdateForm() {
        if (this.IsTemporary) {
            this.IsTemporary = false;
            this.BindContainer();
            this.Manager.WarehousesMaxid++;
        }

        this.Name = this.PopupContent.find('.name').val();
        this.Place = this.PopupContent.find('.place').val();
        this.CapacityForCouriers = parseInt(this.PopupContent.find('.capacity-couriers').val());
        this.UpdateContainer();

        this.Marker.update();
        this.Marker.closePopup();
    }

    BindContainer() {
        var clone = $('#warehouse-template').clone();
        var content = clone.prop('content');
        this.Container = $(content).find('.map-element');
        this.Container.find('.center-btn').on('click', event => this.Center());
        this.Container.find('.remove-btn').on('click', event => this.Remove());
        this.UpdateContainer();
        $("#warehouses").append(this.Container);
    }

    UpdateContainer() {
        this.Container.find('.name').html(this.Name);
        this.Container.find('.coord-x').html(this.LatLng.Lng.toString().substring(0, 6));
        this.Container.find('.coord-y').html(this.LatLng.Lat.toString().substring(0, 6));
        this.Container.find('.place-name').html(this.Place);
        this.Container.find('.capacity-couriers').html(this.CapacityForCouriers);
    }

    Remove() {
        this.Manager.map.removeLayer(this.Marker);
        this.Container.remove();
        delete this.Manager.warehouses[this.Id];
    }
}

class Package extends MapElement {
    constructor(manager, id, latLng, isTemporary) {
        super(manager, id, latLng, isTemporary);
    }

    get GetIcon() {
        return L.icon({
            iconUrl: 'icons/package.ico',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
        });
    }

    BindForm() {
        var clone = $("#package-form-template").clone();
        var content = clone.prop('content');
        var form = $(content.firstElementChild);
        form.find('.name').attr('value', this.Name);
        if (this.Place === undefined) form.find('.place').attr('value', $('#searchbox').val());
        else form.find('.place').attr('value', this.Place);

        var div = L.DomUtil.create('div', 'form');
        div.innerHTML = form.html();
        $('.form-control.btn', div).on('click', clickEvent => this.UpdateForm());
        this.Marker.bindPopup(div, MapElement.PopupStyles);
    }

    UpdateForm() {
        if (this.IsTemporary) {
            this.IsTemporary = false;
            this.BindContainer();
            this.Manager.PackagesMaxid++;
        }

        this.Name = this.PopupContent.find('.name').val();
        this.Place = this.PopupContent.find('.place').val();
        this.UpdateContainer();

        this.Marker.update();
        this.Marker.closePopup();
    }

    BindContainer() {
        var clone = $('#package-template').clone();
        var content = clone.prop('content');
        this.Container = $(content).find('.map-element');
        this.Container.find('.center-btn').on('click', event => this.Center());
        this.Container.find('.remove-btn').on('click', event => this.Remove());
        this.UpdateContainer();
        $("#packages").append(this.Container);
    }

    UpdateContainer() {
        this.Container.find('.name').html(this.Name);
        this.Container.find('.coord-x').html(this.LatLng.Lng.toString().substring(0, 6));
        this.Container.find('.coord-y').html(this.LatLng.Lat.toString().substring(0, 6));
        this.Container.find('.place-name').html(this.Place);
        if (this.Courier !== undefined) container.find('.assigned-courier').html(this.Courier.Name);
        if (this.Warehouse !== undefined) container.find('.assigned-warehouse').html(this.Warehouse.Name);
    }

    Remove() {
        this.Manager.map.removeLayer(this.Marker);
        this.Container.remove();
        delete this.Manager.warehouses[this.Id];
    }
}

class Courier extends MapElement{
    constructor(manager, id, route, isTemporary) {
        super(manager, id, route.coordinates[0], isTemporary);
        this.Route = route;
        this.CurrentPoint = 0;
    }
    
    get GetIcon() {
        return L.icon({
            iconUrl: 'icons/courier.ico',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });
    }

    BindMarker() {
        this.Marker = L.marker({ lat: this.LatLng.Lat, lng: this.LatLng.Lng }, {
            icon: this.GetIcon
        });
        this.Marker.addTo(this.Manager.map);
        this.BindContainer();
    }

    BindContainer() {
        var clone = $('#courier-template').clone();
        var content = clone.prop('content');
        this.Container = $(content).find('.map-element');
        this.Container.find('.center-btn').on('click', event => this.Center());
        this.UpdateContainer();
        $("#couriers").append(this.Container);
    }

    UpdateContainer() {
        this.Container.find('.name').html(this.Name);
        this.Container.find('.coord-x').html(this.LatLng.Lng.toString().substring(0, 6));
        this.Container.find('.coord-y').html(this.LatLng.Lat.toString().substring(0, 6));
        this.Container.find('.place-name').html(this.Place);
        if (this.Warehouse !== undefined) container.find('.courier-warehouse').html(this.Warehouse.Name);
    }

    Remove() {
        this.Manager.map.removeLayer(this.Marker);
        this.Container.remove();
        delete this.Manager.couriers[this.Id];
    }

    Move(distance) {
        if (this.Route.coordinates.length === this.CurrentPoint) return;
        if (Math.abs(this.LatLng.Lat - this.Route.coordinates[this.CurrentPoint].Lat) < distance &&
            Math.abs(this.LatLng.Lng - this.Route.coordinates[this.CurrentPoint].Lng) < distance) {
            this.CurrentPoint++;
            if (this.Route.coordinates.length === this.CurrentPoint) return;
            var a =
                (this.Route.coordinates[this.CurrentPoint - 1].Lng - this.Route.coordinates[this.CurrentPoint].Lng) /
                (this.Route.coordinates[this.CurrentPoint - 1].Lat - this.Route.coordinates[this.CurrentPoint].Lat);
            this.Factor = 1 / Math.sqrt(a * a + 1);
        }
        var dx = distance * this.Factor;
        var dy = Math.sqrt(distance * distance - dx * dx);
        if (this.LatLng.Lat > this.Route.coordinates[this.CurrentPoint].Lat)
            dx = -dx;
        if (this.LatLng.Lng > this.Route.coordinates[this.CurrentPoint].Lng)
            dy = -dy;
        this.LatLng.Lat += dx;
        this.LatLng.Lng += dy;
        this.Marker.setLatLng(new L.LatLng(this.LatLng.Lat, this.LatLng.Lng));
        this.UpdateContainer();
    }
}

class VrpSimulator {
    constructor(manager, routes) {
        this.Routes = routes;
        this.Couriers = [];

        var courierId = 0;
        routes.forEach(route => {
            route.coordinates = route.coordinates.map(coord => ({
                Lat: coord.lat,
                Lng: coord.lng
            }));
            this.Couriers.push(new Courier(manager, courierId++, route, false));
        });
        this.ChangeSpeed();
    }

    UpdateFrame() {
        this.Couriers.forEach(courier => courier.Move(0.0001));
    }

    Run() {
        this.Couriers.forEach(courier => courier.BindMarker());
        this.Play();
    }

    Play() {
        this.Loop = setInterval(() => this.UpdateFrame(), 1000/this.FramesPerSecond);
    }

    Pause() {
        clearInterval(this.Loop);
    }

    Stop() {
        clearInterval(this.Loop);
        this.Couriers.forEach(courier => courier.Remove());
    }

    ChangeSpeed(factor) {
        if (factor === undefined) this.FramesPerSecond = 60;
        else this.FramesPerSecond *= factor;
    }
}