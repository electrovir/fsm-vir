import {createStateMachine} from '../state-machine-runner';

enum BasicOutputState {
    Start = 'start',
    DoStuff = 'do-stuff',
    End = 'end',
}

export const functionAssignmentMachine = createStateMachine({
    performStateAction: stateAction,
    calculateNextState: nextState,
    initialState: BasicOutputState.Start,
    // as string[] needed to prevent the output type being inferred as never[]
    initialOutput: [] as string[],
    endState: BasicOutputState.End,
});

function stateAction(
    currentState: BasicOutputState,
    input: string,
    lastOutput: Readonly<string[]>,
): Readonly<string[]> {
    if (currentState === BasicOutputState.DoStuff) {
        return lastOutput.concat(input);
    }
    return lastOutput;
}

function nextState(currentState: BasicOutputState, input: string): Readonly<BasicOutputState> {
    if (input) {
        return BasicOutputState.DoStuff;
    }
    return BasicOutputState.End;
}
