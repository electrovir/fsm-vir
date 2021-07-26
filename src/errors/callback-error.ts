export abstract class CallbackError<StateType, ValueType, OutputType> extends Error {
    public readonly name: string = 'CallbackError';
    constructor(
        public readonly currentState: Readonly<StateType>,
        public readonly currentValue: Readonly<ValueType>,
        public readonly currentOutput: Readonly<OutputType>,
        error: any,
    ) {
        super(error);
    }
}
