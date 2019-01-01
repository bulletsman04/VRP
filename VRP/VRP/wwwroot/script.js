$().ready(function() {
    var vrp = new VrpHelper('map',
         'http://89.70.244.118:27017/styles/osm-bright/style.json',
        'http://89.70.244.118:27018/route',
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

        this.packages = {};
        this.couriers = {};
        this.warehouses = {};

        this.map.on('click', event => this.OnMapClick(event));
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
        element.LatLng = { Lat: latLng.lat, Lng: latLng.lng };
        switch (type) {
        case "warehouse":
            marker = VrpLibrary.warehouseMarker(this, element);
            element.Id = Object.values(this.warehouses).length;
            this.AddElementsForm(marker, element, this.warehouses, type);
            element.Marker.bindPopup(VrpLibrary.warehouseEditForm(element), VrpLibrary.popupStyles).addTo(this.map);
            break;
        case "package":
            marker = VrpLibrary.packageMarker(this, element);
            element.Id = Object.values(this.packages).length;
            this.AddElementsForm(marker, element, this.packages, type);
            element.Marker.bindPopup(VrpLibrary.packageEditForm(element), VrpLibrary.popupStyles).addTo(this.map);
            break;
        default:
            return;
        }
    }

    async AddElementsForm(marker, element,elements, type) {
        await marker.bindPopup(VrpLibrary.insertForm, VrpLibrary.popupStyles);
        marker.addTo(this.map).openPopup();
        marker.on('popupclose',
            event => {
                marker.unbindPopup();
                this.map.removeLayer(marker);
            });
        this.CurrentMarker = marker;
        $(".leaflet-popup-content").find("#added-X").val(element.LatLng.Lat);
        $(".leaflet-popup-content").find("#added-Y").val(element.LatLng.Lng);
        $(".leaflet-popup-content").find("#elements-insert-form-btn")
            .on('click', event => this.AddElement(element, elements, marker));

        if (type === "package") {
            $(".leaflet-popup-content").find("#inserted-couriers-form-group").remove();
        }
    }

    AddElement(element, elements, marker) {
        this.CurrentMarker = null;
        elements[element.Id] = element;
        element.Name = $(".leaflet-popup-content").find("#inserted-name").val();
        element.Marker = marker;
        marker.on('popupclose', event => {});
        element.Marker.closePopup();
        element.Marker.unbindPopup();
        this.AddPackageToList(element);
    }
    
    SendData() {
        $.ajax({
            type: 'POST',
            url: 'api/vrp',
            data: JSON.stringify({
                Warehouses: Object.values(this.warehouses).map(warehouse => (
                    {
                        Id: warehouse.Id,
                        Name: warehouse.Name,
                        LatLng:
                        {
                            Lat: warehouse.LatLng.Lat,
                            Lng: warehouse.LatLng.Lng
                        }
                    })),//.map(warehouse => ({Lat: warehouse.LatLng.Lat, Lng: warehouse.LatLng.Lng})),
                Couriers: Object.values(this.couriers).map(courier => (
                    {
                        Id: courier.Id,
                        Name: courier.Name,
                        LatLng:
                        {
                            Lat: courier.LatLng.Lat,
                            Lng: courier.LatLng.Lng
                        }
                    })),//.map(courier => ({ Lat: courier.LatLng.Lat, Lng: courier.LatLng.Lng })),
                Packages: Object.values(this.packages).map(pack => (
                    {
                        Id: pack.Id,
                        Name: pack.Name,
                        LatLng:
                        {
                            Lat: pack.LatLng.Lat,
                            Lng: pack.LatLng.Lng
                        }
                    }))//.map(pack => ({ Lat: pack.LatLng.Lat, Lng: pack.LatLng.Lng }))
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
                    vpr.warehouses[warehouse.Id] = warehouse;
                    warehouse.Marker = VrpLibrary.warehouseMarker(vpr, warehouse);
                    warehouse.Marker.bindPopup(VrpLibrary.warehouseEditForm(warehouse), VrpLibrary.popupStyles).addTo(vpr.map);
                });
            },
            error: function(error) {
                var err = eval("(" + error.responseText + ")");
                alert(err.Message);            }
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
                    vpr.couriers[courier.Id] = courier;
                    courier.Marker = VrpLibrary.courierMarker(vpr, courier);
                    courier.Marker.addTo(vpr.map);
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
                    vpr.packages[pack.Id] = pack;
                    pack.Marker = VrpLibrary.packageMarker(vpr, pack);
                    pack.Marker.bindPopup(VrpLibrary.packageEditForm(pack), VrpLibrary.popupStyles).addTo(vpr.map);
                    vpr.AddPackageToList(pack);
                });
            },
            error: function(error) {
                var err = eval("(" + error.responseText + ")");
                alert(err.Message);            }
        });
    }

    AddPackageToList(item) {
        var pack = VrpLibrary.packageElement;
        pack.attr("id", "package" + item.Id);
        pack.find("#edit").on('click', event => this.EditItem(item));
        pack.find("#edit").attr("id", "edit" + item.Id);
        pack.find("#remove").on('click', event => this.RemovePackage(item));
        pack.find("#remove").attr("id", "remove" + item.Id);
        VrpLibrary.SetPackageToContainer(pack, item);
        $("#packages").append(pack);
    }

    EditPackageOnList(item) {
        var pack = $("#package" + item.Id);
        VrpLibrary.SetPackageToContainer(pack, item);
    }

    EditItem(item) {
        this.map.setView(new L.LatLng(item.LatLng.Lat, item.LatLng.Lng), 13);
    }

    RemovePackage(pack) {
        this.map.removeLayer(pack.Marker);
        $("#package" + pack.Id).remove();
        delete this.packages[pack.Id];
    }

    CalculateRoutes() {
        var vrp = this;
        var packages = Object.values(this.packages);
        var warehouses = Object.values(this.warehouses);

        var packagesLength = packages.length;
        var warehousesLength = warehouses.length;


        var distances = new Array(packagesLength + warehousesLength);

        for (var i = 0; i < packagesLength + warehousesLength; i++) {
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
            j = 0;
            packages.forEach(pack => {
                distances[packagesLength + i][j] = vrp.GetDistanceBetweenPoints(
                    { latLng: L.latLng([warehouse.LatLng.Lat, warehouse.LatLng.Lng]) },
                    { latLng: L.latLng([pack.LatLng.Lat, pack.LatLng.Lng]) });
                j++;
            });
            i++;
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
            var packages = Object.values(this.packages);
            var warehouses = Object.values(this.warehouses);

            var warehouse = warehouses[i];
            coordinates.push(L.latLng([warehouse.LatLng.Lat, warehouse.LatLng.Lng]));

            var points = result[i];

            for (var j = 0; j < points.length; j++) {

                var packageC = packages[points[j]];

                coordinates.push(L.latLng([packageC.LatLng.Lat, packageC.LatLng.Lng]));
            }

            // Back to home
            // coordinates.push(L.latLng([courier.LatLng.Lat, courier.LatLng.Lng]));

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
}

class VrpLibrary {
    static reflect(promise) {
        return promise.then(
            function(v) {
                 return { v: v, status: "resolved" }
            },
            function(e) {
                 return { e: e, status: "rejected" }
            });
    }

    static warehouseMarker(manager, warehouse) {
        var marker = L.marker({ lat: warehouse.LatLng.Lat, lng: warehouse.LatLng.Lng }, {
            icon: L.icon({
                iconUrl: 'icons/warehouse.ico',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, -20]
            }), draggable: true });
        marker.on('drag',
            event => {
                warehouse.LatLng.Lat = event.target.getLatLng().lat;
                warehouse.LatLng.Lng = event.target.getLatLng().lng;
            });
        return marker;
    }

    static courierMarker(manager, courier) {
        var marker = L.marker({ lat: courier.LatLng.Lat, lng: courier.LatLng.Lng }, {
            icon: L.icon({
                iconUrl: 'icons/courier.ico',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, -20]
            }), draggable: true
        });
        marker.on('drag',
            event => {
                courier.LatLng.Lat = event.target.getLatLng().lat;
                courier.LatLng.Lng = event.target.getLatLng().lng;
            });
        return marker;
    }

    static packageMarker(manager, pack) {
        var marker = L.marker({ lat: pack.LatLng.Lat, lng: pack.LatLng.Lng }, {
            icon: L.icon({
                iconUrl: 'icons/package.ico',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
                popupAnchor: [0, -10]
            }), draggable: true
        });
        marker.on('drag',
            event => {
                pack.LatLng.Lat = event.target.getLatLng().lat;
                pack.LatLng.Lng = event.target.getLatLng().lng;
                VrpLibrary.SetPackageToContainer($("#package" + pack.Id), pack);
            });
        return marker;
    }

    static get insertForm() {
        var clone = $("#insert-form-template").clone();
        var content = clone.prop('content');
        return $(content.firstElementChild).html();
    }
    static warehouseEditForm(warehouse) {
        var clone = $("#warehouse-edit-form-template").clone();
        var content = clone.prop('content');
        var form = $(content.firstElementChild);
        form.attr('id', 'warehouse-edit-form' + warehouse.Id);
        form.find('#edited-warehouse-name').attr('id', 'edited-warehouse-name' + warehouse.Id);
        form.find('#edited-warehouse-name' + warehouse.Id).attr('value', warehouse.Name);
        form.find('#edited-couriers').attr('id', 'edited-couriers' + warehouse.Id);
        form.find('#edited-couriers' + warehouse.Id).attr('value', 1);
        form.find('#warehouse-edit-form-btn').attr('id', 'warehouse-edit-form-btn' + warehouse.Id);
        $('body').on('click', '#warehouse-edit-form-btn' + warehouse.Id,
            event => {
                warehouse.Name = $('#edited-warehouse-name' + warehouse.Id).val();

                var popupContent = $(warehouse.Marker.getPopup()._contentNode);
                popupContent.find('#edited-warehouse-name' + warehouse.Id).attr('value', warehouse.Name);

                warehouse.Marker.getPopup().setContent(popupContent.html());
                warehouse.Marker.update();
                warehouse.Marker.closePopup();
            });
        return form.html();
    }
    static packageEditForm(pack) {
        var clone = $("#package-edit-form-template").clone();
        var content = clone.prop('content');
        var form = $(content.firstElementChild);
        form.attr('id', 'package-edit-form' + pack.Id);
        form.find('#edited-package-name').attr('id', 'edited-package-name' + pack.Id);
        form.find('#edited-package-name' + pack.Id).attr('value', pack.Name);
        form.find('#package-edit-form-btn').attr('id', 'package-edit-form-btn' + pack.Id);
        $('body').on('click', '#package-edit-form-btn' + pack.Id,
            event => {
                pack.Name = $('#edited-package-name' + pack.Id).val();
                VrpLibrary.SetPackageToContainer($('#package' + pack.Id), pack);

                var popupContent = $(pack.Marker.getPopup()._contentNode);
                popupContent.find('#edited-package-name' + pack.Id).attr('value', pack.Name);

                pack.Marker.getPopup().setContent(popupContent.html());
                pack.Marker.update();
                pack.Marker.closePopup();
            });
        return form.html();
    }
    static get packageElement() {
        var clone = $("#package-template").clone();
        var content = clone.prop('content');
        return $(content).find("#package");
    }
    static SetPackageToContainer(container, pack) {
        container.find("#package-name").html(pack.Name);
        container.find("#package-x").html(pack.LatLng.Lng.toString().substring(0, 6));
        container.find("#package-y").html(pack.LatLng.Lat.toString().substring(0, 6));
    }

    static get popupStyles() {
        return { minWidth: 300, autoPanPaddingBottomRight: (0, 0) };
    }
}