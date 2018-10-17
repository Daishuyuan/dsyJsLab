~ function () {
    $("#version").html(Initer.getChromeVersion() < 60 ||
        Initer.getBrowserType() !== "Chrome" ? "Maybe Not Support" : "Support");
    $("#today").html(Initer.getToday());
    $("#name").html(Initer.getName(68, 97, 118, 105, 100));

    function addrAnalysis(ip) {
        var seq = ip.split('.'),
            head = parseInt(seq[0]),
            left = parseInt(seq[1]),
            type = "-",
            keyword = "public";
        if ((head & 0x80) == 0x0) {
            type = "A", (head === 10) && (keyword = "private");
        } else if ((head & 0xC0) == 0x80) {
            type = "B", (head === 172) && (left <= 31 && left >= 16) && (keyword = "private");
        } else if ((head & 0xE0) == 0xC0) {
            type = "C", (head === 192) && (left === 168) && (keyword = "private");
        } else if ((head & 0xF0) == 0xE0) {
            type = "D";
        } else if ((head & 0xF0) == 0xF0) {
            type = "E";
        }
        return [type, keyword];
    }

    window.initDrawing = function () {
        var val = $("#segments").val(),
            mStr = /^[0-9]{1,12}$/;
        if (val.indexOf(".") === -1 && mStr.test(val)) {
            $("#viewPanel").show(200);
            var ips = IPSplit(val);
            $("#menu").empty();
            ips.forEach(function (x) {
                var [type, keyword, retain] = addrAnalysis(x);
                $("#menu").append(`<li class="list-group-item">${x} ${type} ${keyword}</li>`);
            });
        } else {
            layer.msg("params is invalid!");
        }
    }
}()