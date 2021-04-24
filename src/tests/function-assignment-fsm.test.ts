import {testGroup} from 'test-vir';
import {EmptyInputError} from '../errors/empty-input-error';
import {EndOfInputError} from '../errors/end-of-input-error';
import {functionAssignmentMachine} from './function-assignment-fsm';

testGroup((runTest) => {
    runTest({
        description: 'fail on empty array',
        expectError: {
            errorClass: EmptyInputError,
        },
        test: () => {
            functionAssignmentMachine.runMachine([]);
        },
    });

    runTest({
        description: "fail if didn't reach end state",
        expectError: {
            errorClass: EndOfInputError,
        },
        test: () => {
            functionAssignmentMachine.runMachine(['nonempty string']);
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
