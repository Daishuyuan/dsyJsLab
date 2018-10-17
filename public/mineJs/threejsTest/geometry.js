(function () {
    var disco = new Disco("view");

    $("#version").html(Initer.getChromeVersion() < 60 || Initer.getBrowserType() !== "Chrome" ? "Maybe Not Support" : "Support");
    $("#today").html(Initer.getToday());
    $("#name").html(Initer.getName(68, 97, 118, 105, 100));
    disco.addEvent("onkeydown", function (event) {
        $("#keyCoder").html(event.code + '(' + event.keyCode + ')');
    });
    disco.addEvent("onmousemove", function (event) {
        $("#mousePointer").html('(' + event.pageX + ',' + event.pageY + ')');
    });

    disco.customizeInitialization(function (initer) {
        var spotLight = initer.createSpotLight(15, 30, 20, 0.5);
        var box1 = initer.createCube(2, 2, 2, 5, 5, 5, 0x33ff00);
        var box2 = initer.createCube(2, 2, 9, 5, 5, 5, 0xff3300);
        var perControlFlag = false,
            shadowFlag = false,
            boxFlag = false,
            trackballFlag = false,
            helperFlag = false,
            planeFlag = false,
            mountainsFlag = false;
        objs = [box1, box2],
            plane = null;
        initer.getScene().add(spotLight);
        initer.getScene().add(box1);
        initer.getScene().add(box2);
        initer.animate();

        window.animateSwitch = function () {
            disco.customizeInitialization(function (initer) {
                perControlFlag = !perControlFlag;
                if (perControlFlag) {
                    initer.activePersonalControls({
                        movementSpeed: 10,
                        lookSpeed: 0.05
                    });
                    $("#animateSwitcher").html('Close Game');
                    $("#animateSwitcher").attr("class", "btn btn-default btn-large");
                } else {
                    initer.closePersonalControls();
                    $("#animateSwitcher").html('Open Gamea');
                    $("#animateSwitcher").attr("class", "btn btn-primary btn-large");
                }
            });
        }

        window.boxControl = function () {
            var step = 1;
            boxFlag = !boxFlag;
            if (boxFlag) {
                handle = objs[parseInt(objs.length * Math.random())];
                $("#boxControllor").html('Close BoxControl');
                $("#boxControllor").attr("class", "btn btn-default btn-large");
                disco.addEvent("onkeydown", controllor);
            } else {
                $("#boxControllor").html('Open BoxControl');
                $("#boxControllor").attr("class", "btn btn-primary btn-large");
            }

            function controllor() {
                if (boxFlag && handle) {
                    switch (event.code) {
                        case "KeyJ":
                            handle.position.x += step;
                            break;
                        case "KeyI":
                            handle.position.z += step;
                            break;
                        case "KeyL":
                            handle.position.x -= step;
                            break;
                        case "KeyK":
                            handle.position.z -= step;
                            break;
                        case "KeyU":
                            handle.position.y += step;
                            break;
                        case "KeyO":
                            handle.position.y -= step;
                            break;
                        case "KeyB":
                            handle.rotation.x -= 0.02 * Math.PI;
                            break;
                        case "KeyN":
                            handle.rotation.y -= 0.02 * Math.PI;
                            break;
                        case "KeyM":
                            handle.rotation.z -= 0.02 * Math.PI;
                            break;
                    }
                }
            }
        }

        window.orbitSwitch = function () {
            trackballFlag = !trackballFlag;
            if (trackballFlag) {
                initer.activeOrbitControls({
                    maxPolarAngle: Math.PI * 0.45,
                    enablePan: false,
                    minDistance: 50,
                    maxDistance: 200,
                });
                $("#orbitSwitcher").html('Close Orbit');
                $("#orbitSwitcher").attr("class", "btn btn-default btn-large");
            } else {
                initer.closeOrbitControls();
                $("#orbitSwitcher").html('Open Orbit');
                $("#orbitSwitcher").attr("class", "btn btn-primary btn-large");
            }
        }

        window.helperSwitch = function () {
            helperFlag = !helperFlag;
            if (helperFlag) {
                initer.showBasicSet(true, true, true);
                $("#helperSwitcher").html('Close Helper');
                $("#helperSwitcher").attr("class", "btn btn-default btn-large");
            } else {
                initer.showBasicSet(false, false, false);
                $("#helperSwitcher").html('Open Helper');
                $("#helperSwitcher").attr("class", "btn btn-primary btn-large");
            }
        }

        window.addMountains = function () {
            mountainsFlag = !mountainsFlag;
            if (mountainsFlag) {
                plane && initer.getScene().remove(plane);
                plane = initer.createMountain(100, 100, 50, 50);
                plane.receiveShadow = true;
                plane.position.y = -10;
                initer.getScene().add(plane);
                $("#mountainsSwitcher").html('Remove Mountains');
                $("#mountainsSwitcher").attr("class", "btn btn-default btn-large");
            } else {
                initer.getScene().remove(plane);
                plane = null;
                $("#mountainsSwitcher").html('Add Mountains');
                $("#mountainsSwitcher").attr("class", "btn btn-primary btn-large");
            }
        }

        window.addPlane = function () {
            planeFlag = !planeFlag;
            if (planeFlag) {
                plane && initer.getScene().remove(plane);
                plane = initer.createSimplePlane(30, 30, 30);
                plane.rotateX(-Math.PI / 2);
                plane.receiveShadow = true;
                initer.getScene().add(plane);
                $("#planeSwitcher").html('Remove Plane');
                $("#planeSwitcher").attr("class", "btn btn-default btn-large");
            } else {
                initer.getScene().remove(plane);
                plane = null;
                $("#planeSwitcher").html('Open Plane');
                $("#planeSwitcher").attr("class", "btn btn-primary btn-large");
            }
        }

        window.shadowSwitch = function () {
            shadowFlag = !shadowFlag;
            spotLight.castShadow = shadowFlag;
            for (var i = 0; i < objs.length; ++i) {
                objs[i].castShadow = shadowFlag;
                objs[i].receiveShadow = shadowFlag;
            }
            if (shadowFlag) {
                $("#shadowSwitcher").html('Close Shadow');
                $("#shadowSwitcher").attr("class", "btn btn-default btn-large");
            } else {
                $("#shadowSwitcher").html('Open Shadow');
                $("#shadowSwitcher").attr("class", "btn btn-primary btn-large");
            }
        }
    });


})();