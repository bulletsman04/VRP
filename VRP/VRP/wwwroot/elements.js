class MapElement {
    constructor(manager, id, latLng, isTemporary, placeName) {
        this.Manager = manager;
        this.Id = id;
        this.LatLng = latLng;
        this.IsTemporary = isTemporary;
        this.Place = placeName;
        this.RouteButtons = [];
    }

    get GetIcon() {}

    UpdateContainer() {
    }

    UpdateForm() {
    }

    static get PopupStyles() {
        return { minWidth: 300, autoPanPaddingBottomRight: (0, 0) };
    }

    get PopupContent() {
        if (this.Marker === undefined) return undefined;
        return $(this.Marker.getPopup().getContent());
    }

    BindMarker() {
        this.Marker = L.marker({ lat: this.LatLng.Lat, lng: this.LatLng.Lng },
            {
                icon: this.GetIcon,
                draggable: true
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
                    this.Remove();
                }
                this.Manager.CurrentMarker = null;
            });
    }

    Center() {
        this.Manager.map.setView(new L.LatLng(this.LatLng.Lat, this.LatLng.Lng), 14);

        if (this.Manager.CenteredElement !== null) {
            this.Manager.CenteredElement.SetUndistinguished();
        }

        this.SetDistinguished();
    }

    SetDistinguished() {
        this.Marker.setIcon(this.GetCenteredIcon);
        this.Manager.CenteredElement = this;
    }

    SetUndistinguished() {
        this.Marker.setIcon(this.GetIcon);
        this.Manager.CenteredElement = null;
    }

    UpdateRoute(route) {
        this.Container.find('.assigned-route').html("");
        this.Container.find('.assigned-route').append(route.clone(true, true));
        this.UpdateContainer();
    }

    AddShowHideRouteButton(routeController) {
        this.Container.find('.show-hide').remove();
        var button = $('<button />').addClass("btn show-hide");
        this.ShowRoute(routeController, button);
        this.Container.append(button);
    }

    ShowRoute(routeController, button) {
        button.html("Hide");
        button.off('click');
        button.on('click', this.HideRoute.bind(this, routeController, button));
        this.Manager.map.removeControl(routeController);
        routeController.addTo(this.Manager.map);
        routeController.hide();

        this.CanDistinguish = true;
    }

    HideRoute(routeController, button) {
        button.html("Show");
        button.off('click');
        button.on('click', this.ShowRoute.bind(this, routeController, button));
        this.Manager.map.removeControl(routeController);
        routeController.hide();

        this.CanDistinguish = false;
        this.Manager.map.removeLayer(this.Line);

    }

    AddDistinguishRouteButton(line, controller) {
        this.Line = line;
        this.CanDistinguish = true;
        this.Container.find('.distinguish').remove();
        var button = $('<button />').addClass("btn distinguish").html("Distinguish");
        button.on('click', this.DistinguishRoute.bind(this, line, controller));
        this.Container.append(button);
    }

    DistinguishRoute(line, controller) {
        if (!this.CanDistinguish) {
            return;
        }

        //if (this.Manager.DistinguishedLine !== null) {
        //    this.Manager.map.removeLayer(this.Manager.DistinguishedLine);
        //    this.Manager.DistinguishedController.hide();
        //    if (this.Manager.DistinguishedLine == line) {
        //        this.Manager.DistinguishedLine = null;
        //        this.Manager.DistinguishedController = null;
        //        return;
        //    }
        //}

        //line.addTo(this.Manager.map);
        //controller.show();
        //this.Manager.DistinguishedLine = line;
        //this.Manager.DistinguishedController = controller;

        if (this.Manager.map.hasLayer(line)) {
            this.Manager.map.removeLayer(line);
            controller.hide();
        } else {
            line.addTo(this.Manager.map);
            controller.show();
        }


    }

}

class Warehouse extends MapElement {
    constructor(manager, id, latLng, isTemporary, placeName) {
        super(manager, id, latLng, isTemporary, placeName);
    }

    get GetIcon() {
        return L.icon({
            iconUrl: 'icons/warehouse.ico',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });
    }

    get GetCenteredIcon() {
        return L.icon({
            iconUrl: 'icons/warehouse.ico',
            iconSize: [70, 70],
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
        if (this.PackagesCount !== undefined && this.PackagesCount > 0)
            this.Container.find('.packages-count').html(this.PackagesCount);
    }

    Remove() {
        this.Manager.map.removeLayer(this.Marker);
        if (this.Container !== undefined) this.Container.remove();
        delete this.Manager.warehouses[this.Id];
    }
}

class Package extends MapElement {
    constructor(manager, id, latLng, isTemporary, placeName) {
        super(manager, id, latLng, isTemporary, placeName);
    }

    get GetIcon() {
        return L.icon({
            iconUrl: 'icons/package.ico',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
        });
    }

    get GetCenteredIcon() {
        return L.icon({
            iconUrl: 'icons/package.ico',
            iconSize: [70, 70],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });
    }

    get GetPickedIcon() {
        return L.icon({
            iconUrl: 'icons/package.ico',
            iconSize: [10, 10],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20],
            className: 'taken-package'
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
        if (this.Courier !== undefined) this.Container.find('.assigned-courier').html(this.Courier.Name);
        if (this.Warehouse !== undefined) this.Container.find('.assigned-warehouse').html(this.Warehouse.Name);
    }


    Remove() {
        this.Manager.map.removeLayer(this.Marker);
        this.Container.remove();
        delete this.Manager.warehouses[this.Id];
    }

    SetPicked() {
        this.Marker.setIcon(this.GetPickedIcon);
    }
}

class Courier extends MapElement {
    constructor(manager, id, route, packagesIndices, isTemporary, warehouse) {
        super(manager, id, { Lat: route.coordinates[0].Lat, Lng: route.coordinates[0].Lng }, isTemporary);
        this.Route = route;
        this.CurrentPoint = 0;
        this.CurrentPackage = 0;
        this.Warehouse = warehouse;
        this.Name = "Courier" + id;
        this.PackagesIndices = packagesIndices;
    }

    get GetIcon() {
        return L.icon({
            iconUrl: 'icons/map_courier.svg',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });
    }

    get GetCenteredIcon() {
        return L.icon({
            iconUrl: 'icons/map_courier.svg',
            iconSize: [70, 70],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });
    }

    BindMarker() {
        this.Marker = L.marker({ lat: this.LatLng.Lat, lng: this.LatLng.Lng },
            {
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
        if (this.Warehouse !== undefined) this.Container.find('.courier-warehouse').html(this.Warehouse.Name);
    }

    Remove() {
        this.Manager.map.removeLayer(this.Marker);
        this.Container.remove();
        delete this.Manager.couriers[this.Id];
    }

    Reset() {
        this.CurrentPoint = 0;
        this.LatLng = { Lat: this.Route.coordinates[0].Lat, Lng: this.Route.coordinates[0].Lng };
        this.Marker.setLatLng(new L.LatLng(this.LatLng.Lat, this.LatLng.Lng));
        this.UpdateContainer();
    }

    Move(distance) {
        if (this.Route.coordinates.length === this.CurrentPoint) return;
        if (Math.abs(this.LatLng.Lat - this.Route.coordinates[this.CurrentPoint].Lat) < distance &&
            Math.abs(this.LatLng.Lng - this.Route.coordinates[this.CurrentPoint].Lng) < distance) {
            if (this.PackagesIndices[this.CurrentPackage] < this.CurrentPoint) {
                if (this.CurrentPoint === 0) this.Warehouse.SetPicked();
                else this.Packages[this.CurrentPackage].SetPicked();
                this.CurrentPackage++;
            }
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