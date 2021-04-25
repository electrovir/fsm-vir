import {ActionOrder, createStateMachine} from '../state-machine-runner';

enum BasicOutputState {
    Start = 'start',
    DoStuff = 'do-stuff',
    End = 'end',
}

export const objectReaderMachine = createStateMachine({
    performStateAction(currentState, input: {stuff: string}, lastOutput: Readonly<string[]>) {
        if (input.stuff === 'action error') {
            // for testing
            throw new Error('intentionally throw error in performStateAction');
        }
        if (currentState === BasicOutputState.DoStuff) {
            return lastOutput.concat(input.stuff);
        }
        return lastOutput;
    },
    calculateNextState(currentState, input) {
        if (input.stuff === 'state error') {
            // for testing
            throw new Error('intentionally throw error in calculateNextState');
        } else if (input.stuff) {
            return BasicOutputState.DoStuff;
        }
        return BasicOutputState.End;
    },
    initialState: BasicOutputState.Start,
    initialOutput: [],
    endState: BasicOutputState.End,
    actionStateOrder: ActionOrder.After,
});
