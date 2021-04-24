import {ReadonlyIfObject} from '../type-helpers';

export abstract class CallbackError<StateType, ValueType, OutputType> extends Error {
    public readonly name: string = 'CallbackError';
    constructor(
        public readonly currentState: ReadonlyIfObject<StateType>,
        public readonly currentValue: ReadonlyIfObject<ValueType>,
        public readonly currentOutput: ReadonlyIfObject<OutputType>,
        error: any,
    ) {
        super(error);
    }
}
