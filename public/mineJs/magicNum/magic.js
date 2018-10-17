function check_magic_num(num) {
    let arr = [],
        sum = 0;
    while (num) {
        let chip = num % 10;
        arr.push(chip);
        sum += chip;
        num = parseInt(num / 10);
    }
    if ((sum & 1) === 0) {
        let req = sum / 2,
            ws = [{
                k: -1,
                v: 0
            }],
            i = 0;
        while (ws.length > 0) {
            let next = ws.pop();
            for (let i = next.k + 1; i < arr.length; ++i) {
                let top = ws[ws.length - 1],
                    save = arr[i] + (top ? top.v : 0);
                if (save === req) {
                    return true;
                } else if (save < req) {
                    ws.push({
                        k: i,
                        v: save
                    });
                }
            }
        }
    }
    return false;
}