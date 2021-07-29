import {ActionOrder, createStateMachine} from '..';

enum BasicState {
    Start = 'start',
    DoStuff = 'do-stuff',
    End = 'end',
}

type OutputType = {
    thing: string;
};

/** This machine isn't being run in a test (yet) because it's just here for type checking. */
function createComplexStateMachine<OutputGeneric extends OutputType>() {
    const startingState: Readonly<OutputGeneric> = {
        thing: 'hello',
    } as OutputGeneric;

    const stateMachine = createStateMachine<BasicState, string, OutputGeneric>({
        performStateAction(currentState, input: string, lastOutput: Readonly<OutputGeneric>) {
            if (input === 'action error') {
                // for testing
                throw new Error('intentionally throw error in performStateAction');
            }
            if (currentState === BasicState.DoStuff) {
                return {...startingState, thing: input};
            }
            return lastOutput;
        },
        calculateNextState(_currentState, input) {
            if (input === 'state error') {
                // for testing
                throw new Error('intentionally throw error in calculateNextState');
            } else if (input) {
                return BasicState.DoStuff;
            }
            return BasicState.End;
        },
        initialState: BasicState.Start,
        initialOutput: startingState,
        endState: BasicState.End,
        actionStateOrder: ActionOrder.After,
    });

    return stateMachine;
}

export const complexStateMachine = createComplexStateMachine();
