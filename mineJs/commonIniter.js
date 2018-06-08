var Initer = (function () {
    var __initer__ = {},
        sequences = [
            parseInt(Math.random() * 17),
            parseInt(Math.random() * 17 + 17),
            parseInt(Math.random() * 17 + 27),
            parseInt(Math.random() * 17 + 37),
            parseInt(Math.random() * 17 + 47)
        ],
        sessionId = (0xffffff ^ parseInt(0xffffff * Math.random()) << parseInt(Math.random() * 6) + 1),
        hexstr = "ABCDEF0123456789";
    Object.defineProperties(__initer__, {
        getIndentNumber: {
            configurable: false,
            writable: false,
            enumerable: false,
            value: function (num, indent) {
                num = num.toString();
                if (num.length > indent) {
                    return num.substring(0, num.length - 1) + "-";
                } else {
                    let dis = indent - num.length;
                    for (let i = 0; i < dis; ++i) {
                        num = "&nbsp;" + num;
                    }
                    return num;
                }
            }
        },
        getName: {
            configurable: false,
            writable: false,
            enumerable: false,
            value: function () {
                let name = "";
                for (let argument of arguments) {
                    name += String.fromCharCode(argument);
                }
                return name;
            }
        },
        getToday: {
            configurable: false,
            writable: false,
            enumerable: false,
            value: function () {
                let today = new Date();
                return today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();
            }
        },
        getChromeVersion: {
            configurable: false,
            writable: false,
            enumerable: false,
            value: function () {
                var arr = navigator.userAgent.split(' ');
                var chromeVersion = '';
                for (var i = 0; i < arr.length; i++) {
                    if (/chrome/i.test(arr[i]))
                        chromeVersion = arr[i]
                }
                if (chromeVersion) {
                    return Number(chromeVersion.split('/')[1].split('.')[0]);
                } else {
                    return 0;
                }
            }
        },
        getBrowserType: {
            configurable: false,
            writable: false,
            enumerable: false,
            value: function () {
                var userAgent = navigator.userAgent;
                var isOpera = userAgent.indexOf("Opera") > -1;
                if (isOpera)
                    return "Opera";
                if (userAgent.indexOf("Firefox") > -1)
                    return "FF";
                if (userAgent.indexOf("Chrome") > -1)
                    return "Chrome";
                if (userAgent.indexOf("Safari") > -1)
                    return "Safari";
                if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera)
                    return "IE";
            }
        },
        getUniqueId: {
            configurable: false,
            writable: false,
            enumerable: false,
            value: function () {
                return [(new Date().getTime()).toString(16)].concat((function () {
                    var record = Math.random() * sequences.map(function (x) {
                            return 1 / x;
                        }).reduce(function (x, y) {
                            return x + y;
                        }),
                        part = 0;
                    return (sequences = sequences.map(function (elem) {
                        part += 1 / elem;
                        if (!isNaN(part) && record < part) {
                            return part = NaN, ++elem;
                        }
                        return elem;
                    })).map(function (x) {
                        return x.toString(16);
                    });
                })()).concat([sessionId.toString(16)]).join('-');
            }
        },
        getRandomColor: {
            configurable: false,
            writable: false,
            enumerable: false,
            value: function () {
                var color = "#",
                    hexs = hexstr.split("");
                for (var i = 0; i < 6; ++i) {
                    color += hexs[parseInt(Math.random() * hexs.length)];
                }
                return color;
            }
        }
    });

    return __initer__;
})();