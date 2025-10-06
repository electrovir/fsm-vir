import {check} from '@augment-vir/assert';
import {type CallbackParams, type StateMachine} from './state-machine-options.js';

/**
 * Run a state machine by iterating over a list of inputs. Execution stops once all inputs have been
 * exhausted or once the next state calculation instructs to stop.
 *
 * @category Main
 */
export function runFsm<State, Input>({
    initState,
    nextState,
    inputs,
    actions,
}: StateMachine<State, Input>): State {
    const inputIterator = inputs[Symbol.iterator]();
    let state = initState;
    let inputIndex = 0;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
        const iteratorNext = inputIterator.next();

        if (iteratorNext.done) {
            return state;
        }
        const input = iteratorNext.value;

        const callbackParams: CallbackParams<State, Input> = {
            input,
            state,
            index: inputIndex++,
        };

        actions?.preNextState?.(callbackParams);

        const nextStateOutput = nextState(callbackParams);

        if (check.hasKey(nextStateOutput, 'stop')) {
            return state;
        } else if (check.hasKey(nextStateOutput, 'nextState')) {
            state = nextStateOutput.nextState;
        }

        actions?.postNextState?.({
            ...callbackParams,
            state,
        });
    }
}
