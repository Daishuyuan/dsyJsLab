// require three.min.js
// require dat.gui.min.js
// require OrbitControls.js
// require stats.min.js
// require FBXLoader.js

function BlockPipeline(id) {
    "use strict";
    // define inner params
    const RES_TYPE_TEXTURES = "textures";
    const RES_TYPE_FONTS = "fonts";
    var _container = null,
        _renderer = null,
        _prop = {},
        _allEvents = {},
        _scenes = {},
        _curScene = null,
        _cameras = {},
        _defaultCamera = null,
        _groups = {},
        _group = null,
        visiable = true,
        textures = {},
        fonts = {};

    // initialize all params
    (function () {
        if (_container = document.getElementById(id)) {
            // init basic props
            __initBasicProps__(_prop);
            // clearity of innerHTML
            _container.innerHTML = "";
            // configure the renderer
            _renderer = new THREE.WebGLRenderer({
                antialias: true
            });
            _renderer.setClearColor(_prop.clearColor);
            _renderer.setPixelRatio(window.devicePixelRatio);
            _renderer.setSize(_prop.cwidth, _prop.cheight);
            _renderer.shadowMap.enabled = true;
            _renderer.shadowMapSoft = true;
            _renderer.gammaInput = true;
            _renderer.gammaOutput = true;
            _container.appendChild(_renderer.domElement);
            // reserve old event of keydown and add new one
            __createListenerEvent__(window, "onkeydown");
            __createListenerEvent__(window, "onkeyup");
            __createListenerEvent__(window, "onmousemove");
            __createListenerEvent__(_container, "onmouseenter");
            __createListenerEvent__(_container, "onmouseout");
            for (var funcName in _prop.innerEvents) {
                __createListenerEvent__(_prop.innerEvents, funcName);
            }
            // register inner event
            __addEvent__("afterProc", function (clock, params) {
                if (_defaultCamera.mineController && _defaultCamera.mineController.update) {
                    _defaultCamera.mineController.update(clock);
                }
            });

        }
    })();

    // outter function
    if (!BlockPipeline.prototype.isFirstDefineMethodInClass) {
        Object.defineProperties(BlockPipeline.prototype, {
            isFirstDefineMethodInClass: {
                configurable: false,
                writable: false,
                enumerable: false,
                value: true
            },
            Controller: {
                configurable: false,
                value: {
                    addPersonalController: function (cameraId, props) {
                        if (_cameras[cameraId]) {
                            var controller = new THREE.FirstPersonControls(_cameras[cameraId], _container);
                            __setProperties__(controller, props);
                            __addProperty__(_cameras[cameraId], "mineController", controller);
                            return controller;
                        } else {
                            console.warn(cameraId + " isn't contained in camera list.");
                        }
                    },
                    addOrbitController: function (cameraId, props) {
                        if (_cameras[cameraId]) {
                            var controller = new THREE.OrbitControls(_cameras[cameraId], _renderer.domElement);
                            __setProperties__(controller, props);
                            __addProperty__(_cameras[cameraId], "mineController", controller);
                            return controller;
                        } else {
                            console.warn(cameraId + " isn't contained in camera list.");
                        }
                    }
                }
            },
            Gaffer: {
                configurable: false,
                value: {
                    addDirctionLight: function (props) {
                        if (props && _curScene) {
                            __defaultParam__(props, "x", 0);
                            __defaultParam__(props, "y", 100);
                            __defaultParam__(props, "z", 0);
                            __defaultParam__(props, "color", 0xffffff);
                            __defaultParam__(props, "castShadow", false);
                            __defaultParam__(props, "intensity", 1);
                            var light = new THREE.DirectionalLight(props.color, props.intensity);
                            light.position.set(props.x, props.y, props.z);
                            light.castShadow = props.castShadow;
                            if (props.castShadow) {
                                light.shadow.camera.top = 180;
                                light.shadow.camera.bottom = -100;
                                light.shadow.camera.left = -120;
                                light.shadow.camera.right = 120;
                            }
                            if (props.help) {
                                __defaultParam__(props, "size", 1);
                                var helper = new THREE.DirectionalLightHelper(light, props.size);
                                __turnToShow__(helper);
                                return helper;
                            } else {
                                __turnToShow__(light);
                                return light;
                            }
                        }
                    },
                    addSpotLight: function (props) {
                        if (props && _curScene) {
                            __defaultParam__(props, "color", 0xffffff);
                            __defaultParam__(props, "penumbra", 0.7);
                            __defaultParam__(props, "x", 0);
                            __defaultParam__(props, "y", 0);
                            __defaultParam__(props, "z", 0);
                            var spotLight = new THREE.SpotLight(props.color);
                            spotLight.penumbra = props.penumbra;
                            spotLight.position.set(props.x, props.y, props.z);
                            __turnToShow__(spotLight);
                            return spotLight;
                        }
                    }
                }
            },
            Producer: {
                configurable: false,
                value: {
                    callGroup: function (name) {
                        if (!_groups[name]) {
                            _group = _groups[name] = new THREE.Group();
                            if (_curScene) {
                                _curScene.add(_group);
                            } else {
                                throw new Error("please init scene before initing group.");
                            }
                        } else {
                            _group = _groups[name];
                        }
                        return _groups[name];
                    },
                    addPointCloud: function (props = {}) {
                        __defaultParam__(props, "pColor", 0xffffff);
                        __defaultParam__(props, "pSize", 1);
                        __defaultParam__(props, "ratio", 1);
                        __defaultParam__(props, "transparent", false);
                        __defaultParam__(props, "elevation", null);
                        if (props.elevation) {
                            var particlePositions = null,
                                particles = new THREE.BufferGeometry(),
                                particlesData = [],
                                particleCount = 0,
                                pointCloud = null,
                                count = 0,
                                width = 0,
                                long = 0,
                                compCloud = new THREE.Group();
                            props.elevation.forEach(function (row) {
                                long = Math.max(long, row.length);
                                width++;
                                particleCount += row.length;
                            });
                            particlePositions = new Float32Array(particleCount * 3);
                            for (var i = 0; i < props.elevation.length; ++i) {
                                for (var j = 0; j < props.elevation[i].length; ++j) {
                                    particlePositions[count * 3] = (j - parseInt(width / 2)) * props.ratio;
                                    particlePositions[count * 3 + 1] = props.elevation[i][j] * props.ratio;
                                    particlePositions[count * 3 + 2] = (i - parseInt(long / 2)) * props.ratio;
                                    count++;
                                    // add it to the geometry
                                    particlesData.push({
                                        velocity: new THREE.Vector3(-1 + Math.random() * 2, -1 + Math.random() * 2, -1 + Math.random() * 2),
                                        numConnections: 0
                                    });
                                }
                            }
                            particles.setDrawRange(0, particleCount);
                            particles.addAttribute('position', new THREE.BufferAttribute(particlePositions, 3).setDynamic(true));
                            // create the particle system
                            pointCloud = new THREE.Points(particles, new THREE.PointsMaterial({
                                color: props.pColor,
                                size: props.pSize,
                                blending: THREE.AdditiveBlending,
                                transparent: props.transparent,
                                sizeAttenuation: false
                            }));
                            compCloud.add(pointCloud);
                            __turnToShow__(compCloud);
                            return compCloud;
                        }
                    },
                    addEarth: function (props = {}) {

                    },
                    addItem: function (props = {}) {
                        __defaultParam__(props, "x", 0);
                        __defaultParam__(props, "y", 0);
                        __defaultParam__(props, "z", 0);
                        __defaultParam__(props, "scale", 1);
                        if (props.path) {
                            var loader = null, object = null;
                            if (props.path.endsWith(".fbx")) {
                                loader = new THREE.FBXLoader();
                                object = loader.parse(props.path);
                            } else if (props.path.endsWith(".gltf")) {
                                loader = new THREE.GLTFLoader();
                                loader.load(props.path, function(gltf) {
                                    gltf.scene.children[0].position.set(props.x, props.y, props.z);
                                    gltf.scene.children[0].scale.set(props.scale, props.scale, props.scale);
                                    object = __turnToShow__(gltf.scene);
                                }, function(xhr) {
                                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                                }, function(error) {
                                    console.log( 'An error happened: ' + error);
                                });
                            }
                        }
                        return __turnToShow__(object);
                    },
                    addCliender: function (props = {}) {
                        __defaultParam__(props, "radiusTop", 1);
                        __defaultParam__(props, "radiusBottom", 1);
                        __defaultParam__(props, "height", 1);
                        __defaultParam__(props, "radialSegments", 1);
                        __defaultParam__(props, "heightSegments", 1);
                        __defaultParam__(props, "openEnded", 1);
                        __defaultParam__(props, "thetaStart", 1);
                        __defaultParam__(props, "thetaLength", 1);
                        __defaultParam__(props, "color", 0xffff00);
                        var geometry = new THREE.CylinderBufferGeometry(
                                props.radiusTop,
                                props.radiusBottom,
                                props.height,
                                props.radialSegments,
                                props.heightSegments,
                                props.openEnded,
                                props.thetaStart,
                                props.thetaLength
                            ),
                            material = null;
                        material = new THREE.MeshBasicMaterial({
                            color: props.color
                        });

                        return __turnToShow__(new THREE.Mesh(geometry, material));
                    },
                    addTerrain: function (props = {}) {
                        __defaultParam__(props, "x", 0);
                        __defaultParam__(props, "y", 0);
                        __defaultParam__(props, "z", 0);
                        __defaultParam__(props, "l", 1);
                        __defaultParam__(props, "w", 1);
                        __defaultParam__(props, "ratio", 1);
                        __defaultParam__(props, "block", false);
                        __defaultParam__(props, "recompute", true);
                        __defaultParam__(props, "renderFrame", false);
                        __defaultParam__(props, "receiveShadow", false);
                        __defaultParam__(props, "castShadow", false);
                        __defaultParam__(props, "depth", 5);
                        __defaultParam__(props, "color", 0x2194ce);
                        var geometry = [],
                            material = null,
                            elevation = [],
                            terrain = new THREE.Group(),
                            min = Infinity,
                            i = 0,
                            len = 0,
                            rl = props.l * props.ratio,
                            rw = props.w * props.ratio,
                            starts = [],
                            sideTable = ["top", "bottom", "front", "behind", "left", "right"];
                        // generate geometry
                        if (props.elevation) {
                            for (i = 0; i < 6; ++i) {
                                elevation[i] = new Array();
                            }
                            for (i = 0, len = props.elevation.length; i < len; ++i) {
                                var row = props.elevation[i];
                                row.forEach(function (x) {
                                    min = min > x ? x : min;
                                });
                                elevation[0] = elevation[0].concat(row);
                                elevation[4].push(row[row.length - 1]);
                                elevation[5].push(row[0]);
                                if (i == 0) {
                                    elevation[2] = row;
                                } else if (i == (len - 1)) {
                                    elevation[3] = row.slice(0).reverse();
                                    elevation[5].reverse();
                                }
                            }
                            geometry[0] = new THREE.PlaneBufferGeometry(
                                rl,
                                rw,
                                props.l - 1,
                                props.w - 1
                            );
                            geometry[0].rotateX(-Math.PI / 2);
                            starts[0] = 0;
                            if (props.block) {
                                var mh = (min - props.depth) * props.ratio;
                                // bottom
                                geometry[1] = new THREE.PlaneBufferGeometry(rl, rw);
                                geometry[1].rotateX(-(Math.PI * 3) / 2);
                                geometry[1].translate(0, mh, 0);
                                // front
                                geometry[2] = new THREE.PlaneBufferGeometry(rl, mh, props.l - 1, 1);
                                geometry[2].translate(0, mh / 2, -rl / 2);
                                starts[2] = props.l * 3;
                                // behind
                                geometry[3] = new THREE.PlaneBufferGeometry(rl, mh, props.l - 1, 1);
                                geometry[3].rotateY(Math.PI);
                                geometry[3].translate(0, mh / 2, rl / 2);
                                starts[3] = props.l * 3;
                                // left
                                geometry[4] = new THREE.PlaneBufferGeometry(rw, mh, props.w - 1, 1);
                                geometry[4].rotateY(-Math.PI / 2);
                                geometry[4].translate(rw / 2, mh / 2, 0);
                                starts[4] = props.w * 3;
                                //right
                                geometry[5] = new THREE.PlaneBufferGeometry(rw, mh, props.w - 1, 1);
                                geometry[5].rotateY(Math.PI / 2);
                                geometry[5].translate(-rw / 2, mh / 2, 0);
                                starts[5] = props.w * 3;
                            }
                            for (i = 0; i < 6; ++i) {
                                if (geometry[i] && elevation[i].length > 0) {
                                    var vertices = geometry[i].attributes.position.array,
                                        vlen = vertices.length,
                                        elen = elevation[i].length;
                                    for (var z = 0, j = starts[i]; z < vlen && z < elen; ++z, j += 3) {
                                        vertices[j + 1] += elevation[i][z] * props.ratio;
                                    }
                                    if (props.recompute) {
                                        geometry[i].attributes.position.needsUpdate = true;
                                        geometry[i].computeVertexNormals();
                                    }
                                }
                            }
                        }
                        // generate material
                        for (i = 0; i < 6; ++i) {
                            if (geometry[i]) {
                                var side = sideTable[i],
                                    sideColor = props["color_" + side],
                                    meshName = props.mesh[side];
                                if (meshName) {
                                    if (meshName) {
                                        var texture = textures[meshName] ? textures[meshName] :
                                            __preLoad__(RES_TYPE_TEXTURES, [meshName])[0];
                                        if (side === "top") {
                                            material = new THREE.MeshLambertMaterial({
                                                map: texture
                                            });
                                        } else {
                                            texture.wrapS = THREE.RepeatWrapping;
                                            texture.wrapT = THREE.RepeatWrapping;
                                            texture.repeat.set(1, 1);
                                            material = new THREE.MeshBasicMaterial({
                                                map: texture
                                            });
                                        }
                                        material.wireframe = props.renderFrame;
                                    }
                                } else if (i == 0 && elevation && elevation.length > 0) {
                                    var texture = new THREE.CanvasTexture(__generateTexture__(
                                        elevation,
                                        props.l * props.ratio,
                                        props.w * props.ratio));
                                    texture.wrapS = THREE.ClampToEdgeWrapping;
                                    texture.wrapT = THREE.ClampToEdgeWrapping;
                                    material = new THREE.MeshBasicMaterial({
                                        map: texture
                                    });
                                } else {
                                    material = new THREE.MeshBasicMaterial({
                                        color: sideColor ? sideColor : props.color
                                    });
                                }
                                var mesh = new THREE.Mesh(geometry[i], material);
                                props.receiveShadow && (mesh.receiveShadow = true);
                                props.castShadow && (mesh.castShadow = true);
                                terrain.add(mesh);
                            }
                        }
                        // final calculation
                        terrain.position.x = props.x;
                        terrain.position.y = props.y;
                        terrain.position.z = props.z;
                        __turnToShow__(terrain);
                        return terrain;
                    },
                    addCube: function (props = {}) {
                        __defaultParam__(props, "l", 1);
                        __defaultParam__(props, "w", 1);
                        __defaultParam__(props, "h", 1);
                        __defaultParam__(props, "color", 0xffffff);
                        var cubeGeometry = new THREE.BoxGeometry(props.l, props.w, props.h);
                        var cubeMaterial = new THREE.MeshLambertMaterial({
                            color: props.color
                        });
                        return __turnToShow__(new THREE.Mesh(cubeGeometry, cubeMaterial));
                    }
                }
            },
            preLoad: {
                configurable: false,
                value: function (type, resource) {
                    __preLoad__(type, resource);
                }
            },
            setVisiable: {
                configurable: false,
                value: function (bool) {
                    visiable = !!bool;
                }
            },
            callScene: {
                configurable: false,
                value: function (name, props) {
                    !props && (props = {});
                    if (!_scenes[name]) {
                        __defaultParam__(props, "color", 0xffffff);
                        _scenes[name] = new THREE.Scene();
                        _scenes[name].background = new THREE.Color(props.color);
                        if (props.isFog) {
                            __defaultParam__(props, "near", 5);
                            __defaultParam__(props, "far", 100);
                            _scenes[name].fog = new THREE.Fog(props.color, props.near, props.far);
                        }
                        __addProperty__(_scenes[name], "curStats", null);
                        __addProperty__(_scenes[name], "curGrid", null);
                        __addProperty__(_scenes[name], "curAxis", null);
                        _curScene = _scenes[name];
                        return _scenes[name];
                    } else {
                        _curScene = _scenes[name];
                        __setProperties__(_curScene, props);
                    }
                    return _curScene;
                }
            },
            on: {
                configurable: false,
                value: function (eventName, callback) {
                    __addEvent__(eventName, callback);
                }
            },
            renderCycle: {
                configurable: false,
                value: function (props) {
                    !props && (props = {});
                    __defaultParam__(props, "once", false);
                    _prop.innerEvents.initProc(_prop.clock.getDelta(), _prop.params);
                    (function innerCycle() {
                        if (_curScene && _defaultCamera) {
                            _prop.innerEvents.beforeProc(_prop.clock.getDelta(), _prop.params);
                            if (_renderer && _curScene && _defaultCamera) {
                                _renderer.render(_curScene, _defaultCamera);
                            }
                            _curScene.curStats && _curScene.curStats.update();
                            _prop.innerEvents.afterProc(_prop.clock.getDelta(), _prop.params);
                            !props.once && requestAnimationFrame(innerCycle);
                        } else {
                            throw new Error("current scene or default camera is invalid.");
                        }
                    })();
                }
            },
            callCamera: {
                configurable: false,
                value: function (id, props) {
                    if (!_cameras[id]) {
                        __defaultParam__(props, "x", 0);
                        __defaultParam__(props, "y", 0);
                        __defaultParam__(props, "z", 0);
                        __defaultParam__(props, "fov", 20);
                        __defaultParam__(props, "near", 0.1);
                        __defaultParam__(props, "far", 500);
                        _cameras[id] = new THREE.PerspectiveCamera(
                            props.fov,
                            _prop.cwidth / _prop.cheight,
                            props.near,
                            props.far
                        );
                        _cameras[id].position.x = props.x;
                        _cameras[id].position.y = props.y;
                        _cameras[id].position.z = props.z;
                        if (!props.viewpos && _curScene) {
                            props.viewpos = _curScene.position;
                        }
                        _cameras[id].lookAt(props.viewpos);
                        _defaultCamera = _cameras[id];
                        return _cameras[id];
                    } else {
                        _defaultCamera = _cameras[id];
                        __setProperties__(_defaultCamera, props);
                    }
                    return _cameras[id];
                }
            },
            showBasicSet: {
                configurable: false,
                value: function (bool, props) {
                    if (_curScene) {
                        if (bool) {
                            !props && (props = {});
                            __defaultParam__(props, "size", 50);
                            __defaultParam__(props, "divisions", 20);
                            __defaultParam__(props, "axesLen", 10);
                            _curScene.curStats = new Stats();
                            _container.appendChild(_curScene.curStats.dom);
                            _curScene.curGrid = new THREE.GridHelper(props.size, props.divisions);
                            _curScene.curAxis = new THREE.AxesHelper(props.axesLen);
                            _curScene.add(_curScene.curGrid);
                            _curScene.add(_curScene.curAxis);
                        } else {
                            _curScene.curStats && _container.removeChild(_curScene.curStats.dom) && (_curScene.curStats = null);
                            _curScene.curGrid && _curScene.remove(_curScene.curGrid) && (_curScene.curGrid = null);
                            _curScene.curAxis && _curScene.remove(_curScene.curAxis) && (_curScene.curAxis = null);
                        }
                    } else {
                        throw new Error("you must turn to a scene at first!");
                    }
                }
            },
            collectInfo: {
                configurable: false,
                value: function () {

                }
            }
        });
    }

    // inner function
    function __preLoad__(type, resource) {
        if (resource && resource.length > 0) {
            var sets = {},
                innerRes = [];
            switch (type) {
                case RES_TYPE_TEXTURES:
                    sets.text = RES_TYPE_TEXTURES;
                    sets.res = textures;
                    sets.loader = THREE.TextureLoader;
                    break;
                case RES_TYPE_FONTS:
                    sets.text = RES_TYPE_FONTS;
                    sets.res = fonts;
                    sets.loader = THREE.FontLoader;
                    break;
                default:
                    throw new Error("unkown type.");
            }
            resource.forEach(function (path) {
                innerRes.push(sets.res[path] = new sets.loader().load(path, function() {
                    console.log(sets.text + " is loaded.");
                }, function (xhr) {
                    console.log(sets.text + " : " + ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                }, function(err) {
                    console.log("running has error: " + err);
                }));
            });
            return innerRes;
        } else {
            throw new Error("resource list can't be void.");
        }
    }

    function __turnToShow__(obj) {
        if (visiable) {
            _group ? _group.add(obj) : (_curScene ? _curScene.add(obj) : null);
        }
        return obj;
    }

    function __addProperty__(obj, key, val) {
        Object.defineProperty(obj, key, {
            configurable: false,
            writable: true,
            value: val
        });
    }

    function __addEvent__(type, method) {
        if (typeof method == "function" && _allEvents[type]) {
            _allEvents[type].push({
                method: method
            });
        } else {
            throw new Error(method + "isn't a function or don't register.");
        }
    }

    function __createListenerEvent__(dom, eventName) {
        if (eventName in dom) {
            var oldEvent = dom[eventName],
                i = 0,
                handle = _allEvents[eventName] = [];
            dom[eventName] = function (event) {
                oldEvent && oldEvent();
                if (handle.length > 0) {
                    for (i = 0; i < handle.length; ++i) {
                        handle[i].method(event, _prop.params);
                    }
                }
            }
        } else {
            throw new Error("not exist this event: " + eventName);
        }
    }

    function __defaultParam__(props, name, value) {
        if (typeof props === "object" && !props.hasOwnProperty(name)) {
            props[name] = value;
        }
    }

    function __setProperties__(obj, properties) {
        if (obj && properties) {
            for (var name in properties) {
                if (name in obj) {
                    obj[name] = properties[name];
                }
            }
        }
    }

    function __generateTexture__(data, width, height) {
        var canvas, canvasScaled, context, image, imageData,
            level, diff, vector3, sun, shade;
        vector3 = new THREE.Vector3(0, 0, 0);
        sun = new THREE.Vector3(1, 1, 1);
        sun.normalize();
        canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        context = canvas.getContext('2d');
        context.fillStyle = '#000';
        context.fillRect(0, 0, width, height);
        image = context.getImageData(0, 0, canvas.width, canvas.height);
        imageData = image.data;
        for (var i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
            vector3.x = data[j - 2] - data[j + 2];
            vector3.y = 2;
            vector3.z = data[j - width * 2] - data[j + width * 2];
            vector3.normalize();
            shade = vector3.dot(sun);
            imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007);
            imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007);
            imageData[i + 2] = (shade * 96) * (0.5 + data[j] * 0.007);
        }
        context.putImageData(image, 0, 0);
        // Scaled 4x
        canvasScaled = document.createElement('canvas');
        canvasScaled.width = width * 4;
        canvasScaled.height = height * 4;
        context = canvasScaled.getContext('2d');
        context.scale(4, 4);
        context.drawImage(canvas, 0, 0);
        image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
        imageData = image.data;
        for (var i = 0, l = imageData.length; i < l; i += 4) {
            var v = ~~(Math.random() * 5);
            imageData[i] += v;
            imageData[i + 1] += v;
            imageData[i + 2] += v;
        }
        context.putImageData(image, 0, 0);
        return canvasScaled;
    }

    function __initBasicProps__(__prop__) {
        Object.defineProperties(__prop__, {
            innerEvents: {
                configurable: false,
                writable: true,
                value: {
                    initProc: null,
                    beforeProc: null,
                    afterProc: null
                }
            },
            cwidth: {
                value: parseInt(_container.style.width),
                configurable: false,
                writable: true
            },
            cheight: {
                value: parseInt(_container.style.height),
                configurable: false,
                writable: true
            },
            clearColor: {
                value: 0xdddddd,
                configurable: false,
                writable: true
            },
            clock: {
                value: new THREE.Clock(),
                configurable: false
            },
            params: {
                configurable: false,
                value: {
                    get nowDate() {
                        return Date.now();
                    },
                    get curScene() {
                        return _curScene;
                    },
                    get curCamera() {
                        return _defaultCamera;
                    },
                    get curGroup() {
                        return _group;
                    },
                    get allScenes() {
                        return _scenes;
                    },
                    get allCameras() {
                        return _cameras;
                    },
                    get basic() {
                        return _prop;
                    }
                }
            }
        });
    }
}