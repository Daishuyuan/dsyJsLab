function CalCircle() {
    this.sel_points = [];

    this.find = (matrix, row, col) => {
        let edgeList = [],
            dirs = [
                [0, 1],
                [0, -1],
                [1, 0],
                [-1, 0]
            ];
        for (let i = 0; i < row; ++i) {
            for (let j = 0; j < col; ++j) {
                for (let k = 0; k < dirs.length; ++k) {
                    if (matrix[i][j] == 1) {
                        let x = dirs[k][0] + i,
                            y = dirs[k][1] + j;
                        if (x >= 0 && x < row && y >= 0 && y < col && matrix[x][y] == 0) {
                            edgeList.push([i, j]);
                            break;
                        }
                    }
                }
            }
        }
        if (edgeList.length >= 3) {
            let diss = [],
                p1 = edgeList[parseInt(Math.random() * edgeList.length)];
            for (let i = 1; i < edgeList.length; ++i) {
                let p2 = edgeList[i];
                diss.push({
                    pos: p2,
                    dis: Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2)
                });
            }
            diss = diss.sort((x, y) => x.dis - y.dis);
            let m1 = p1,
                m2 = diss.map((x) => {
                    return {
                        pos: x.pos,
                        dis: Math.abs(x.dis - diss[diss.length - 1].dis * 0.618)
                    };
                }).sort((x, y) => x.dis - y.dis)[0].pos,
                m3 = diss[diss.length - 1].pos,
                x1 = m1[0],
                y1 = m1[1],
                x2 = m2[0],
                y2 = m2[1],
                x3 = m3[0],
                y3 = m3[1];
            this.sel_points = [m1, m2, m3];
            let x12 = (x1 + x2) / 2,
                y12 = (y1 + y2) / 2,
                x23 = (x2 + x3) / 2,
                y23 = (y2 + y3) / 2,
                k1 = (x1 - x2) / (y2 - y1 + 0.001),
                k2 = (x2 - x3) / (y3 - y2 + 0.001),
                xp = (k1 * x12 - k2 * x23 + y23 - y12) / (k1 - k2 + 0.001),
                yp = (k1 * (xp - x12) + y12 + k2 * (xp - x23) + y23) / 2;
            return [Math.round(xp), Math.round(yp)];
        }
        return [null, null];
    }

    this.generate = (w, h) => {
        let matrix = [];
        let x1 = (Math.random() * w * 0xff) & 0xffffffff;
        let y1 = (Math.random() * h * 0xff) & 0xffffffff;
        let x2 = (Math.random() * w * 0xff) & 0xffffffff;
        let y2 = (Math.random() * h * 0xff) & 0xffffffff;
        let d = (Math.random() * 0xffffffff) & 0xffff;
        let dp = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
        let rad = d <= dp ? dp / 2 : d / 2;
        let x0 = (x1 + x2) / 2;
        let y0 = (y1 + y2) / 2;
        if (d > dp) {
            let k = (x2 - x1) / (y1 - y2);
            let a = (k ** 2 + 1);
            let b = 2 * (k - k ** 2 * x0 - x1);
            let c = x1 ** 2 + (k ** 2) * (x0 ** 2) - 2 * k * x0 + (y0 - y1) ** 2 - rad ** 2;
            let sign = Math.random() > 0.5 ? 1 : -1;
            let delta = b ** 2 - 4 * a * c;
            if (delta >= 0) {
                x0 = (-b + sign * Math.sqrt(delta)) / (2 * a);
                y0 = k * (x0 - (x1 + x2) / 2) + (y1 + y2) / 2;
            } else {
                rad = dp / 2;
            }
        }
        for (let i = 0; i < h; ++i) {
            let row = [];
            for (let j = 0; j < w; ++j) {
                if (Math.sqrt((j * 0xff - x0) ** 2 + (i * 0xff - y0) ** 2) <= rad) {
                    row.push(1);
                } else {
                    row.push(0);
                }
            }
            matrix.push(row);
        }
        return matrix;
    }
}