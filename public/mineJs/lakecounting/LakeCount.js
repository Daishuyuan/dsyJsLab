/**
 * get count of lakes(POJ2386)
 * 
 * @param matrix lake blocks
 * @param n row number
 * @param m col number
 * @param eDirSwitch true is opening the search of eight direction 
 */
function LakeCount(matrix, n, m, eDirSwitch) {
    function DFS(x, y) {
        if (x < 0 || x >= m || y < 0 || y >= n) {
            return false;
        } else if (matrix[x][y] > 0) {
            matrix[x][y] = 0;
            // extend eight direction searching
            if (eDirSwitch) {
                DFS(x - 1, y - 1);
                DFS(x - 1, y + 1);
                DFS(x + 1, y + 1);
                DFS(x + 1, y - 1);
            }
            // four direction searching
            DFS(x, y + 1);
            DFS(x, y - 1);
            DFS(x - 1, y);
            DFS(x + 1, y);
            return true;
        }
        return false;
    }

    var count = 0;
    for (var i = 0; i <= n; ++i) {
        for (var j = 0; j <= m; ++j) {
            if(DFS(i,j)) count++;
        }
    }
    
    return count;
}