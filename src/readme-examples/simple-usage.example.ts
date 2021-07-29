import {createStateMachine} from '..';

/** Finite states must be defined. */
enum MyState {
    Start = 'start',
    Middle = 'middle',
    End = 'end',
}

/** Define a state machine like so: */
const myStateMachine = createStateMachine<MyState, string, string>({
    performStateAction: (currentState, input, lastOutput) => {
        if (currentState === MyState.Middle) {
            return `This person likes ${input}.`;
        } else {
            return lastOutput;
        }
    },
    calculateNextState: (currentState, input) => {
        if (currentState === MyState.Start && input.endsWith('likes')) {
            return MyState.Middle;
        } else if (currentState === MyState.Middle) {
            return MyState.End;
        } else {
            return currentState;
        }
    },
    initialState: MyState.Start,
    endState: MyState.End,
});

/** Run the state machine with a set of inputs */
const result = myStateMachine.runMachine([
    'person name',
    'Rando Winston',
    'person hair color',
    'brown',
    'person likes',
    'birthday cake',
    'person eye color',
    'brown',
    'person ear size',
    'small',
]);

console.log(result.output);
// This person likes birthday cake.
