import {type PartialWithUndefined} from '@augment-vir/common';

/**
 * Parameters for each callback (the `nextState` callback and the action callbacks, `preNextState`
 * and `postNextState`).
 *
 * @category Internal
 */
export type CallbackParams<State, Input> = {
    state: State;
    input: Readonly<Input>;
    /** Index of the current input in the original input iterator. */
    index: number;
};

/**
 * Callback for determining the next state in the state machine.
 *
 * @category Internal
 * @returns
 *
 *   - `{nextState: <State>}`: Sets the next state.
 *   - `{stop: true`}: indicates that no more inputs should be processed. This is akin to indicating
 *       that the current state is the "Stop" state.
 *   - `undefined`: Indicates that no state change should occur.
 */
export type NextStateCallback<State, Input> = (
    params: CallbackParams<State, Input>,
) => {nextState: State} | undefined | {stop: true};

/**
 * A callback for performing an action per processed input.
 *
 * @category Internal
 */
export type ActionCallback<State, Input> = (params: CallbackParams<State, Input>) => void;

/**
 * Options for `runFsm`.
 *
 * @category Internal
 */
export type StateMachine<State, Input> = {
    /** All inputs to iterate over for the state machine. */
    inputs: Readonly<Iterable<Input>>;
    /** Initial state for the state machine. */
    initState: State;
    /** A function that calculates the next state for each input. */
    nextState: NextStateCallback<State, Input>;
    /** Actions to fire on each input value. */
    actions?:
        | PartialWithUndefined<{
              /**
               * This fires after the next input has been grabbed but the next state has not been
               * calculated yet.
               */
              preNextState: ActionCallback<State, Input>;

              /**
               * This fires after the next input has been grabbed and the next state has been
               * calculated.
               */
              postNextState: ActionCallback<State, Input>;
          }>
        | undefined;
};
