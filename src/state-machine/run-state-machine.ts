import {check} from '@augment-vir/assert';
import {type StateMachine} from './state-machine-options.js';

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

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
        const iteratorNext = inputIterator.next();

        if (iteratorNext.done) {
            return state;
        }
        const input = iteratorNext.value;

        actions?.preNextState?.({input, state});

        const nextStateOutput = nextState({input, state});

        if (check.hasKey(nextStateOutput, 'stop')) {
            return state;
        } else if (check.hasKey(nextStateOutput, 'nextState')) {
            state = nextStateOutput.nextState;
        }

        actions?.postNextState?.({input, state});
    }
}
