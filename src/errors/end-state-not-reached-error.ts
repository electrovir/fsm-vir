export class EndStateNotReachedError<StateType, OutputType = undefined> extends Error {
    public readonly name = 'EndStateNotReachedError';
    constructor(public readonly state: StateType, public readonly output: OutputType) {
        super(
            `Reached end of input before hitting end state. Ended on state ${JSON.stringify(
                state,
            )} with output ${JSON.stringify(output)}. Try inspecting the logs.`,
        );
    }
}
