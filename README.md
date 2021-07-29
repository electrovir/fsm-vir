[![tests](https://github.com/electrovir/fsm-vir/actions/workflows/tests.yml/badge.svg?branch=master)](https://github.com/electrovir/fsm-vir/actions/workflows/tests.yml)

# fsm-vir

The heroic finite state machine package. Has zero dependencies! Can be used to quickly create Mealy or Moore finite state machines.

# Usage

## Install

This package is available [via npm](https://www.npmjs.com/package/fsm-vir):

```bash
npm i fsm-vir
```

## Example

```typescript
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
```

## Details

For more details, see the [type definitions](https://github.com/electrovir/fsm-vir/blob/master/src/state-machine-types.ts) which are well documented.
