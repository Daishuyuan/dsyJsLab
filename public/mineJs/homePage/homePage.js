function scrollObjs(obj, tick) {
    function initTimer() {
        return setInterval(function() {
            var lineHeight = $self.find("li:first").height();
            $self.animate({
                "marginTop": -lineHeight + "px"
            }, 600, function () {
                $self.css({
                    marginTop: 0
                }).find("li:first").appendTo($self);
            })
        }, tick);
    }
    var $self = obj;
    var $timer = initTimer();
    $self.mouseover(function(e) {
        clearInterval($timer);
    });
    $self.mouseout(function(e) {
        $timer = initTimer();
    });
}

function rollAndRoll(id, tick) {
    var innerList = document.getElementById(id).children,
        cache, index = 0;
    setInterval(function () {
        cache = innerList[innerList.length - 1].innerHTML;
        innerList[innerList.length - 1].innerHTML = innerList[index].innerHTML;
        innerList[index].innerHTML = cache;
        innerList[index].style = "display:none;";
        (function (i) {
            setTimeout(function () {
                innerList[i].style = "display:block;";
            }, tick / 5);
        })(index);
        index = (++index) % innerList.length;
    }, tick);
}

~ function () {
    $("#version").html(Initer.getChromeVersion() < 60 ||
        Initer.getBrowserType() !== "Chrome" ? "Maybe Not Support" : "Support");
    $("#today").html(Initer.getToday());
    $("#name").html(Initer.getName(68, 97, 118, 105, 100));
    scrollObjs($("#menu"), 2000);
}()