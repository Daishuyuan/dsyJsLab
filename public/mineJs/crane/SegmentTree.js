function Crane(arrL) {
    // array of segments tree
    var _segments = [];

    // initialization of segment tree
    function __init__(idx, start, end) {
        let vx = 0,
            vy = 0;
        if (end - start == 1) {
            vy = arrL[start];
        } else {
            let chl = idx * 2 + 1,
                chr = idx * 2 + 2,
                mid = Math.floor((start + end) / 2);
            arguments.callee(chl, start, mid);
            arguments.callee(chr, mid, end);
            vy = _segments[chl].vy + _segments[chr].vy;
        }
        _segments[idx] = {
            vx: vx,
            vy: vy,
            start: start,
            end: end
        };
    }

    // postorder traversal
    function postTravel(idx, seg, angle) {
        let chl = idx * 2 + 1,
            chr = idx * 2 + 2,
            segment = _segments[idx];
        if (segment) {
            arguments.callee(chl, seg, angle);
            arguments.callee(chr, seg, angle);
            if (segment.end > seg) {
                if (_segments[chl] && _segments[chr]) {
                    segment.vx = _segments[chl].vx + _segments[chr].vx;
                    segment.vy = _segments[chl].vy + _segments[chr].vy;
                } else {
                    let norm = Math.sqrt(Math.pow(segment.vx, 2) + Math.pow(segment.vy, 2)),
                        degree = Math.atan2(segment.vy, segment.vx) - (angle / 180) * Math.PI;
                    segment.vx = norm * Math.cos(degree);
                    segment.vy = norm * Math.sin(degree);
                }
            }
        }
    }

    // public methods
    Object.assign(arguments.callee.prototype, {
        change: function (seg, angle) {
            var nodes = [];
            if (seg >= 0 && seg < arrL.length) {
                postTravel(0, seg, angle);
            }
            return nodes;
        },
        innerTree: function () {
            return _segments.slice(0);
        },
        search: function (start, end) {
            let travel = [0];
            while(travel.length > 0) {
                let idx = travel.pop(),
                    chl = 2 * idx + 1,
                    chr = 2 * idx + 2,
                    seg = _segments[idx];
                if (seg && 
                    seg.start == start && 
                    seg.end == end) {
                    return seg;
                }
                _segments[chr] && travel.push(chr);
                _segments[chl] && travel.push(chl);
            }
        },
        getRoot: function () {
            return [_segments[0].vx, _segments[0].vy];
        },
        toCopy: function () {
            return new Crane(arrL);
        }
    });

    __init__(0, 0, arrL.length);
}