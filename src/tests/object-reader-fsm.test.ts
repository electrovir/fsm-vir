import {testGroup} from 'test-vir';
import {ActionOrder, createStateMachine, StateActionError} from '..';

enum BasicOutputState {
    Start = 'start',
    DoStuff = 'do-stuff',
    End = 'end',
}

enum ErrorMessages {
    ActionError = 'intentionally throw error in performStateAction',
    StateError = 'intentionally throw error in calculateNextState',
}

export const objectReaderMachine = createStateMachine({
    performStateAction(currentState, input: {stuff: string}, lastOutput: Readonly<string[]>) {
        if (input.stuff === 'action error') {
            // for testing
            throw new Error(ErrorMessages.ActionError);
        }
        if (currentState === BasicOutputState.DoStuff) {
            return lastOutput.concat(input.stuff);
        }
        return lastOutput;
    },
    calculateNextState(_currentState, input) {
        if (input.stuff === 'state error') {
            // for testing
            throw new Error(ErrorMessages.StateError);
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

testGroup((runTest) => {
    runTest({
        description: 'just run the machine',
        test: () => {
            objectReaderMachine.runMachine([{stuff: ''}]);
        },
    });

    runTest({
        description: 'verify that the machine ran',
        expect: ['dummy value'],
        test: () => {
            const result = objectReaderMachine.runMachine([
                {stuff: 'dummy value'},
                {stuff: ''},
                {stuff: 'a'},
                {stuff: 'b'},
            ]);
            return result.output;
        },
    });

    runTest({
        description: 'verify that logging outputs something',
        expect: true,
        test: () => {
            const result = objectReaderMachine.runMachine([{stuff: 'dummy value'}, {stuff: ''}]);
            return !!result.logs.length;
        },
    });

    runTest({
        description: 'verify longer output',
        expect: ['a', 'b', 'c', 'd', 'e', 'f'],
        test: () => {
            const result = objectReaderMachine.runMachine([
                {stuff: 'a'},
                {stuff: 'b'},
                {stuff: 'c'},
                {stuff: 'd'},
                {stuff: 'e'},
                {stuff: 'f'},
                {stuff: ''},
                {stuff: 'h'},
            ]);
            return result.output;
        },
    });

    runTest({
        description: 'errors should be stored so it can be retrieved later',
        expect: [
            new StateActionError(
                'do-stuff',
                {stuff: 'action error'},
                ['a', 'b', 'c', 'd'],
                new Error(ErrorMessages.ActionError),
            ),
        ],
        test: () => {
            const result = objectReaderMachine.runMachine([
                {stuff: 'a'},
                {stuff: 'b'},
                {stuff: 'c'},
                {stuff: 'd'},
                {stuff: 'action error'},
                {stuff: 'state error'},
                {stuff: ''},
            ]);
            return result.errors;
        },
    });

    runTest({
        description: 'should store logs for later use',
        expect: [
            'actionStateOrder: After',
            'Starting with output []',
            'Starting on state "start"',
            'current state: "start", input: {"stuff":"a"}',
            'current state: "do-stuff", input: {"stuff":"b"}',
            'current state: "do-stuff", input: {"stuff":"c"}',
            'current state: "do-stuff", input: {"stuff":"d"}',
            'current state: "do-stuff", input: {"stuff":""}',
        ],
        test: () => {
            const result = objectReaderMachine.runMachine([
                {stuff: 'a'},
                {stuff: 'b'},
                {stuff: 'c'},
                {stuff: 'd'},
                {stuff: ''},
            ]);
            return result.logs;
        },
    });

    runTest({
        description: 'should store logs with custom logger',
        expect: [
            'actionStateOrder: After',
            'Starting with output []',
            'Starting on state "start"',
            'currentState: start, input: a',
            'currentState: do-stuff, input: b',
            'currentState: do-stuff, input: c',
            'currentState: do-stuff, input: d',
            'currentState: do-stuff, input: ',
        ],
        test: () => {
            const result = objectReaderMachine.runMachine(
                [{stuff: 'a'}, {stuff: 'b'}, {stuff: 'c'}, {stuff: 'd'}, {stuff: ''}],
                {
                    customTransitionLogger: (state, input) =>
                        `currentState: ${state}, input: ${input.stuff}`,
                },
            );
            return result.logs;
        },
    });
});
