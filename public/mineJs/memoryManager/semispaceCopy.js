class Block {
    constructor(start, size, next) {
        this.alive = true;
        this.start = start;
        this.size = size;
        this.next = next;
        this.description = function () {
            return {
                begin: "0x" + start.toString(16),
                size: size,
                alive: this.alive
            }
        }
    }
}

class SemispaceEmulation {
    constructor(start, end) {
        console.assert(end > start);
        var extent = (end - start) / 2,
            tospace = start,
            top = start + extent,
            fromspace = top,
            free = tospace,
            workList = null,
            current = null;

        function flip() { // turnover semispace
            fromspace = tospace, tospace = fromspace;
            top = tospace + extent;
            free = tospace;
        }

        this.allocate = function (size) { // allocate blocks
            let result = free,
                newfree = result + size;
            if (newfree > top)
                return null;
            free = newfree;
            let block = new Block(result, size, null);
            current ? (current.next = block, current = block) : workList = current = block;
            return workList;
        }

        this.collect = function () {
            flip();
            
        }
    }
}