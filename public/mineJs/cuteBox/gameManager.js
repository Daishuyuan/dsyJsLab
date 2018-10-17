function InfoPanel(id) {
    var logger = document.getElementById(id);
    this.log = function (info) {
        logger.value = logger.value + "\n" + info;
        logger.scrollTop = logger.scrollHeight;
    }
}

function GameManager(row, col, canvasEvirId, loggerId) {
    const size = 30;
    const MAX_REWARDS = 1000;
    const MAX_PANISH = -500;
    const NOR_PANISH = -2.5;
    var rewardsMatrix = [],
        max_size_reward = 1,
        max_size_panish = 1;
    this.matrix = new PainterMatrix(canvasEvirId, row, col, size);
    this.logger = new InfoPanel(loggerId);
    this.actions = [{
        x: 0,
        y: 1
    }, {
        x: 1,
        y: 0
    }, {
        x: -1,
        y: 0
    }, {
        x: 0,
        y: -1
    }];
    this.roleColor = "#FF0000";
    this.barrierColor = "#000000";
    this.finalColor = "#0000FF";
    this.timerId = NaN;
    this.interval = 10;
    this.count = 0;
    this.startPoint = 1;
    this.barrierPoint = 2;
    this.endPoint = 3;
    this.trainCount = 100;
    this.showPanel = null;
    this.rewardSign = false;

    this.setSpeed = function (speed) {
        this.interval = speed;
    }

    this.setCount = function (num) {
        this.trainCount = num;
    }

    this.init = function () {
        let self = this;
        this.switchLearning(false);
        this.logger.log(self.speeking("Please set the starting position!"));
        this.matrix.mouseConfigure(self.startPoint, self.roleColor, function () {
            self.logger.log(self.speeking("The starting point is set!"));
            self.logger.log(self.speeking("Please set the obstacle position! Type Enter to end."));
            self.matrix.mouseConfigure(self.barrierPoint, self.barrierColor, function () {
                self.logger.log(self.speeking("Obstacles are set up!"));
                self.logger.log(self.speeking("Please set the end position!"));
                self.matrix.mouseConfigure(self.endPoint, self.finalColor, function () {
                    self.logger.log("The end is set!");
                    self.speeking("The end is set! start running!");
                    self.count = 0;
                    self.run(self.trainCount);
                });
            }, true);
        });
        for (let i = 0; i < row; ++i) {
            let line = [];
            line.length = col;
            line.fill(0);
            rewardsMatrix.push(line);
        }
    }

    this.speeking = function (msg) {
        try {
            if (!this.noSpeeking) {
                window.speechSynthesis.speak(new window.SpeechSynthesisUtterance(msg));
            }
        } catch (e) {
            console.log(e);
        }
        return msg;
    }

    this.deOber = function (observation) {
        let strs = observation.split(",");
        return [parseInt(strs[0]), parseInt(strs[1])];
    }

    this.getActionId = function (action) {
        for (let i = 0; i < this.actions.length; ++i) {
            if (this.actions[i].x == action.x && this.actions[i].y == action.y) {
                return i;
            }
        }
    }

    this.switchLearning = function (useQLearning) {
        if (useQLearning) {
            this.learnTable = new QLearningTable(this.actions, 0.1, 0.9, 0.95);
        } else {
            this.learnTable = new SarsaLamdaTable(this.actions, 0.1, 0.9, 0.95);
        }
    }

    this.setRewardsPanel = function (id) {
        if (!this.showPanel) {
            this.showPanel = new PainterMatrix(id, row, col, size);
        }
    }

    this.fillColor = function (ostr, num) {
        for (var i = ostr.length; i < num; ++i) {
            ostr = "0" + ostr;
        }
        return "#" + ostr;
    }

    this.showDataInPanel = function (table) {
        if (this.showPanel) {
            let maxValue = 0,
                color = 0;
            for (let i = 0; i < row; ++i) {
                for (let j = 0; j < col; ++j) {
                    let value = 0;
                    for (let elem in table) {
                        if (elem != 'terminal') {
                            let [x, y] = this.deOber(elem);
                            for (let k = 0; k < this.actions.length; ++k) {
                                let action = this.actions[k];
                                if (x + action.x == i && y + action.y == j) {
                                    value += table[elem][k] && !isNaN(table[elem][k]) ? table[elem][k] : 0;
                                }
                            }
                        }
                    }
                    rewardsMatrix[i][j] = value;
                    // self-adaptive colormap
                    if (value > 0) {
                        max_size_reward = Math.max(max_size_reward, value);
                        color = parseInt(Math.min(value / (max_size_reward), 1) * 0xaa + 0x55);
                        color = 0xffffff - ((color << 8) | color);
                    } else {
                        value = Math.abs(value);
                        max_size_panish = Math.max(max_size_panish, value);
                        color = parseInt(Math.min(value / (max_size_panish), 1) * 0xdd + 0x22);
                        color = 0xffffff - ((color << 16) | (color << 8));
                    }
                    this.showPanel.drawBlock(i, j, this.fillColor(color.toString(16), 6));
                }
            }
        }
    }

    this.run = function (num) {
        let self = this;
        self.matrix.repainter();
        if (num) {
            let start = self.matrix.getSpecial(1)[0];
            let end = self.matrix.getSpecial(3)[0];
            let observation = start.x + "," + start.y;
            let action = self.learnTable.choose_action(observation);
            self.timerId = setTimeout(function innerCall() {
                let x, y, x_, y_, code, reward, done, observation_, cache, action_;
                [x, y] = self.deOber(observation);
                [x_, y_, code] = self.matrix.step(x, y, action, self.roleColor);
                observation_ = x_ + "," + y_;
                if (code == self.endPoint) {
                    reward = MAX_REWARDS;
                    observation_ = 'terminal';
                    self.logger.log("oh! find a gift: " + (self.trainCount - num + 1) + " / " + self.trainCount);
                    self.count++;
                    done = true;
                } else if (code == self.barrierPoint || isNaN(code)) {
                    reward = MAX_PANISH;
                    observation_ = 'terminal';
                    self.logger.log("god! no harvest: " + (self.trainCount - num + 1) + " / " + self.trainCount);
                    done = true;
                } else {
                    reward = NOR_PANISH;
                    done = false;
                }
                action_ = self.learnTable.choose_action(observation_);
                self.learnTable.learn(observation, self.getActionId(action), reward, observation_, self.getActionId(action_));
                self.showDataInPanel(self.learnTable.get_state_table());
                observation = observation_;
                action = action_;
                if (done) {
                    clearInterval(self.timerId);
                    self.run(num - 1);
                } else {
                    self.timerId = setTimeout(innerCall, self.interval);
                }
            }, self.interval);
        } else {
            self.logger.log(self.speeking("I have found " + this.count + " goals."));
            if (this.count > (this.trainCount / 2) | 0) {
                self.speeking("Come to praise me!");
            } else {
                self.speeking("I am sad!");
            }
        }
    }
}