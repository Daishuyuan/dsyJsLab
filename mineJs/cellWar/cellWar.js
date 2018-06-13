class Learning {
    constructor() {
        this.cache = 0; // cache
        this.lamada = 20; // how many steps to learn
        this.opacity = 10; // the capacity of status
        this.actions = []; // action list
        this.nowAction = null; // now action
        this.exploration = 0.15; // exploration rate
        this.r = 0.35; // discount future rewards ratio
        this.a = 0.04; // learning rate
        this.destoryCost = 5; // this cost which one is destoryed
        this.R = []; // steps list
        this.innerRL = null; // Q-RL
    }

    compelete() {
        let actionIds = this.actions.map(function(action) {
            return action.id;
        });
        this.innerRL = new QLearningTable(actionIds, this.a, this.r, (1 - this.exploration));
    }

    getActionInfo() {
        let builder = [], RLtable = this.innerRL.get_state_table(), actReward = [];
        for (let i=0; i < this.actions.length; ++i) {
            let sum = 0;
            for (let row in RLtable) {
                sum += RLtable[row][i];
            }
            actReward.push(parseFloat(sum.toFixed(2)));
        }
        for (let action of this.actions) {
            builder.push(action.name + " --- " + actReward[action.id]);
        }
        return builder.join(',');
    }

    getAction(energy, number) {
        this.nowAction = this.actions[this.innerRL.choose_action(number)];

        if ((this.cache++) >= this.lamada) {
            this.cache = 0;
            this.R.push({
                action: null,
                state: 'terminal',
                reward: 0
            });
            for (let i=1; i < this.R.length; ++i) {
                let nowBe = this.R[i],
                    oldBe = this.R[i-1];
                this.innerRL.learn(oldBe.state, oldBe.action.id, (nowBe.reward - oldBe.reward), nowBe.state);
            }
            this.R = [];
        } else {
            this.nowAction.count++;
            this.R.push({
                action: this.nowAction,
                state: number,
                reward: this.oldScore = energy
            });
            if (this.R.length > this.opacity) {
                this.R.shift();
            }
        }

        return this.nowAction.behavior;
    }

    addAction(actionName, func) {
        this.actions.push({
            id: this.actions.length,
            name: actionName,
            behavior: func
        });
    }
}