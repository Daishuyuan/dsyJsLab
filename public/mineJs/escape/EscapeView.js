~ function () {
    $("#version").html(Initer.getChromeVersion() < 60 ||
        Initer.getBrowserType() !== "Chrome" ? "Maybe Not Support" : "Support");
    $("#today").html(Initer.getToday());
    $("#name").html(Initer.getName(68, 97, 118, 105, 100));

    window.initDrawing = function () {
        var str = $("#segments").val(),
            mStr = /([1-9]+[0-9]*),([1-9]+[0-9]*)/,
            colorMap = ["#d9b3b3", "#cf9e9e", "#c48888", "#b87070", "#ad5a5a", "#984b4b", "#804040", "#743a3a", "#613030"];
        if (mStr.test(str)) {
            $("#controlPanel").hide(200);
            $("#viewPanel").show(500);
            let tokens = str.split(","),
                width = parseInt(tokens[0]),
                height = parseInt(tokens[1]),
                map = new PainterMatrix("view", height, width, 25),
                mapRes = new PainterMatrix("viewRes", height, width, 25);
            window.addValue = function () {
                let val = parseInt($("#segControllors").val());
                if (!isNaN(val) && val >= 1 && val <= 9) {
                    layer.msg("please click right map!");
                    map.mouseConfigure(val, colorMap[val - 1], function () {
                        layer.msg("succeed!");
                    }, false);
                } else {
                    layer.msg("val is NaN or val isn't in range(1,9)!");
                }
            }
            window.startUp = function () {
                $("#viewRes").show(200);
                $("#selectPanel").hide(200);
                var [res, sum] = FindWay(map.getMatrix(), height, width);
                res.forEach(function (x) {
                    var pos = x.split(",");
                    mapRes.drawBlock(parseInt(pos[0]), parseInt(pos[1]), "#5151a2");
                });
                layer.msg(`all slow down value: ${sum}`);
                setInterval(function() {
                    layer.msg(`all slow down value: ${sum}`);
                }, 4000);
            }
        } else {
            layer.msg("parameters are invalid!");
        }
    }
}()