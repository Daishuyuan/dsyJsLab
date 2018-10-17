function findCenter(matrix, row, col) {
    let edgeList = [], dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (let i = 0; i < row; ++i) {
        for (let j = 0; j < col; ++j) {
            for (let k = 0; k < dirs.length; ++k) {
                if (matrix[i][j] == 1) {
                    let x = dirs[k][0] + i,
                        y = dirs[k][1] + j;
                    if (x >= 0 && x < row && y >= 0 && y < col) {
                        if (matrix[x][y] == 0) {
                            edgeList.push({
                                id: edgeList.length,
                                x: x,
                                y: y
                            });
                            break;
                        }
                    }
                }
            }
        }
    }
    edgeList = edgeList.filter(x => x.id & 1 != 0).map(e => [e.x, e.y]);
    for (let i = 0; i < edgeList.length * 2; ++i) {
        edgeList = edgeList.sort(() => Math.random() < 0.5 ? -1 : 1);
        let x1 = edgeList[0][0],
            y1 = edgeList[0][1],
            x2 = edgeList[1][0],
            y2 = edgeList[1][1],
            x3 = edgeList[2][0],
            y3 = edgeList[2][1];
        if (y2 - y1 != 0 && y3 - y2 != 0) {
            let half_x1_x2 = (x1 + x2) / 2,
                half_y1_y2 = (y1 + y2) / 2,
                half_x2_x3 = (x2 + x3) / 2,
                half_y2_y3 = (y2 + y3) / 2,
                k1 = (x1 - x2) / (y2 - y1),
                k2 = (x2 - x3) / (y3 - y2),
                b1 = (half_y1_y2 - k1 * half_x1_x2),
                b2 = (half_y2_y3 - k2 * half_x2_x3),
                xp = (b2 - b1) / (k1 - k2),
                yp = k1 * xp + b1;
            return [Math.round(xp), Math.round(yp)];
        }
    }
}

function createCircle(w, h) {
    let matrix = [];
    let x1 = (Math.random() * w * 0xff) & 0xffffffff;
    let y1 = (Math.random() * h * 0xff) & 0xffffffff;
    let x2 = (Math.random() * w * 0xff) & 0xffffffff;
    let y2 = (Math.random() * h * 0xff) & 0xffffffff;
    let d = (Math.random() * 0xffffffff) & 0xffff;
    let dp = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    let rad = d <= dp? dp / 2: d / 2;
    let x0 = (x1 + x2) / 2;
    let y0 = (y1 + y2) / 2;
    if (d > dp) {
        let k = (x2 - x1) / (y1 - y2);
        let a = (k ** 2 + 1);
        let b = 2 * (k - k ** 2 * x0 - x1);
        let c = x1 ** 2 + (k ** 2) * (x0 ** 2) - 2 * k * x0 + (y0 - y1) ** 2 - rad ** 2;
        let sign = Math.random() > 0.5? 1: -1;
        let delta = b ** 2 - 4 * a * c;
        if (delta > 0) {
            x0 = (-b + sign * Math.sqrt(delta)) / (2 * a);
            y0 = k * (x0 - (x1 + x2) / 2) + (y1 + y2) / 2;
        } else {
            rad = dp / 2;
        }
    }
    for (let i=0; i < h; ++i) {
        let row = [];
        for (let j=0; j < w; ++j) {
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