class MinHump{
    constructor() {
        "use strict"
        var hump = [];

        function swap(i, j) {
            let cache = hump[i];
            hump[i] = hump[j];
            hump[j] = cache;
        }

        function percolateUp(i) {
            while (i > 0) {
                let j = parseInt((i - 1) / 2);
                if (hump[i].k < hump[j].k) {
                    swap(i, i = j);
                } else {
                    break;
                }
            }
        }

        function percolateDown(i) {
            var j = 0;
            while (i < hump.length) {
                if ((j = 2 * i + 1) < hump.length && hump[i].k > hump[j].k) {
                    swap(i, i = j);
                } else if ((j = 2 * i + 2) < hump.length && hump[i].k > hump[j].k) {
                    swap(i, i = j);
                } else {
                    break;
                }
            }
        }

        this.inserts = (list) => {
            for(let i=0; i < list.length; ++i) {
                this.insert(list[i]);
            }
        };

        this.insert = (e) => {
            if (!isNaN(parseFloat(e.k))) {
                hump.push(e);
                percolateUp(hump.length - 1);
            }
        };

        this.removeTop = () => {
            let val = hump[0];
            hump[0] = hump[hump.length - 1];
            hump.pop();
            percolateDown(0);
            return val;
        };

        this.getByValue = (callback) => {
            return callback(hump);
        }

        this.clear = () => {
            hump = [];
        };

        this.isEmpty = () => !hump.length;

        this.toString = () => hump.map((x) => x.k).join(",");
    }
}