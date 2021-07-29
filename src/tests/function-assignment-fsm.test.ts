import {testGroup} from 'test-vir';
import {EmptyInputError} from '../errors/empty-input-error';
import {EndOfInputError} from '../errors/end-of-input-error';
import {createStateMachine} from '../state-machine-runner';

enum BasicOutputState {
    Start = 'start',
    DoStuff = 'do-stuff',
    End = 'end',
}

const functionAssignmentMachine = createStateMachine<BasicOutputState, string, string[]>({
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

function nextState(_currentState: BasicOutputState, input: string): Readonly<BasicOutputState> {
    if (input) {
        return BasicOutputState.DoStuff;
    }
    return BasicOutputState.End;
}

testGroup((runTest) => {
    runTest({
        description: 'fail on empty array',
        expect: [new EmptyInputError()],
        test: () => {
            const results = functionAssignmentMachine.runMachine([]);
            return results.errors;
        },
    });

    runTest({
        description: "fail if didn't reach end state",
        expect: [new EndOfInputError('do-stuff', [])],
        test: () => {
            return functionAssignmentMachine.runMachine(['nonempty string']).errors;
        },
    });

    runTest({
        description: 'ignore not reaching end state if ignoreEndOfInput is true',
        test: () => {
            functionAssignmentMachine.runMachine(['nonempty string'], {ignoreEndOfInput: true});
        },
    });

    runTest({
        description: 'run on basically empty array',
        test: () => {
            functionAssignmentMachine.runMachine(['']);
        },
    });
});
