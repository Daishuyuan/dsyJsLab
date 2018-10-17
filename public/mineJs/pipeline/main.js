(function () {
    // basic initilization
    $("#version").html(Initer.getChromeVersion() < 60 || Initer.getBrowserType() !== "Chrome" ? "Maybe Not Support" : "Support");
    $("#today").html(Initer.getToday());
    $("#name").html(Initer.getName(68, 97, 118, 105, 100));

    // pipeline initilization
    var pipeline = new BlockPipeline("view"),
        terrainCloud = null,
        terrainReal = null,
        data = {};
    pipeline.callScene("testScene", {
        color: 0x222222,
        isFog: false,
        near: 100,
        far: 1500
    });
    pipeline.Producer.callGroup("terrain");
    pipeline.callCamera("first", {
        x: 400,
        y: 400,
        z: 400,
        far: 6000
    });
    pipeline.Gaffer.addDirctionLight({
        intensity: 0.99
    });
    pipeline.Controller.addOrbitController("first");
    pipeline.preLoad("textures", ['/img/textures/terrainBack.jpg', '/img/textures/terrainSide.jpg']);
    pipeline.showBasicSet(false);

    pipeline.on("beforeProc", function (event, params) {
        if (terrainReal) {
            terrainReal.rotateY(event * 0.1);
        }
    });

    pipeline.on("onkeyup", function (event, params) {
        switch (event.code) {
            case "Digit1":
                dataResource(data, 0, 0, 200, 200);
                break;
            case "Digit2":
                dataResource(data, 0, 200, 200, 200);
                break;
            case "Digit3":
                dataResource(data, 200, 0, 200, 200);
                break;
            case "Digit4":
                dataResource(data, 200, 200, 200, 200);
                break;
            case "KeyM":
                pipeline.Producer.addItem({
                    path: '/models/SatelliteBig/scene.gltf',
                    scale: 0.05,
                    y: 400
                });
                break;
            case "KeyO":
                pipeline.Producer.addItem({
                    path: '/models/Calipso/scene.gltf',
                    scale: 0.05,
                    y: 800
                });
                break;
                // case "Digit5":
                //     dataResource(data, 2575, 0, 200, 400);
                //     break;
            case "KeyQ":
                if (data.matrix && params.curGroup) {
                    terrainReal && params.curGroup.remove(terrainReal);
                    terrainCloud && params.curGroup.remove(terrainCloud);
                    terrainCloud = pipeline.Producer.addPointCloud({
                        pColor: 0x00ff33,
                        elevation: data.matrix
                    });
                    params.curGroup.add(terrainCloud);
                }
                break;
            case "KeyW":
                if (data.matrix && params.curGroup) {
                    terrainReal && params.curGroup.remove(terrainReal);
                    terrainCloud && params.curGroup.remove(terrainCloud);
                    terrainReal = pipeline.Producer.addTerrain({
                        l: data.width,
                        w: data.height,
                        elevation: data.matrix,
                        color: 0x222222,
                        renderFrame: false,
                        receiveShadow: true,
                        castShadow: true,
                        ratio: 10,
                        mesh: {
                            top: '/img/textures/terrainBack.jpg',
                            bottom: '/img/textures/terrainSide.jpg',
                            front: '/img/textures/terrainSide.jpg',
                            behind: '/img/textures/terrainSide.jpg',
                            left: '/img/textures/terrainSide.jpg',
                            right: '/img/textures/terrainSide.jpg'
                        },
                        block: true
                    });
                    params.curGroup.add(terrainReal);
                }
                break;
        }
    });
    pipeline.renderCycle();
})();

function dataResource(rawData, x, y, width, height) {
    // request data
    var scale = 100;
    $.ajax("/csv/field_" + [x, y, width, height].join('_')).done(function (data) {
        var rows = data.split("\n").filter(x => x.length !== 0),
            max = 0,
            i = 0,
            j = 0,
            avg = 0,
            matrix = [];
        for (i = 0; i < rows.length; ++i) {
            var row = rows[i].split(",").map(x => parseInt(x)),
                _max = 0,
                _avg = 0;
            for (j = 0; j < row.length; ++j) {
                _avg += row[j];
                if (_max < row[j]) {
                    _max = row[j];
                }
            }
            avg += _avg / row.length;
            if (max < _max) {
                max = _max;
            }
            matrix.push(row);
        }
        avg /= rows.length;
        rawData.avg = !rawData.avg ? avg : rawData.avg;
        matrix = matrix.map(row => row.map(x => parseFloat((x - rawData.avg) * scale / max)));
        rawData.matrix = matrix;
        rawData.width = width;
        rawData.height = height;
        rawData.x = x;
        rawData.y = y;
    });
}