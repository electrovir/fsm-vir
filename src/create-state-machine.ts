import {CalculateNextStateError} from './errors/calculate-next-state-error';
import {CallbackError} from './errors/callback-error';
import {EmptyInputError} from './errors/empty-input-error';
import {EndOfInputError} from './errors/end-of-input-error';
import {StateActionError} from './errors/state-action-error';
import {
    ActionOrder,
    CustomTransitionLoggerFunction,
    performStateActionFunction,
    RunMachineResult,
    StateMachine,
    StateMachineSetup,
} from './state-machine-types';

export const defaultTransitionLogger: CustomTransitionLoggerFunction<unknown, unknown, unknown> = (
    state,
    input,
    index,
) => `current state: ${JSON.stringify(state)}, input: ${JSON.stringify(input)} index: ${index}`;

/**
 * This creates a state machine. The state machine is a Mealy machine but outputs are generated
 * independent of the state transition. As you can see in the argument object, the "action" function
 * (which generates outputs) is distinct from the "next" function, which calculates the next state.
 * The implementation of "action" is of course left to the user, so you can totally just ignore the
 * current value and make this a Moore machine if you wish.
 */
export function createStateMachine<StateType, ValueType, OutputType = undefined>(
    machineSetup: Readonly<StateMachineSetup<StateType, ValueType, OutputType>>,
): StateMachine<StateType, ValueType, OutputType> {
    /**
     * If no state action callback is provided to a state machine, this becomes the state action.
     * All this does is return the given input, so the final state machine output will end up being
     * identical to the initial state machine output, which was assigned in the state machine setup object.
     */
    const defaultStateAction: performStateActionFunction<StateType, ValueType, OutputType> = (
        _state,
        _input,
        output,
    ) => output;

    const stateMachine: StateMachine<StateType, ValueType, OutputType> = {
        initParams: machineSetup,
        runMachine(
            inputs: Iterable<ValueType>,
            overrideSetup?: Readonly<Partial<StateMachineSetup<StateType, ValueType, OutputType>>>,
        ): RunMachineResult<StateType, OutputType> {
            const {
                performStateAction = defaultStateAction,
                calculateNextState,
                handleError = () => false,
                initialState,
                endState,
                initialOutput,
                actionStateOrder = ActionOrder.Before,
                customTransitionLogger = defaultTransitionLogger,
            } = {...machineSetup, ...overrideSetup} as Readonly<
                StateMachineSetup<StateType, ValueType, OutputType>
            >;

            let state: Readonly<StateType> = initialState;
            const iterator: Readonly<Iterator<ValueType>> = inputs[Symbol.iterator]();
            // this will only be undefined if the initial output is undefined, in which case the
            // OutputType generic MUST be undefined anyway.
            let output: Readonly<OutputType> = initialOutput!;
            const logs: string[] = [];
            const errors: Error[] = [];
            let aborted = false;
            let runCount = 0;

            /**
             * If this function ever returns false, that indicates that the machine should halt all
             * execution immediately.
             */
            function respondToCallbackError(
                state: Readonly<StateType>,
                input: Readonly<ValueType>,
                output: Readonly<OutputType>,
                error: any,
                errorType: new (
                    state: Readonly<StateType>,
                    input: Readonly<ValueType>,
                    output: Readonly<OutputType>,
                    error: any,
                ) => CallbackError<StateType, ValueType, OutputType>,
            ): boolean {
                const callbackError = new errorType(state, input, output, error);
                errors.push(callbackError);
                logs.push(`Error: ${errorType.name}`);
                if (handleError(callbackError)) {
                    logs.push('Error handled. Resuming operation...');
                    return true;
                } else {
                    return false;
                }
            }

            logs.push(`actionStateOrder: ${actionStateOrder}`);
            logs.push(`Starting with output ${JSON.stringify(output)}`);
            logs.push(`Starting on state ${JSON.stringify(state)}`);

            while (state !== endState) {
                const nextInput = iterator.next();

                if (nextInput.done) {
                    if (runCount) {
                        errors.push(new EndOfInputError(state, output));
                        aborted = true;
                        break;
                    } else {
                        errors.push(new EmptyInputError());
                        aborted = true;
                        break;
                    }
                }

                const input: Readonly<ValueType> = nextInput.value as Readonly<
                    typeof nextInput.value
                >;

                logs.push(customTransitionLogger(state, input, runCount, output));

                // perform pre transition action
                if (
                    actionStateOrder === ActionOrder.Before ||
                    actionStateOrder === ActionOrder.Both
                ) {
                    try {
                        output = performStateAction(state, input, output);
                    } catch (error) {
                        if (
                            !respondToCallbackError(state, input, output, error, StateActionError)
                        ) {
                            aborted = true;
                            break;
                        }
                    }
                }

                // transition to next state
                const previousState = state;
                try {
                    state = calculateNextState(state, input);
                } catch (error) {
                    if (
                        !respondToCallbackError(
                            state,
                            input,
                            output,
                            error,
                            CalculateNextStateError,
                        )
                    ) {
                        aborted = true;
                        break;
                    }
                }

                // perform post transition action
                if (
                    actionStateOrder === ActionOrder.After ||
                    (actionStateOrder === ActionOrder.Both && previousState !== state)
                ) {
                    try {
                        output = performStateAction(state, input, output);
                    } catch (error) {
                        if (
                            !respondToCallbackError(state, input, output, error, StateActionError)
                        ) {
                            aborted = true;
                            break;
                        }
                    }
                }

                runCount++;
            }

            return {output, logs, errors, finalState: state, aborted};
        },
    };

    return stateMachine;
}
