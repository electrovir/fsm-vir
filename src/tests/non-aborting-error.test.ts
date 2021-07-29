import {testGroup} from 'test-vir';
import {ActionOrder, createStateMachine} from '..';

enum BasicOutputState {
    Start = 'start',
    DoStuff = 'do-stuff',
    End = 'end',
}

const basicOutputMachineWithErrors = createStateMachine<BasicOutputState, string, string[]>({
    performStateAction(_currentState, _input, lastOutput) {
        return lastOutput;
    },
    calculateNextState(currentState, input) {
        if (input) {
            return BasicOutputState.DoStuff;
        } else if (input === 'end now') {
            return BasicOutputState.End;
        } else {
            return currentState;
        }
    },
    initialState: BasicOutputState.Start,
    initialOutput: [],
    endState: BasicOutputState.End,
    actionStateOrder: ActionOrder.After,
});

testGroup((runTest) => {
    runTest({
        description: 'machine should still return something end state is not reached',
        expect: 1,
        test: () => {
            return basicOutputMachineWithErrors.runMachine(['']).errors.length;
        },
    });
});
