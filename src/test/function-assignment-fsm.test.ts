import {testGroup} from 'test-vir';
import {EmptyInputError} from '../errors/empty-input-error';
import {functionAssignmentMachine} from './function-assignment-fsm';

testGroup((runTest) => {
    runTest({
        description: 'run on empty array',
        expectError: {
            errorClass: EmptyInputError,
        },
        test: () => {
            functionAssignmentMachine.runMachine([]);
        },
    });
});
