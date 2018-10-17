function FindWay(matrix, row, col) {
    var vList = {},
        path = {},
        res = [],
        sum = 0;
    for (let i = 0; i < row; ++i) {
        for (let j = 0; j < col; ++j) {
            vList[`${i}-${j}`] = {
                k: i == 0 && j == 0 ? matrix[i][j] : Infinity,
                v: [i, j]
            };
        }
    }

    function isEmpty() {
        for (let name in vList) {
            if (name) {
                return false;
            }
        }
        return true;
    }

    function update(x, y, val) {
        var node = vList[`${x}-${y}`];
        if (node && val < node.k) {
            node.k = val;
        }
    }

    function extractMin() {
        let min = Infinity,
            node = null,
            cache = null;
        for (let name in vList) {
            let cn = vList[name];
            if (cn.k < min) {
                min = cn.k;
                node = {
                    k: cn.k,
                    v: cn.v
                };
                cache = name;
            }
        }
        delete vList[cache];
        return node;
    }

    while (!isEmpty()) {
        let node = extractMin();
        if (node) {
            let k = node.k,
                x = node.v[0],
                y = node.v[1];
            path[node.v.join("-")] = node;
            if (x + 1 < row) {
                update(x + 1, y, matrix[x + 1][y] + k);
            }
            if (y + 1 < col) {
                update(x, y + 1, matrix[x][y + 1] + k);
            }
        }
    }

    // find answer in path
    let p = path[`${row - 1}-${col - 1}`];
    while (p) {
        res.push(p.v.join(","));
        let x = p.v[0],
            y = p.v[1],
            node1 = null,
            node2 = null;
        sum += matrix[x][y];
        if (x - 1 >= 0) {
            node1 = path[`${x-1}-${y}`];
        }
        if (y - 1 >= 0) {
            node2 = path[`${x}-${y-1}`];
        }
        if (node1 && node2) {
            if (node1.k < node2.k) {
                p = node1;
            } else {
                p = node2;
            }
        } else if (node1) {
            p = node1;
        } else if (node2) {
            p = node2;
        } else {
            p = null;
        }
    }

    return [res.reverse(), sum];
}