class MapElement {
    constructor(manager, id, latLng, isTemporary, placeName) {
        this.Manager = manager;
        this.Id = id;
        this.LatLng = latLng;
        this.IsTemporary = isTemporary;
        this.Place = placeName;
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
    constructor(manager, id, latLng, isTemporary,placeName) {
        super(manager, id, latLng, isTemporary,placeName);
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

class Courier extends MapElement {
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