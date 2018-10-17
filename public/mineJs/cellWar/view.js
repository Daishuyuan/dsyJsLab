class CellWar {
    constructor(envirId, row, col, size) {
        var self = this;
        this.cellArray = [];
        this.row = row;
        this.col = col;
        this.size = size;
        this.days = 0;
        this.space = 5;
        this.before = 0;
        this.environment = [];

        // configurable Start
        this.directions = [{
            x: 1,
            y: 0
        }, {
            x: 0,
            y: -1
        }, {
            x: -1,
            y: 0
        }, {
            x: 0,
            y: 1
        }, {
            x: 1,
            y: 1
        }, {
            x: -1,
            y: -1
        }, {
            x: 1,
            y: -1
        }, {
            x: -1,
            y: 1
        }];
        // this.directions = [{x:1,y:0},{x:0,y:-1},{x:-1,y:0},{x:0,y:1}];

        // params in game
        this.fightStrategyCost = 5;
        this.scheduleCost = 3;
        this.pregnentEnergy = 2;
        this.civilSpend = 1;
        this.envirResource = 8;
        this.lastResource = 2;
        this.belief = 5;
        this.technicalBarrier = 3;
        this.rate = 1.2;
        this.technical = [{
                name: "god save world",
                need: 2,
                rate: 0.001
            },
            {
                name: "primitive communes",
                need: 5,
                rate: 0.005
            },
            {
                name: "slave society",
                need: 7,
                rate: 0.05
            },
            {
                name: "feudal society",
                need: 9,
                rate: 0.1
            },
            {
                name: "modern society ",
                need: Infinity,
                rate: 0.2
            }
        ];

        this.deadColor = "#AAAAAA";
        this.canvas = document.getElementById(envirId);
        this.context = this.canvas.getContext("2d");
        this.canvas.width = (col * (size + this.space));
        this.canvas.height = (row * (size + this.space));
        // configurable End

        this.drawCell = function (x, y, size, color, cell) {
            self.context.fillStyle = color;
            self.context.fillRect(x * (size + self.space), y * (size + self.space), size, size);

            if (cell && this.ok.alive(cell)) {
                self.context.fillStyle = "#000000";
                self.context.font = "10px Georgia";
                self.context.fillText(cell.id, x * (size + self.space) + size / 3, y * (size + self.space) + size / 2, size / 2);
            }
        }
        this.ok = {
            position: function (x, y) {
                return x >= 0 && y >= 0 && x < self.col && y < self.row
            },
            noHold: function (x, y) {
                return self.environment[x][y].hold < 0;
            },
            resource: function (x, y) {
                return self.environment[x][y].resource >= 1
            },
            noSame: function (x, y, array) {
                for (let point of array) {
                    if (point.x == x && point.y == y) {
                        return false;
                    }
                }
                return true;
            },
            alive: function (cell) {
                return cell.body.length > 0
            }
        }
        this.util = {
            removeId: function (array, id) {
                return array.slice(0, id).concat(array.slice(id + 1, array.length))
            },
            toOkPosition: function (x, y) {
                if (x >= 0 && y >= 0 && x < self.col && y < self.row) {
                    return {
                        x: x,
                        y: y
                    }
                } else {
                    let posX = x,
                        posY = y;
                    if (posX < 0) {
                        posX = self.col - 1;
                    } else if (posX == self.col) {
                        posX = 0;
                    }
                    if (posY < 0) {
                        posY = self.row - 1;
                    } else if (posY == self.row) {
                        posY = 0;
                    }
                    return {
                        x: posX,
                        y: posY
                    }
                }
            }
        }
        for (let i = 0; i < this.row; ++i) {
            let array = [];
            for (let j = 0; j < this.col; ++j) {
                this.drawCell(i, j, size, this.deadColor);
                array.push({
                    hold: -1,
                    civilLevel: 0,
                    resource: parseInt(this.envirResource * Math.random() + this.lastResource)
                });
            }
            this.environment.push(array);
        }
    }

    /**
     * techical resource calculation
     * 
     * @param {*} cell cellular unit
     */
    technicalResourceCal(cell) {
        let sum = 0;
        for (let site of cell.body) {
            let myLand = this.environment[site.x][site.y];
            sum += myLand.resource * this.technical[Math.min(myLand.civilLevel, this.technical.length - 1)].rate;
        }
        cell.energy += parseInt(sum);
    }

    /**
     * boundary resource calculation
     * 
     * @param {*} cell cellular unit
     */
    boundaryResourceCal(cell) {
        let memo = [];
        for (let block of cell.body) {
            for (let dir of this.directions) {
                let point = this.util.toOkPosition(block.x + dir.x, block.y + dir.y);
                if (this.ok.noHold(point.x, point.y)) {
                    if (this.ok.resource(point.x, point.y)) {
                        cell.energy++;
                        this.environment[point.x][point.y].resource--;
                        this.environment[block.x][block.y].resource++;
                    }
                }
                if (this.ok.noSame(point.x, point.y, memo)) {
                    memo.push({
                        x: point.x,
                        y: point.y
                    });
                }
            }
        }
        return memo;
    }

    /**
     * civils spend calculation
     * 
     * @param {*} cell cellular unit
     */
    civilsSpendCal(cell) {
        cell.energy -= parseInt(cell.body.length * cell.body.length * 0.1);
        if (cell.energy < 0) {
            let legacy = Math.abs(cell.energy);
            for (let k = 0; k < Math.min(legacy, cell.body.length); ++k) {
                let point = cell.body.pop();
                let land = this.environment[point.x][point.y];
                land.hold = -1;
                this.drawCell(point.x, point.y, this.size, this.deadColor);
            }
            cell.energy = 0;
        }
    }

    /**
     * destorying strategy
     * 
     * @param {*} memo configurable sites
     * @param {*} cell cellular unit
     */
    destoryStrategy(memo, cell) {
        if (cell.body.length > 1 && cell.energy >= this.destoryCost) {
            cell.energy -= this.destoryCost;
            let id = parseInt(Math.random() * cell.body.length);
            let site = cell.body[id];
            cell.body = this.util.removeId(cell.body, id);
            this.environment[site.x][site.y].hold = -1;
            this.drawCell(site.x, site.y, this.size, this.deadColor);
            cell.isAction = true;
        }
    }

    /**
     * borrowing strategy
     * 
     * @param {*} memo configurable sites
     * @param {*} cell cellular unit
     */
    borrowMoneyStrategy(memo, cell) {
        let lowR = 3;
        let loanNum = 0;
        for (let loan of cell.loans) {
            if (loan.prop === "pay" && loan.status) {
                let energy = parseInt(loan.money * Math.pow(loan.rate, (this.days - loan.start) / 30)) + 1;
                if (cell.energy >= energy) {
                    cell.energy -= energy;
                    loan.pay = energy;
                    loan.status = false;
                } else {
                    loanNum++;
                }
            }
        }
        if (loanNum <= this.belief) {
            let max = -1,
                target = null;
            for (let cellular of this.cellArray) {
                if (cellular.id !== cell.id && cellular.energy > max) {
                    if (cellular.energy > cellular.body.length * this.civilSpend * lowR) {
                        target = cellular;
                        max = cellular.energy;
                    }
                }
            }
            if (target && Math.random() > 0.5) {
                let cost = parseInt(target.body.length * this.civilSpend);
                cell.energy += cost;
                target.energy -= cost;
                cell.loans.push({
                    start: this.days,
                    status: true,
                    prop: "pay",
                    rate: this.rate,
                    money: cost
                });
                cell.isAction = true;
            }
        }
    }

    /**
     * raising technical strategy
     * 
     * @param {*} memo configurable sites
     * @param {*} cell cellular unit
     */
    raiseTechStrategy(memo, cell) {
        let site = cell.body[parseInt(cell.body.length * Math.random())];
        let level = this.environment[site.x][site.y].civilLevel;
        if (cell.energy >= this.technical[level].need) {
            cell.energy -= this.technical[level].need;
            this.environment[site.x][site.y].civilLevel++;
            cell.isAction = true;
        }
    }

    /**
     * use fighting strategy
     * 
     * @param {*} memo configurable sites
     * @param {*} cell cellular unit
     */
    fightStrategy(memo, cell) {
        if (cell.energy >= this.fightStrategyCost) {
            cell.energy -= this.fightStrategyCost;
            for (let k = 0; k < memo.length; ++k) {
                let site = memo[k];
                let land = this.environment[site.x][site.y];
                if (land.hold >= 0 && land.hold !== cell.id && cell.energy >= this.cellArray[land.hold].energy) {
                    if (this.technical[land.civilLevel].need != Infinity) {
                        // cost technical power
                        cell.energy -= this.technical[land.civilLevel].need * this.technicalBarrier;

                        // rob resource
                        let cost = parseInt(land.resource / 4);
                        cell.energy += cost;
                        land.resource -= cost;

                        // get city
                        cell.body.push({
                            x: site.x,
                            y: site.y
                        });

                        // army delete this city
                        for (let i = 0; i < this.cellArray[land.hold].body.length; ++i) {
                            let listland = this.cellArray[land.hold].body[i];
                            if (listland.x == site.x && listland.y == site.y) {
                                this.cellArray[land.hold].body = this.util.removeId(this.cellArray[land.hold].body, i);
                                break;
                            }
                        }

                        // draw my color
                        this.drawCell(site.x, site.y, this.size, cell.color, cell);
                        land.hold = cell.id;
                        memo = this.util.removeId(memo, k);

                        cell.isAction = true;
                    }
                }
            }
        }
    }

    /**
     * scheduling strategy
     * 
     * @param {*} memo configurable sites
     * @param {*} cell cellular unit
     */
    scheduleStrategy(memo, cell) {
        if (cell.energy >= this.scheduleCost && cell.body.length > 1) {
            cell.energy -= this.scheduleCost;
            let self = this;
            let lands = cell.body.sort(function (a, b) {
                return self.environment[a.x][a.y].resource - self.environment[b.x][b.y].resource;
            });
            let minLand = this.environment[lands[0].x][lands[0].y];
            let maxLand = this.environment[lands[lands.length - 1].x][lands[lands.length - 1].y];
            let resource = parseInt(maxLand.resource / 2);
            minLand.resource += resource;
            maxLand.resource -= resource;
            cell.isAction = true;
        }
    }

    /**
     * developing strategy
     * 
     * @param {*} memo configurable sites
     * @param {*} cell cellular unit
     */
    developStrategy(memo, cell) {
        let freeLand = [];
        for (let site of memo) {
            if (this.ok.noHold(site.x, site.y)) {
                freeLand.push(site);
            }
        }
        if (cell.energy >= this.pregnentEnergy && freeLand.length > 0) {
            let id = parseInt(freeLand.length * Math.random());
            let point = freeLand[id];
            cell.energy -= this.pregnentEnergy;
            cell.body.push(point);
            this.environment[point.x][point.y].hold = cell.id;
            this.drawCell(point.x, point.y, this.size, cell.color, cell);
            cell.isAction = true;
        }
    }

    debugInfo() {
        let infos = [],
            liveNum = 0;
        infos.push("---today: " + this.days + " day---");
        for (let cell of this.cellArray) {
            if (this.ok.alive(cell)) {
                let builder = [];
                builder.push("No." + cell.id);
                builder.push("energy: " + cell.energy);
                builder.push("lands: " + cell.body.length + "\n");
                builder = [builder.join('|')]
                builder.push(cell.learning.getActionInfo().split(',').join('\n'));
                infos.push(builder.join('|'));
                liveNum++;
            }
        }
        infos.push("alive num: " + liveNum);
        infos.push("--------");
        return infos.join('\n');
    }

    /**
     * cellular behaviors
     */
    runOnce() {
        this.days++;
        let i = this.before;
        do {
            let cell = this.cellArray[i];
            if (this.ok.alive(cell)) {
                cell.days++;
                // resource collection
                cell.oldEnergy = cell.energy;
                let memo = this.boundaryResourceCal(cell);
                this.technicalResourceCal(cell);

                // resource spend
                this.civilsSpendCal(cell);

                if (this.ok.alive(cell)) {
                    cell.learning.getAction(cell.energy, cell.body.length)(memo, cell);
                }
            }
            i++;
        } while ((i %= this.cellArray.length) != this.before);
        this.before = (this.before + 1) % this.cellArray.length;
    }

    init(num) {
        let self = this;
        let createLearning = function () {
            let learning = new Learning();
            learning.addAction("Deve", function (memo, cell) {
                self.developStrategy(memo, cell);
            });
            learning.addAction("Tech", function (memo, cell) {
                self.raiseTechStrategy(memo, cell);
            });
            learning.addAction("Sche", function (memo, cell) {
                self.scheduleStrategy(memo, cell);
            });
            learning.addAction("Batt", function (memo, cell) {
                self.fightStrategy(memo, cell);
            });
            learning.addAction("Borr", function (memo, cell) {
                self.borrowMoneyStrategy(memo, cell);
            });
            learning.addAction("Dest", function (memo, cell) {
                self.destoryStrategy(memo, cell);
            });
            learning.compelete();
            return learning;
        }
        if (num < this.row * this.col) {
            for (let i = 0; i < num; ++i) {
                let row = parseInt(Math.random() * this.row);
                let col = parseInt(Math.random() * this.col);
                let color = Initer.getRandomColor();
                let cell = {
                    id: i,
                    oldEnergy: 0,
                    energy: 0,
                    color: color,
                    size: 1,
                    body: [{
                        x: row,
                        y: col
                    }],
                    days: 0,
                    loans: [],
                    learning: createLearning(),
                    isAction: false
                };
                this.cellArray.push(cell);
                this.drawCell(row, col, this.size, color, cell);
                this.environment[row][col].hold = i;
            }
            this.live = this.cellArray.length;
        }
    }
}

(function() {
    $("#version").html(Initer.getChromeVersion() < 60 ||
    Initer.getBrowserType() !== "Chrome" ? "Maybe Not Support" : "Support");
    $("#today").html(Initer.getToday());
    $("#name").html(Initer.getName(68, 97, 118, 105, 100));

    var civillization = new CellWar("envir",20,20,20),
    timerId = NaN;

    window.initDrawing = function() {
        if (isNaN(timerId)) {
            civillization.init(parseInt(document.getElementById("member").value));
            document.getElementById("member").style.display = "none";
        }
        timerId = setInterval(function() {
            civillization.runOnce();
            log(civillization.debugInfo());
        }, 200);
        $("#halt").show(500);
        $("#start").hide();
        $("#viewPanel").show();
    }

    function log(info) {
        document.getElementById("logger").value = info;
    }

    window.haltDrawing = function() {
        clearInterval(timerId);
        $("#halt").hide();
        $("#start").show(500);
    };
})();
