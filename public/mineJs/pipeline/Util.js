var Util = (function() {
    

    return {
        lglt2xyz: function lglt2xyz(longitude, latitude, radius) {
            var lg = degToRad(longitude),
                lt = degToRad(latitude);
            var y = radius * Math.sin(lt);
            var temp = radius * Math.cos(lt);
            var x = temp * Math.sin(lg);
            var z = temp * Math.cos(lg);
            return {
                x: x,
                y: y,
                z: z
            }
        }
    };
})();