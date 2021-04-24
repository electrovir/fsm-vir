import {CallbackError} from './callback-error';

export class StateActionError<StateType, ValueType, OutputType> extends CallbackError<
    StateType,
    ValueType,
    OutputType
> {
    public readonly name = 'StateActionError';
}
