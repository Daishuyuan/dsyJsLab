(function () {
    function fillArray(array, callback) {
        for (var i = 0; i < array.length; ++i) {
            array[i] = callback(array[i]);
        }
    }

    function getMaxInArray(array) {
        var maxId = NaN,
            maxV = -Infinity;
        for (var i = 0; i < array.length; ++i) {
            if (maxV < array[i]) {
                maxV = array[i];
                maxId = i;
            }
        }
        return [maxId, maxV];
    }

    function getSum(array) {
        return array.reduce(function (a, b) {
            return a + b;
        });
    }

    Array.prototype.argmax = function () {
        return getMaxInArray(this)[0];
    };
    Array.prototype.max = function () {
        return getMaxInArray(this)[1];
    };
    Array.prototype.sum = function () {
        return getSum(this);
    };
    Array.prototype.average = function () {
        return getSum(this) / this.length;
    };
    Array.prototype.decentralize = function () {
        var avg = getSum(this) / this.length;
        return this.map(function (num) {
            return num - avg;
        });
    };
    Array.prototype.fillArr = function (length, value) {
        length = length || 0;
        value = value || 0;
        if (!isNaN(length) && !isNaN(value)) {
            this.length = length;
            fillArray(this, function (oldValue) {
                return oldValue === undefined ? value : oldValue;
            });
        }
        return this;
    };
    Array.prototype.rand = function (min, max) {
        min = min || 0;
        max = max || 0;
        if (!isNaN(min) && !isNaN(max) && min < max) {
            fillArray(this, function () {
                return Math.random() * (max - min) + min;
            });
        }
        return this;
    };
    Array.prototype.swap = function (front, back) {
        front = parseInt(front || 0);
        back = parseInt(back || 0);
        if (!isNaN(front) &&
            !isNaN(back) &&
            front >= 0 &&
            front < this.length &&
            back >= 0 &&
            back < this.length) {
            var cache = this[front];
            this[front] = this[back];
            this[back] = cache;
            return true;
        }
        return false;
    };
    Array.prototype.shuffle = function () {
        if (this.length > 1) {
            var washNum = parseInt(3 * Math.log2(this.length / 2));
            var varientLen = (0 === this.length % 2 ? this.length + 1 : this.length);
            for (var i = 0; i < washNum; ++i) {
                var cache = this.slice(0);
                this.length = 0;
                // ascending shuffle
                for (var j = 0; j < cache.length; ++j) {
                    this[(2 * j + 1) % varientLen] = cache[j];
                }
                // solve the problem of shuffle invariability in odd length
                this.swap(0, this.length - 1);
            }
        }
        return this;
    };
    Array.prototype.deal = function (size) {
        size = parseInt(size || 0);
        if (!isNaN(size)) {
            if (size == 0) {
                return [];
            } else if (this.length > size) {
                var cache = this.slice(0);
                this.length = 0;
                for (var dif = cache.length - size; dif > 0; --dif) {
                    var n = parseInt(Math.random() * cache.length);
                    // save remain cards
                    this.push(cache[n]);
                    // remove the no.n card
                    for (var j = n + 1; j < cache.length; ++j) {
                        cache[j - 1] = cache[j];
                    }
                    cache.pop();
                }
                return cache;
            }
        }
        return this;
    }
})();