import {testGroup} from 'test-vir';
import {StateActionError} from '../errors/state-action-error';
import {basicOutputMachine} from './basic-output-fsm';

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
            const result = basicOutputMachine.runMachine(['dummy value', ''], {
                enableLogging: true,
            });
            return result.logs.length > 5;
        },
    });

    runTest({
        description: 'verify longer output',
        expect: ['a', 'b', 'c', 'd', 'e', 'f'],
        test: () => {
            const result = basicOutputMachine.runMachine(['a', 'b', 'c', 'd', 'e', 'f', '', 'h'], {
                enableLogging: true,
            });
            return result.output;
        },
    });

    runTest({
        description: 'errors block execution by default',
        expectError: {
            errorClass: StateActionError,
        },
        test: () => {
            const result = basicOutputMachine.runMachine(
                ['a', 'b', 'c', 'd', 'action error', 'state error', ''],
                {enableLogging: true},
            );
            return result.output;
        },
    });
});
