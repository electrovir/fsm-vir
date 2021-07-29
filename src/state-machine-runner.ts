import {CalculateNextStateError} from './errors/calculate-next-state-error';
import {CallbackError} from './errors/callback-error';
import {EmptyInputError} from './errors/empty-input-error';
import {EndOfInputError} from './errors/end-of-input-error';
import {StateActionError} from './errors/state-action-error';

export type performStateActionFunction<StateType, ValueType, OutputType> = (
    currentState: Readonly<StateType>,
    input: Readonly<ValueType>,
    lastOutput: Readonly<OutputType>,
) => Readonly<OutputType>;

export type nextStateFunction<StateType, ValueType> = (
    currentState: Readonly<StateType>,
    input: Readonly<ValueType>,
) => Readonly<StateType>;

export type handleErrorFunction<StateType, ValueType, OutputType> = (
    error: CallbackError<StateType, ValueType, OutputType>,
) => boolean;

export type CustomTransitionLoggerFunction<StateType, ValueType, OutputType> = (
    currentState: StateType,
    currentInput: ValueType,
    inputIndex: number,
    currentOutput: OutputType,
) => string;

export enum ActionOrder {
    /** Run state actions before state transitions ONLY. This is the default. */
    Before = 'Before',
    /** Run state actions after state transitions ONLY. */
    After = 'After',
    /**
     * Run state actions before state transitions AND after state transitions if and only if the
     * state changed.
     */
    Both = 'Both',
}

export type StateMachineSetup<StateType, ValueType, OutputType> = {
    performStateAction?: performStateActionFunction<StateType, ValueType, OutputType>;
    calculateNextState: nextStateFunction<StateType, ValueType>;
    /** HandleError callback: return true to continue execution, false to abort. */
    handleError?: handleErrorFunction<StateType, ValueType, OutputType>;
    initialState: Readonly<StateType>;
    endState: Readonly<StateType>;
    initialOutput?: Readonly<OutputType>;
    /** ActionStateOrder: defaults to ActionOrder.Before. */
    actionStateOrder?: ActionOrder;
    /**
     * IgnoreEndOfInput: defaults to false. If set to true, reaching the end of the input iteration
     * before hitting the end state does not result in an error (normally it will).
     */
    ignoreEndOfInput?: boolean;
    customTransitionLogger?: CustomTransitionLoggerFunction<StateType, ValueType, OutputType>;
};

export type RunMachineResult<StateType, OutputType> = {
    output: Readonly<OutputType>;
    errors: Error[];
    logs: string[];
    finalState: StateType;
};

export type StateMachine<StateType, ValueType, OutputType> = {
    initParams: Readonly<StateMachineSetup<StateType, ValueType, OutputType>>;
    runMachine: (
        inputs: Iterable<ValueType>,
        overrideSetup?: Readonly<Partial<StateMachineSetup<StateType, ValueType, OutputType>>>,
    ) => RunMachineResult<StateType, OutputType>;
};

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
    const stateMachine: StateMachine<StateType, ValueType, OutputType> = {
        initParams: machineSetup,
        runMachine(
            inputs: Iterable<ValueType>,
            overrideSetup?: Readonly<Partial<StateMachineSetup<StateType, ValueType, OutputType>>>,
        ): RunMachineResult<StateType, OutputType> {
            const {
                performStateAction = (state, input, output) => output,
                calculateNextState,
                handleError = () => false,
                initialState,
                endState,
                initialOutput,
                actionStateOrder = ActionOrder.Before,
                ignoreEndOfInput = false,
                customTransitionLogger = (state, input, index) =>
                    `current state: ${JSON.stringify(state)}, input: ${JSON.stringify(
                        input,
                    )} index: ${index}`,
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
            let runCount = 0;

            /** False value indicates that the machine should halt. */
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
                        if (ignoreEndOfInput) {
                            break;
                        } else {
                            errors.push(new EndOfInputError(state, output));
                            break;
                        }
                    } else {
                        errors.push(new EmptyInputError());
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
                            break;
                        }
                    }
                }

                runCount++;
            }

            return {output, logs, errors, finalState: state};
        },
    };

    return stateMachine;
}
