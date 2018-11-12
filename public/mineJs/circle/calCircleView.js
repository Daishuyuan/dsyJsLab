! function () {
    $("#version").html(Initer.getChromeVersion() < 60 ||
        Initer.getBrowserType() !== "Chrome" ? "Maybe Not Support" : "Support");
    $("#today").html(Initer.getToday());
    $("#name").html(Initer.getName(68, 97, 118, 105, 100));
    var row = 40,
        col = 40,
        matrix = new PainterMatrix("view", row, col, 8),
        circler = new CalCircle(),
        m;
    matrix.backColor.set("#fff");
    _drawAndCal();

    function _reDraw() {
        $("#segControllors").val("click to cal");
        for (let i = 0; i < row; ++i) {
            for (let j = 0; j < col; ++j) {
                if (m[i][j]) {
                    matrix.drawBlock(i, j, "#336666");
                } else {
                    matrix.drawBlock(i, j, "#fff");
                }
            }
        }
    }

    function _drawAndCal() {
        m = circler.generate(col, row);
        _reDraw();
    }

    function _show(res) {
        $("#segControllors").val(`(${res[1]}, ${-res[0]})`);
    }

    function _cal() {
        var res = circler.find(m, row, col);
        _show(res);
        if (!isNaN(parseInt(res[0])) && !isNaN(parseInt(res[1]))) {
            let ps = circler.sel_points;
            matrix.drawBlock(ps[0][0], ps[0][1], "#00ffff");
            matrix.drawBlock(ps[1][0], ps[1][1], "#00ff00");
            matrix.drawBlock(ps[2][0], ps[2][1], "#00ff00");
            matrix.drawBlock(res[0], res[1], "#ff0000");
            return [res[0], res[1]];
        }
        return [NaN, NaN];
    }

    window.recover = function () {
        _drawAndCal();
    }

    window.recal = function () {
        _reDraw();
        _cal();
    }

    window.recal_10 = function (SIZE = 10) {
        let x = 0, y = 0, count = SIZE;
        _reDraw();
        for (let i = 0; i < SIZE; ++i) {
            let [xd, yd] = _cal();
            if (!isNaN(xd) && !isNaN(yd)) {
                x += xd;
                y += yd;
            } else {
                count--;
            }
        }
        let res = [parseInt(x/count), parseInt(y/count)];
        _show(res);
        matrix.drawBlock(res[0], res[1], "#0000ff");
    }
}()