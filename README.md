# fsm-vir

The heroic finite state machine package. Can be used to quickly create Mealy or Moore finite state machines.

## Install

```sh
npm i fsm-vir
```

## Usage

Full type docs are here: https://electrovir.github.io/fsm-vir
Here's an example usage:

<!-- example-link: src/readme-examples/simple-usage.example.ts -->

```TypeScript
import {createStateMachine} from 'fsm-vir';

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
    'Random Winston',
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
```
