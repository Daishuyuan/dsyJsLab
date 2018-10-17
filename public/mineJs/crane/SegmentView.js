(function () {
    const ORIGIN = 0;

    var canvas = document.getElementById("view"),
        context = canvas.getContext("2d"),
        colours = [],
        angles = [],
        width = parseFloat(canvas.width),
        height = parseFloat(canvas.height),
        craneLen = 0,
        radius = 5;

    function createSlider(crane, segments) {
        let slidersWrap = ["<tr class='success'><td><h2>Angle:</h2></td></tr>"],
            fromAngle = -180,
            toAngle = 180,
            step = 1;
        for (let i = 0; i < segments.length; ++i) {
            var sliderWrap = "<div class='well'>" +
                "<input id='seg" + i + "' data-slider-id='segSlider" + i + "' type='text'" +
                "data-slider-min='" + fromAngle + "' data-slider-max='" + toAngle + "' data-slider-step='" + step + "'" +
                "data-slider-value='" + ORIGIN + "' /></div>";
            slidersWrap.push("<tr class='success' style='width: 100%;'><td>Segment " + i + ":</td><td>" +
                sliderWrap + "</td><td><h3 id='segInfo" + i + "'></h3></td></tr>");
        }
        $("#segControllors").html("<tbody>" + slidersWrap.join("") + "</tbody>");
        for (let j = 0; j < segments.length; ++j) {
            (function (i) {
                $('#seg' + i).slider({
                    formatter: function (value) {
                        angles[i] = value;
                        changeCrane(crane, angles);
                        $("#segInfo" + i).html("<b'>" + Initer.getIndentNumber(value, 5) + " deg</b>");
                        return 'Current value: ' + value;
                    }
                });
                angles[i] = ORIGIN;
            })(j);
        }
    }

    function norm(x, y) {
        return [x + width / 2, -y + height / 4 * 3];
    }

    function drawSegmentTree(segments) {
        craneLen = segments.length;
        let crane = new Crane(segments);
        for (let i = 0; i < segments.length; ++i) {
            colours.push(Initer.getRandomColor());
        }
        createSlider(crane, segments);
        changeCrane(crane, angles);
    }

    function drawCircle(ctx, x, y, r, color) {
        ctx.lineWidth = 1;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    function changeCrane(crane, angles) {
        crane = crane.toCopy();
        for (let j = 0; j < angles.length; ++j) {
            crane.change(j, angles[j]);
        }
        let innerTree = crane.innerTree();
        let [lpx, lpy] = [0, 0];
        context.clearRect(0, 0, width, height);
        for (let i = 0; i < craneLen; ++i) {
            let searcher = crane.search(i, i + 1);
            if (searcher) {
                let [siteX, siteY] = norm(lpx, lpy);
                lpx += parseFloat(searcher.vx.toFixed(2));
                lpy += parseFloat(searcher.vy.toFixed(2));
                // redrawing crane
                drawCircle(context, siteX, siteY, radius, colours[i]);
                context.beginPath();
                context.moveTo(siteX, siteY);
                context.lineWidth = 5;
                context.strokeStyle = colours[i];
                [siteX, siteY] = norm(lpx, lpy);
                context.lineTo(siteX, siteY);
                context.stroke();
                context.closePath();
                drawCircle(context, siteX, siteY, radius, colours[i]);
            }
        }
    }

    $("#version").html(Initer.getChromeVersion() < 60 ||
        Initer.getBrowserType() !== "Chrome" ? "Maybe Not Support" : "Support");
    $("#today").html(Initer.getToday());
    $("#name").html(Initer.getName(68, 97, 118, 105, 100));

    window.initDrawing = function () {
        var regEx = /[0-9]|,|，/;
        var segments = $("#segments").val();
        if (segments && regEx.test(segments)) {
            $("#controlPanel").fadeOut(500);
            $("#viewPanel").fadeIn(1000);
            var segments = segments.split(/,|，/).filter(function (x) {
                return !!x;
            }).map(function (x) {
                return (parseFloat(x) * 10) | 0;
            });
            $("[data-toggle='popover']").popover();
            drawSegmentTree(segments);
        } else {
            $("[data-toggle='popover']").popover();
        }
    }
})();