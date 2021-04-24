import {CallbackError} from './callback-error';

export class CalculateNextStateError<StateType, ValueType, OutputType> extends CallbackError<
    StateType,
    ValueType,
    OutputType
> {
    public readonly name = 'CalculateNextStateError';
}
