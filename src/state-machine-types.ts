import {CallbackError} from './errors/callback-error';

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
    /**
     * Run state actions after state transitions ONLY. The input to performStateAction will be the
     * input that triggered the state transition.
     */
    After = 'After',
    /**
     * Run state actions before state transitions AND after state transitions. State actions will
     * only be run after state transitions if and only if the state actually changed. The input to
     * performStateAction will be the input that triggered the state transition, the same as the
     * ActionOrder.After option.
     */
    Both = 'Both',
}

export type StateMachineSetup<StateType, ValueType, OutputType> = {
    /**
     * Run on each state. The exact timing of when this is run is controlled via the optional
     * actionStateOrder property.
     */
    performStateAction?: performStateActionFunction<StateType, ValueType, OutputType>;
    /** Calculate the next state based on the current state and the current input. */
    calculateNextState: nextStateFunction<StateType, ValueType>;
    /** HandleError callback: return true to continue execution, return false to abort. */
    handleError?: handleErrorFunction<StateType, ValueType, OutputType>;
    /** Optional custom logger for logging state transitions. */
    customTransitionLogger?: CustomTransitionLoggerFunction<StateType, ValueType, OutputType>;

    /** The state on which the state machine should begin execution. */
    initialState: Readonly<StateType>;
    /**
     * The state which indicates to the state machine that execution is finished. If all inputs are
     * exhausted before the state machine reaches this state, the state machine aborts with includes
     * an error in its errors output property.
     */
    endState: Readonly<StateType>;

    /**
     * Initial output value used to bootstrap the performStateAction's output. This can be
     * conceptually viewed similarly to the initial value passed into Array.prototype.reduce().
     */
    initialOutput?: Readonly<OutputType>;

    /** Optional property: defaults to ActionOrder.Before when initializing the state machine. */
    actionStateOrder?: ActionOrder;
};

export type RunMachineResult<StateType, OutputType> = {
    /**
     * If true, indicates that the state machine did not successfully parse all inputs and errors
     * were encountered. This flag should be checked before using the output property.
     */
    aborted: boolean;
    /**
     * The final calculated output (from performStateAction). If the state machine did not run to
     * completion, this will be whatever output was last calculated.
     */
    output: Readonly<OutputType>;
    /**
     * List of all errors encountered. The presence of an error here doesn't necessarily mean that
     * the state machine aborted (check the aborted flag for that) as state machines can be setup
     * with custom error handlers that do not result in the state machine aborting.
     */
    errors: Error[];
    /** Logs to help with debugging. All state machine runs will include logs. */
    logs: string[];
    /**
     * The state on which the state machine finished running. This should be the given endState
     * property if all went well.
     */
    finalState: StateType;
    /**
     * The number of times that the state machine ran through actions and transitions. In other
     * words, the number of inputs that the state machine processed.
     */
    executionCount: number;
};

export type StateMachine<StateType, ValueType, OutputType> = {
    /** The original parameters passed to the state machine setup. */
    initialSetup: Readonly<StateMachineSetup<StateType, ValueType, OutputType>>;
    /** Actually run the machine on a set of inputs! */
    runMachine: (
        inputs: Iterable<ValueType>,
        setupOverride?: Readonly<Partial<StateMachineSetup<StateType, ValueType, OutputType>>>,
    ) => RunMachineResult<StateType, OutputType>;
};
