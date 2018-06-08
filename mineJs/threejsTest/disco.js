function Disco(divId) {
    var _container = document.getElementById(divId),
        cameras = {},
        scene = null,
        renderer = null,
        stats = null,
        grid = null,
        axis = null,
        prop = {},
        Initer = {},
        clock = new THREE.Clock(),
        controls = null,
        trackballControls = null,
        orbitControls = null,
        allEvents = [];
    Object.defineProperties(prop, {
        ORIGIN: {
            value: "OriginValue",
            configurable: false,
            writable: false
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
        animateControl: {
            value: false,
            writable: true
        }
    });
    Object.assign(Initer, {
        createCube: function (x = 0, y = 0, z = 0, long = 1, width = 1, height = 1, color = 0xffffff) {
            var cubeGeometry = new THREE.BoxGeometry(long, width, height);
            var cubeMaterial = new THREE.MeshLambertMaterial({
                color: color
            });
            var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.position.x = x;
            cube.position.y = y;
            cube.position.z = z;
            return cube;
        },
        createSimpleCamera: function (id, x = 0, y = 0, z = 0, viewRange = 500, pos = scene.position, viewDistance = 20) {
            var camera = new THREE.PerspectiveCamera(viewDistance, prop.cwidth / prop.cheight, 0.1, viewRange);
            camera.position.x = x;
            camera.position.y = y;
            camera.position.z = z;
            camera.lookAt(pos);
            if (!cameras[prop.ORIGIN]) {
                cameras[prop.ORIGIN] = camera;
                return;
            }
            if (id != prop.ORIGIN) {
                cameras[id] = camera;
            } else {
                throw new Error("this id is reserved!");
            }
        },
        createSpotLight: function (x = 0, y = 0, z = 0, penumbra = 0, color = 0xffffff) {
            var spotLight = new THREE.SpotLight(color);
            spotLight.penumbra = penumbra;
            spotLight.position.set(x, y, z);
            return spotLight;
        },
        createSimplePlane: function (long = 1, width = 1, height = 1, color = 0xffffff) {
            var planeGeometry = new THREE.PlaneGeometry(long, width, height);
            var planeMaterial = new THREE.MeshLambertMaterial({
                color: color
            });
            var plane = new THREE.Mesh(planeGeometry, planeMaterial);
            return plane;
        },
        getScene: function () {
            return scene;
        },
        showBasicSet: function (isStats, isGrid, isAxis) {
            if (!!isStats && !stats) {
                stats = new Stats();
                _container.appendChild(stats.dom);
            } else {
                stats && _container.removeChild(stats.dom);
                stats = null;
            }
            if (!!isGrid && !grid) {
                grid = new THREE.GridHelper(50, 20);
                scene.add(grid);
            } else {
                grid && scene.remove(grid);
                grid = null;
            }
            if (!!isAxis && !axis) {
                axis = new THREE.AxesHelper(10);
                scene.add(axis);
            } else {
                axis && scene.remove(axis);
                axis = null;
            }
        },
        animate: function (cameraId, callback) {
            function animatExecutor() {
                if (prop.animateControl) {
                    requestAnimationFrame(arguments.callee);
                    callback && callback(clock);
                    if (controls && controls.mouseFlag) {
                        controls.update(clock.getDelta());
                    }
                    if (trackballControls && trackballControls.mouseFlag) {
                        trackballControls.update();
                    }
                    cameraId && cameras[cameraId] ?
                        renderer.render(scene, cameras[cameraId]) :
                        renderer.render(scene, cameras[prop.ORIGIN]);
                    stats && stats.update();
                }
            }
            prop.animateControl = true;
            animatExecutor();
        },
        closeAnimate: function () {
            prop.animateControl = false;
        },
        activeTrackballControls: function (properties, camera = cameras[prop.ORIGIN]) {
            if (!trackballControls) {
                trackballControls = THREE.TrackballControls(camera);
                __setProperties__(trackballControls, properties);
                __addEvent__("onmouseout", function () {
                    trackballControls && (trackballControls.mouseFlag = false);
                });
                __addEvent__("onmouseenter", function () {
                    trackballControls && (trackballControls.mouseFlag = true);
                });
            }
        },
        activePersonalControls: function (properties, camera = cameras[prop.ORIGIN]) {
            if (!controls) {
                controls = new THREE.FirstPersonControls(camera, _container);
                __setProperties__(controls, properties);
                __addEvent__("onmouseout", function () {
                    controls && (controls.mouseFlag = false);
                });
                __addEvent__("onmouseenter", function () {
                    controls && (controls.mouseFlag = true);
                });
            }
        },
        closePersonalControls: function () {
            controls = null;
        },
        closeTrackballControls: function () {
            trackballControls = null;
        },
        activeOrbitControls: function (properties, camera = cameras[prop.ORIGIN]) {
            if (!orbitControls) {
                orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
                __setProperties__(orbitControls, properties);
            }
        },
        closeOrbitControls: function () {
            orbitControls.dispose();
            orbitControls = null;
        },
        setSkyBox: function () {
            var cubeTextureLoader = new THREE.CubeTextureLoader();
            cubeTextureLoader.setPath('textures/cube/skyboxsun25deg/');

            cubeMap = cubeTextureLoader.load([
                'px.jpg', 'nx.jpg',
                'py.jpg', 'ny.jpg',
                'pz.jpg', 'nz.jpg',
            ]);

            var cubeShader = THREE.ShaderLib['cube'];
            cubeShader.uniforms['tCube'].value = cubeMap;

            var skyBoxMaterial = new THREE.ShaderMaterial({
                fragmentShader: cubeShader.fragmentShader,
                vertexShader: cubeShader.vertexShader,
                uniforms: cubeShader.uniforms,
                side: THREE.BackSide
            });

            var skyBoxGeometry = new THREE.BoxBufferGeometry(long, height, width);

            var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);

            scene.add(skyBox);
        },
        createMountain: function (long, width, worldWidth, worldDepth) {
            var data = __perlinHeights__(worldWidth, worldDepth, 1, 5);
            var geometry = new THREE.PlaneBufferGeometry(long, width, worldWidth, worldDepth);
            geometry.rotateX(-Math.PI / 2);
            var vertices = geometry.attributes.position.array;
            for (var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
                vertices[j + 1] = Math.random() * 15 + 1;
            }
            var texture = new THREE.CanvasTexture( __generateTexture__( data, worldWidth, worldDepth ) );
			texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            var material = new THREE.MeshBasicMaterial( { map: texture } );
            return new THREE.Mesh(geometry, material);
        }
    });

    function __generateTexture__( data, width, height ) {
        var canvas, canvasScaled, context, image, imageData,
        level, diff, vector3, sun, shade;
        vector3 = new THREE.Vector3( 0, 0, 0 );
        sun = new THREE.Vector3( 1, 1, 1 );
        sun.normalize();
        canvas = document.createElement( 'canvas' );
        canvas.width = width;
        canvas.height = height;
        context = canvas.getContext( '2d' );
        context.fillStyle = '#000';
        context.fillRect( 0, 0, width, height );
        image = context.getImageData( 0, 0, canvas.width, canvas.height );
        imageData = image.data;
        for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {
            vector3.x = data[ j - 2 ] - data[ j + 2 ];
            vector3.y = 2;
            vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
            vector3.normalize();
            shade = vector3.dot( sun );
            imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
            imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
            imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
        }
        context.putImageData( image, 0, 0 );
        // Scaled 4x
        canvasScaled = document.createElement( 'canvas' );
        canvasScaled.width = width * 4;
        canvasScaled.height = height * 4;
        context = canvasScaled.getContext( '2d' );
        context.scale( 4, 4 );
        context.drawImage( canvas, 0, 0 );
        image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
        imageData = image.data;
        for ( var i = 0, l = imageData.length; i < l; i += 4 ) {
            var v = ~~ ( Math.random() * 5 );
            imageData[ i ] += v;
            imageData[ i + 1 ] += v;
            imageData[ i + 2 ] += v;
        }
        context.putImageData( image, 0, 0 );
        return canvasScaled;
    }

    function __perlinHeights__(width, height, offsetHeight, qualityRatio) {
        var size = width * height,
            data = new Uint8Array(size),
            perlin = new ImprovedNoise(),
            quality = 1,
            z = Math.random() * offsetHeight;
        for (var j = 0; j < 4; j++) {
            for (var i = 0; i < size; i++) {
                var x = i % width,
                    y = ~~(i / width);
                data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75);
            }
            quality *= qualityRatio;
        }
        return data;
    }

    function __setProperties__(obj, properties) {
        if (properties) {
            for (var name in properties) {
                obj[name] = properties[name];
            }
        }
    }

    function __addEvent__(type, method) {
        if (typeof method == "function") {
            allEvents.push({
                type: type.toLowerCase(),
                method: method
            });
        }
    }

    function __createListenerEvent__(dom, eventName) {
        var oldEvent = dom[eventName];
        dom[eventName] = function (event) {
            oldEvent && oldEvent();
            for (var i = 0; i < allEvents.length; ++i) {
                if (allEvents[i].type === eventName) {
                    allEvents[i].method(event);
                }
            }
        }
    }

    (function () {
        _container.innerHTML = "";
        // configure the renderer
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0xdddddd);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(prop.cwidth, prop.cheight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMapSoft = true;
        // set scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);
        // set position of camera
        Initer.createSimpleCamera(prop.ORIGIN, 40, 40, 40);
        // set renderer in container
        _container.appendChild(renderer.domElement);
        var oldkeydown = window.onkeydown;
        // reserve old event of keydown and add new one
        __createListenerEvent__(window, "onkeydown");
        __createListenerEvent__(window, "onmousemove");
        __createListenerEvent__(_container, "onmouseenter");
        __createListenerEvent__(_container, "onmouseout");
    })();

    Object.assign(Disco.prototype, {
        customizeInitialization: function (initerFunc) {
            var cameraId = initerFunc(Initer);
            cameraId && cameras[cameraId] ?
                renderer.render(scene, cameras[cameraId]) :
                renderer.render(scene, cameras[prop.ORIGIN]);
        },
        addEvent: function (type, method) {
            __addEvent__(type, method);
        }
    });
}