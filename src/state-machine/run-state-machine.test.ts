import {assert} from '@augment-vir/assert';
import {describe, it, itCases} from '@augment-vir/test';
import {runFsm} from './run-state-machine.js';
import {type CallbackParams} from './state-machine-options.js';

describe(runFsm.name, () => {
    itCases(runFsm, [
        {
            it: 'runs to the end of an array',
            input: {
                initState: 'start',
                inputs: [
                    'a',
                    'b',
                    'c',
                ],
                nextState() {
                    return undefined;
                },
            },
            expect: 'start',
        },
        {
            it: 'transitions states',
            input: {
                initState: 'start',
                inputs: [
                    'a',
                    'b',
                    'c',
                    'd',
                    'e',
                ],
                nextState({input}) {
                    if (input === 'b') {
                        return {
                            nextState: 'next',
                        };
                    } else if (input === 'd') {
                        return {
                            stop: true,
                        };
                    } else {
                        return undefined;
                    }
                },
            },
            expect: 'next',
        },
    ]);

    it('calls actions', () => {
        const actionOutputs = {
            pre: [] as CallbackParams<string, string>[],
            post: [] as CallbackParams<string, string>[],
        };

        runFsm({
            initState: 'start',
            inputs: [
                'a',
                'b',
                'c',
                'd',
                'e',
            ],
            nextState({input}) {
                if (input === 'b') {
                    return {
                        nextState: 'next',
                    };
                } else if (input === 'd') {
                    return {
                        stop: true,
                    };
                } else {
                    return undefined;
                }
            },
            actions: {
                preNextState(params) {
                    actionOutputs.pre.push(params);
                },
                postNextState(params) {
                    actionOutputs.post.push(params);
                },
            },
        });

        assert.deepEquals(actionOutputs, {
            pre: [
                {
                    input: 'a',
                    state: 'start',
                    index: 0,
                },
                {
                    input: 'b',
                    state: 'start',
                    index: 1,
                },
                {
                    input: 'c',
                    state: 'next',
                    index: 2,
                },
                {
                    input: 'd',
                    state: 'next',
                    index: 3,
                },
            ],
            post: [
                {
                    input: 'a',
                    state: 'start',
                    index: 0,
                },
                {
                    input: 'b',
                    state: 'next',
                    index: 1,
                },
                {
                    input: 'c',
                    state: 'next',
                    index: 2,
                },
            ],
        });
    });

    it('has proper types', () => {
        enum State {
            Start = 'start',
            Next = 'next',
        }

        runFsm({
            initState: State.Start,
            inputs: [
                'a',
                'b',
                'c',
                1,
                'd',
                'e',
            ],
            nextState({input, state}) {
                assert.tsType(state).equals<State>();
                assert.tsType(input).equals<string | number>();
                return undefined;
            },
            actions: {
                preNextState({input, state}) {
                    assert.tsType(state).equals<State>();
                    assert.tsType(input).equals<string | number>();
                },
                postNextState({input, state}) {
                    assert.tsType(state).equals<State>();
                    assert.tsType(input).equals<string | number>();
                },
            },
        });
    });
});
