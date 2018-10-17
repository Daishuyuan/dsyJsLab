(function () {
    // Init brand
    $("#version").html(Initer.getChromeVersion() < 60 ||
        Initer.getBrowserType() !== "Chrome" ? "Maybe Not Support" : "Support");
    $("#today").html(Initer.getToday());
    $("#name").html(Initer.getName(68, 97, 118, 105, 100));
    window.initDrawing = function () {
        $("#viewPanel").show(500);
    }

    // init perfect world
    var canvas = document.getElementById('perfectPanel');
    var mouseAnchor = new Particle(ParticlesTypes.Static, {
        m: 1,
        pos: new Vector2(0, 0),
        width: 1,
        height: 1
    });
    canvas.onmousemove = function (evt) {
        mouseAnchor.setPosition(new Vector2(evt.offsetX, evt.offsetY));
    };
    var world = new PhysicalWorld(canvas);
    world.applyForce(new Force(ForceTypes.Gravity, {
        g: 7.6,
        dir: new Vector2(0, 1)
    }));
    world.applyForce(new Force(ForceTypes.Friction, {
        f: 0.5
    }));
    world.applyForce(new Force(ForceTypes.AirResistance, {
        C: 0.01
    }));
    world.applyForce(new Force(ForceTypes.Elastic, {
        k: 0.2,
        slack: 100,
        anchor: mouseAnchor
    }));

    // the creater of particles
    function BoxesGo(world, x, y, count) {
        var triggerId = null;

        function innerCreater(x, y) {
            if (world.getParticles().length <= count) {
                world.addParticle(new Particle(ParticlesTypes.Meteor, {
                    m: Math.random() * 5 + 5,
                    pos: new Vector2(x, y),
                    v: new Vector2(0, 1).rotate(Math.random() * 135 + 100).mult(15),
                    width: 4,
                    height: 4,
                    life: 50,
                    shape: {
                        type: "circle",
                        color: Initer.getRandomColor()
                    }
                }));
            }
        }

        return {
            run: function (tick) {
                triggerId = setInterval(function () {
                    innerCreater(x, y);
                }, tick);
            },
            close: function() {
                clearInterval(triggerId);
            }
        };
    }

    function running() {
        world.runFrame();
        setTimeout(running, 100);
    }

    var partBoxes_1 = BoxesGo(world, 700, 0, 800),
        partBoxes_2 = BoxesGo(world, 0, 500, 800)
        partBoxes_3 = BoxesGo(world, 0, 0, 800),
        partBoxes_4 = BoxesGo(world, 700, 500, 800);
    partBoxes_1.run(20);
    partBoxes_2.run(30);
    partBoxes_3.run(50);
    partBoxes_4.run(70);
    running();
})();