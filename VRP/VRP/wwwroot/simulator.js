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
        this.EnableButtons();
        this.Play();
        $("#startSimulation").attr("disabled", "disabled");
    }

    Play() {
        this.Loop = setInterval(() => this.UpdateFrame(), 1000 / this.FramesPerSecond);

        $("#pauseResumeButton").attr('src', "simulation-icons/play_partly_active.svg");
        $("#pauseResumeButton").off('click');
        $("#pauseResumeButton").on('click', this.Pause.bind(this));
    }

    Pause() {
        clearInterval(this.Loop);
        $("#pauseResumeButton").attr('src', "simulation-icons/pause_partly_active.svg");
        $("#pauseResumeButton").off('click');
        $("#pauseResumeButton").on('click', this.Play.bind(this));
    }

    Stop() {
        clearInterval(this.Loop);
        this.Couriers.forEach(courier => courier.Remove());
        this.DisableButtons();
        $("#startSimulation").removeAttr("disabled");
    }

    ChangeSpeed(factor) {
        if (factor === undefined) this.FramesPerSecond = 60;
        else {
            this.FramesPerSecond *= factor;
            clearInterval(this.Loop);
            this.Loop = setInterval(() => this.UpdateFrame(), 1000 / this.FramesPerSecond);
        }
    }

    AssignActionsToButtons() {
        $("#pauseResumeButton").on('click', this.Pause.bind(this));
        $("#stopButton").on('click', this.Stop.bind(this));
        $("#speedUpButton").on('click', this.ChangeSpeed.bind(this, 1/2));
        $("#slowDownButton").on('click', this.ChangeSpeed.bind(this, 2));

    }

    RemoveActionsFromButtons() {
        $("#pauseResumeButton").off('click');
        $("#stopButton").off('click');
        $("#speedUpButton").off('click');
        $("#slowDownButton").off('click');
    }

    EnableButtons() {
        $("#pauseResumeButton").attr('src', "simulation-icons/pause_partly_active.svg")
            .hover(this.SetImage.bind($("#pauseResumeButton"), "simulation-icons/pause_active.svg")
                );
        $("#stopButton").attr('src', "simulation-icons/stop_partly_active.svg");
        $("#speedUpButton").attr('src', "simulation-icons/speedup_partly_active.svg");
        $("#slowDownButton").attr('src', "simulation-icons/speeddown_partly_active.svg");
        this.AssignActionsToButtons();
    }

    DisableButtons() {
        $("#pauseResumeButton").attr('src', "simulation-icons/pause_inactive.svg");
        $("#stopButton").attr('src', "simulation-icons/stop_inactive.svg");
        $("#speedUpButton").attr('src', "simulation-icons/speedup_inactive.svg");
        $("#slowDownButton").attr('src', "simulation-icons/speeddown_inactive.svg");
        this.RemoveActionsFromButtons();
    }

    SetImage(path) {
        this.attr('src', path);
    }

}