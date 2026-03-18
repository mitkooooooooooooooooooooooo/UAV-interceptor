export class FSM {
    constructor(initialState) {
        this.state = initialState;
        this.transitions = {};
    }

    addState(name, { update, transitions }) {
        this.transitions[name] = { update, transitions };
    }

    update(entity, player) {
        const currentState = this.transitions[this.state];
        if (currentState) {
            currentState.update(entity, player);
            for (let nextState in currentState.transitions) {
                if (currentState.transitions[nextState](entity, player)) {
                    this.state = nextState;
                    break;
                }
            }
        }
    }
}