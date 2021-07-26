import {createStateMachine} from '../state-machine-runner';

enum NoOutputState {
    Start = 'start',
    DoStuff = 'do-stuff',
    End = 'end',
}

/**
 * This is an awful paradigm, the state machine output should be used to count something like this.
 * This example is intended to be used as a test for machines without output.
 */
let runCount = 0;
export function getNoOutputStateMachineRunCount(): number {
    return runCount;
}

export const noOutputStateMachine = createStateMachine<NoOutputState, string, undefined>({
    performStateAction(state, _input: string, lastOutput) {
        if (state === NoOutputState.Start) {
            ++runCount;
        }
        return lastOutput;
    },
    calculateNextState(_currentState, _input) {
        return NoOutputState.End;
    },
    initialState: NoOutputState.Start,
    endState: NoOutputState.End,
});
