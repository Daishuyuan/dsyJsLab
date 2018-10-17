/**
 * split ip address with no points
 *  
 * @param ipAddress ip address
 */
function IPSplit(ipAddress) {
    let mStr = /^[1-9][0-9]*$/,
        res = [],
        rp = [];

    // check content is illegal
    function check(content) {
        return (mStr.test(content) || content == "0") && parseInt(content) <= 255;
    }

    // dynamic programming search
    function DPS(address, p) {
        if (p >= address.length) {
            // res must be legal
            if (res.length === 4) {
                rp.push(res.join('.'));
            }
        } else {
            for (let i = 1; i <= 3; ++i) {
                if (p + i <= address.length) {
                    let str = address.slice(p, p + i);
                    // str may be correct answer
                    res.push(str);
                    // str is valid then DFS search next result
                    if (check(str)) DPS(address, p + i);
                    // res run pop in every recursion to front layer
                    res.pop();
                }
            }
        }
    }

    // start alogrithm
    DPS(ipAddress, 0);
    return rp;
}