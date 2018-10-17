!function(){
    $("#version").html(Initer.getChromeVersion() < 60 ||
    Initer.getBrowserType() !== "Chrome" ? "Maybe Not Support" : "Support");
    $("#today").html(Initer.getToday());
    $("#name").html(Initer.getName(68, 97, 118, 105, 100));

    window.initDrawing = function() {
        var value = $("#segments").val(),
            tokens = value.split(','),
            mStr = /^[1-9]+[0-9]*,[1-9]+[0-9]*,1|0$/;
        if(tokens.length === 3 && mStr.test(value)) {
            layer.msg("pass!");
            $("#controlPanel").hide(500);
            $("#viewPanel").show(1000);
            var row = parseInt(tokens[0]),
                col = parseInt(tokens[1]),
                matrix = new PainterMatrix("view", row, col, 50);
                matrix.backColor.set("#642100");
            matrix.mouseConfigure(1, "#336666", function() {
                var res = LakeCount(matrix.getMatrix(), row, col, !!parseInt(tokens[2]));
                $("#segControllors").val(`The count of these lakes is ${res}.`);
            }, true);
        } else {
            layer.msg("inputed parameters is invalid!");
        }
    }
}()