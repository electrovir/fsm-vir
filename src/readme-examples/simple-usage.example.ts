import {runFsm} from '../index.js';

runFsm({
    /** The initial state of the state machine. */
    initState: 'start',
    /** Any iterable of values to process. */
    inputs: [
        'a',
        'b',
        'c',
        'd',
        'e',
    ],
    /** Calculate the next state for the current input. */
    nextState({input}) {
        if (input === 'b') {
            return {
                /** Return `nextState` to update the current state to a new value. */
                nextState: 'next',
            };
        } else if (input === 'd') {
            return {
                /** Return `stop: true` to halt input processing and the state machine as a whole. */
                stop: true,
            };
        } else {
            /** Return `undefined` to not perform any state updates. */
            return undefined;
        }
    },
    /** Optionally perform actions for each processed input. */
    actions: {
        preNextState({input, state}) {
            /** Do some action here before the next state is calculated. */
        },
        postNextState({input, state}) {
            /** Do some action here after the next state is calculated. */
        },
    },
});
