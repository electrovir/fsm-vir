import {testGroup} from 'test-vir';
import {getNoOutputStateMachineRunCount, noOutputStateMachine} from './no-output-fsm';

testGroup((runTest) => {
    runTest({
        description: 'just run the machine',
        test: () => {
            noOutputStateMachine.runMachine(['']);
        },
    });
    runTest({
        description: 'verify that the machine ran',
        expect: 1,
        test: () => {
            const runCountBefore = getNoOutputStateMachineRunCount();
            noOutputStateMachine.runMachine(['']);
            return getNoOutputStateMachineRunCount() - runCountBefore;
        },
    });
});
