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
    customTransitionLogger?: CustomTransitionLoggerFunction<StateType, ValueType, OutputType>;
};

export type RunMachineResult<StateType, OutputType> = {
    output: Readonly<OutputType>;
    errors: Error[];
    logs: string[];
    finalState: StateType;
    aborted: boolean;
};

export type StateMachine<StateType, ValueType, OutputType> = {
    initParams: Readonly<StateMachineSetup<StateType, ValueType, OutputType>>;
    runMachine: (
        inputs: Iterable<ValueType>,
        overrideSetup?: Readonly<Partial<StateMachineSetup<StateType, ValueType, OutputType>>>,
    ) => RunMachineResult<StateType, OutputType>;
};
