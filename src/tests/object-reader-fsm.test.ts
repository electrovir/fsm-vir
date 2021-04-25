import {testGroup} from 'test-vir';
import {StateActionError} from '../errors/state-action-error';
import {objectReaderMachine} from './object-reader-fsm';

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
            const result = objectReaderMachine.runMachine([{stuff: 'dummy value'}, {stuff: ''}], {
                enableLogging: true,
            });
            return result.logs.length > 5;
        },
    });

    runTest({
        description: 'verify longer output',
        expect: ['a', 'b', 'c', 'd', 'e', 'f'],
        test: () => {
            const result = objectReaderMachine.runMachine(
                [
                    {stuff: 'a'},
                    {stuff: 'b'},
                    {stuff: 'c'},
                    {stuff: 'd'},
                    {stuff: 'e'},
                    {stuff: 'f'},
                    {stuff: ''},
                    {stuff: 'h'},
                ],
                {
                    enableLogging: true,
                },
            );
            return result.output;
        },
    });

    runTest({
        description: 'errors block execution by default',
        expectError: {
            errorClass: StateActionError,
        },
        test: () => {
            const result = objectReaderMachine.runMachine(
                [
                    {stuff: 'a'},
                    {stuff: 'b'},
                    {stuff: 'c'},
                    {stuff: 'd'},
                    {stuff: 'action error'},
                    {stuff: 'state error'},
                    {stuff: ''},
                ],
                {enableLogging: true},
            );
            return result.output;
        },
    });

    runTest({
        description: 'errors block execution by default',
        expect: [
            'Logging turned on.',
            'actionStateOrder: After',
            'Starting with output []',
            'Starting on state "start"',
            'current state: "start", input: {"stuff":"a"} index: 0',
            'calling calculateNextState',
            'calling performStateAction',
            'current state: "do-stuff", input: {"stuff":"b"} index: 1',
            'calling calculateNextState',
            'calling performStateAction',
            'current state: "do-stuff", input: {"stuff":"c"} index: 2',
            'calling calculateNextState',
            'calling performStateAction',
            'current state: "do-stuff", input: {"stuff":"d"} index: 3',
            'calling calculateNextState',
            'calling performStateAction',
            'current state: "do-stuff", input: {"stuff":""} index: 4',
            'calling calculateNextState',
            'calling performStateAction',
        ],
        test: () => {
            const result = objectReaderMachine.runMachine(
                [{stuff: 'a'}, {stuff: 'b'}, {stuff: 'c'}, {stuff: 'd'}, {stuff: ''}],
                {enableLogging: true},
            );
            return result.logs;
        },
    });

    runTest({
        description: 'errors block execution by default',
        expect: [
            'Logging turned on.',
            'actionStateOrder: After',
            'Starting with output []',
            'Starting on state "start"',
            'currentState: start, input: a',
            'calling calculateNextState',
            'calling performStateAction',
            'currentState: do-stuff, input: b',
            'calling calculateNextState',
            'calling performStateAction',
            'currentState: do-stuff, input: c',
            'calling calculateNextState',
            'calling performStateAction',
            'currentState: do-stuff, input: d',
            'calling calculateNextState',
            'calling performStateAction',
            'currentState: do-stuff, input: ',
            'calling calculateNextState',
            'calling performStateAction',
        ],
        test: () => {
            const result = objectReaderMachine.runMachine(
                [{stuff: 'a'}, {stuff: 'b'}, {stuff: 'c'}, {stuff: 'd'}, {stuff: ''}],
                {
                    enableLogging: true,
                    customLogger: (state, input) => `currentState: ${state}, input: ${input.stuff}`,
                },
            );
            return result.logs;
        },
    });
});
