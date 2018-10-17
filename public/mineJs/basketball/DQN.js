// require js/tensorflow.js
// require mineJs/mathUtil/basic.js

class DoubleDQN {
    constructor(
        n_actions,
        n_features,
        learning_rate = 0.005,
        reward_decay = 0.9,
        e_greedy = 0.9,
        replace_target_iter = 200,
        memory_size = 3000,
        batch_size = 32,
        e_greedy_increment = null,
        output_graph = false,
        double_q = true,
        q_eval = null,
        q_next = null) {

        (function initializeDQN() {
            // ------------------ init params -----------------------
            var memoryStack = [],
                cost_his = [],
                Q = [],
                running_q = 0,
                n_ln = 20,
                w_initializer = tf.initializers.randomNormal({
                    mean: 0,
                    stddev: 0.3
                }),
                b_initializer = tf.initializers.constant({
                    value: 0.1
                }),
                q_eval = null,
                q_next = null;
            for (var func in this) {
                delete this[func];
            }

            function build_layers(model, inputs, middle) {
                // ----- relu(inputs * w1 + b1) -----
                model.add(tf.layers.dense({
                    inputShape: [inputs],
                    units: middle,
                    activation: 'relu',
                    kernelInitializer: w_initializer,
                    biasInitializer: b_initializer
                }));
                // ----- inputs * w2 + b2 -----
                model.add(tf.layers.dense({
                    units: n_actions,
                    activation: 'linear',
                    kernelInitializer: w_initializer,
                    biasInitializer: b_initializer
                }));
            }

            // ------------------ build evaluate_net ------------------
            if (q_eval == null) {
                q_eval = tf.sequential();
                build_layers(q_eval, n_features, n_ln);
                q_eval.compile({
                    optimizer: 'sgd',
                    loss: 'meanSquaredError'
                });
            }

            // ------------------ build target_net ------------------
            if (q_next == null) {
                q_next = tf.sequential();
                build_layers(q_next, n_features, n_ln);
            }

            // ------------------ support outer_function -------------
            Object.assign(this, {
                init: initializeDQN,
                learn: function () {
                    batch_memory = memoryStack.randCards(batch_size);

                    cost_his.push();
                },
                store_transition: function (s, a, r, s_) {
                    memoryStack.push({
                        status: s,
                        action_reward: [a, r],
                        next_status: s_
                    });
                    while (memoryStack.length >= memory_size) {
                        memoryStack.shift();
                    }
                },
                choose_action: function (observation) {
                    var action = 0;
                    if (Math.random() > e_greedy) {
                        action = parseInt(Math.random() * n_actions);
                    } else {
                        observation.fillArr(n_features, 0);
                        actions_value = q_eval.predict([observation]);
                        action = actions_value.argmax();
                        running_q = running_q * 0.99 + 0.01 * actions_value[action];
                        Q.push(running_q);
                    }
                    return action;
                }
            });
        })();
    }
}