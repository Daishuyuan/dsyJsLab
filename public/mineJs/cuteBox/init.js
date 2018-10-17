(function () {
    $("#version").html(Initer.getChromeVersion() < 60 || 
    Initer.getBrowserType() !== "Chrome" ? "Maybe Not Support" : "Support");
    $("#today").html(Initer.getToday());
    $("#name").html(Initer.getName(68, 97, 118, 105, 100));

    window.initCuteBox = function () {
        var regEx = /[0-9]|,|，/;
        var params = $("#params").val();
        if (params && regEx.test(params)) {
            params = params.split(/,|，/).filter(function (x) {
                return !!x;
            }).map(function (x) {
                return parseInt(x);
            });
            if (params.length >= 3) {
                $("#controlPanel").fadeOut(500);
                $("#viewPanel").fadeIn(1000);
                $("[data-toggle='popover']").popover();
                var gm = new GameManager(params[0], params[1], "envir", "logger");
                gm.setCount(params[2]);
                gm.switchLearning(!!params[3]);
                gm.setRewardsPanel("showRewardsPanel");
                gm.noSpeeking = true;
                gm.init();
                if (!!params[3]) {
                    $("#tech").html("Q-Learning");
                } else {
                    $("#tech").html("SARSA-Learning");
                }
                $('#speedSlider').slider({
                    formatter: function (value) {
                        gm.setSpeed(value);
                        $("#speedContent").html("per " + (value / 1000) + " s");
                        return 'Current value: ' + value;
                    }
                });
                $("[data-toggle='popover']").popover();
            } else {
                $("[data-toggle='popover']").popover();
            }
        } else {
            $("[data-toggle='popover']").popover();
        }
    }
})()