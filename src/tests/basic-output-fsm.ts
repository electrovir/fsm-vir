import {ActionOrder, createStateMachine} from '../state-machine-runner';

enum BasicOutputState {
    Start = 'start',
    DoStuff = 'do-stuff',
    End = 'end',
}

export const basicOutputMachine = createStateMachine({
    performStateAction(currentState, input: string, lastOutput: Readonly<string[]>) {
        if (input === 'action error') {
            // for testing
            throw new Error('intentionally throw error in performStateAction');
        }
        if (currentState === BasicOutputState.DoStuff) {
            return lastOutput.concat(input);
        }
        return lastOutput;
    },
    calculateNextState(currentState, input) {
        if (input === 'state error') {
            // for testing
            throw new Error('intentionally throw error in calculateNextState');
        } else if (input) {
            return BasicOutputState.DoStuff;
        }
        return BasicOutputState.End;
    },
    initialState: BasicOutputState.Start,
    initialOutput: [],
    endState: BasicOutputState.End,
    actionStateOrder: ActionOrder.After,
});
