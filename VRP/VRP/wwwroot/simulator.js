class VrpSimulator {
    constructor(manager, routes, couriers) {
        this.Manager = manager;
        this.Routes = routes;
        this.Couriers = couriers;
        this.ChangeAnimationSpeed();
        this.ChangeMoveSpeed();
        this.PauseResume = $("#pauseResumeButton");
        this.StopB = $("#stopButton");
        this.Up = $("#speedUpButton");
        this.Down = $("#speedDownButton");
    }

    UpdateFrame() {
        this.Couriers.forEach(courier => courier.Move(this.MoveDistance));
    }

    Run() {
        this.EnableButtons();
        this.Play();
        $("#startSimulation").attr("disabled", "disabled");
    }

    Play() {
        this.Loop = setInterval(() => this.UpdateFrame(), 1000 / this.FramesPerSecond);

        this.DisableButton(this.PauseResume, 'play');
        this.EnableButton(this.PauseResume, 'pause', this.Pause.bind(this));
    }

    Pause() {
        clearInterval(this.Loop);

        this.DisableButton(this.PauseResume, 'pause');
        this.EnableButton(this.PauseResume, 'play', this.Play.bind(this));
    }

    Stop() {
        clearInterval(this.Loop);
        this.Couriers.forEach(courier => courier.Reset());
        this.DisableButtons();
        $("#startSimulation").removeAttr("disabled");
        this.Manager.UnpickElements();
    }

    ChangeAnimationSpeed(factor) {
        if (factor === undefined) this.FramesPerSecond = 60;
        else {
            this.FramesPerSecond *= factor;
            clearInterval(this.Loop);
            this.Loop = setInterval(() => this.UpdateFrame(), 1000 / this.FramesPerSecond);
        }
    }

    ChangeMoveSpeed(factor) {
        if (factor === undefined) this.MoveDistance = 0.0001;
        else this.MoveDistance *= factor;
    }


    EnableButtons() {
        this.EnableButton(this.PauseResume, 'pause', this.Pause.bind(this));
        this.EnableButton(this.StopB, 'stop', this.Stop.bind(this));
        this.EnableButton(this.Up,
            'speedup',
            event => {
                this.ChangeAnimationSpeed(2);
                this.ChangeMoveSpeed(2);
            });
        this.EnableButton(this.Down,
            'speeddown',
            event => {
                this.ChangeAnimationSpeed(0.5);
                this.ChangeMoveSpeed(0.5);
            });
    }

    DisableButtons() {

        this.DisableButton(this.PauseResume, 'pause');
        this.DisableButton(this.StopB, 'stop');
        this.DisableButton(this.Up, 'speedup');
        this.DisableButton(this.Down, 'speeddown');
    }

    EnableButton(button, name, action) {
        button.attr('src', "simulation-icons/" + name + "_partly_active.svg");
        button.on('click', action);
        button.hover(event => button.attr('src', "simulation-icons/" + name + "_active.svg"),
            event => button.attr('src', "simulation-icons/" + name + "_partly_active.svg"));
    }

    DisableButton(button, name) {
        button.off('click');
        button.off("mouseenter mouseleave");
        button.attr('src', "simulation-icons/" + name + "_inactive.svg");
    }

}