import {testGroup} from 'test-vir';
import {ActionOrder, createStateMachine, StateActionError} from '../';

enum BasicOutputState {
    Start = 'start',
    DoStuff = 'do-stuff',
    End = 'end',
}

enum BasicOutputErrorMessage {
    ActionError = 'intentionally throw error in performStateAction',
    StateError = 'intentionally throw error in calculateNextState',
}

export const basicOutputMachine = createStateMachine<BasicOutputState, string, string[]>({
    performStateAction(currentState, input, lastOutput) {
        if (input === 'action error') {
            // for testing
            throw new Error(BasicOutputErrorMessage.ActionError);
        }
        if (currentState === BasicOutputState.DoStuff) {
            return lastOutput.concat(input);
        }
        return lastOutput;
    },
    calculateNextState(_currentState, input) {
        if (input === 'state error') {
            // for testing
            throw new Error(BasicOutputErrorMessage.StateError);
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

testGroup((runTest) => {
    runTest({
        description: 'just run the machine',
        test: () => {
            basicOutputMachine.runMachine(['']);
        },
    });

    runTest({
        description: 'verify that the machine ran',
        expect: ['dummy value'],
        test: () => {
            const result = basicOutputMachine.runMachine(['dummy value', '', 'a', 'b']);
            return result.output;
        },
    });

    runTest({
        description: 'verify that logging outputs something',
        expect: true,
        test: () => {
            const result = basicOutputMachine.runMachine(['dummy value', ''], {});
            return !!result.logs.length;
        },
    });

    runTest({
        description: 'verify longer output',
        expect: ['a', 'b', 'c', 'd', 'e', 'f'],
        test: () => {
            const result = basicOutputMachine.runMachine(['a', 'b', 'c', 'd', 'e', 'f', '', 'h']);
            return result.output;
        },
    });

    runTest({
        description: 'errors should be caught',
        expect: [
            new StateActionError(
                BasicOutputState.DoStuff,
                'action error',
                ['a', 'b', 'c', 'd'],
                new Error(BasicOutputErrorMessage.ActionError),
            ),
        ],
        test: () => {
            const result = basicOutputMachine.runMachine([
                'a',
                'b',
                'c',
                'd',
                'action error',
                'state error',
                '',
            ]);
            return result.errors;
        },
    });
});
