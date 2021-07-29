export class EmptyInputError extends Error {
    public readonly name = 'EmptyInputError';

    constructor() {
        super(
            'Input is empty. Input must be an iterable with at least one element, such as a non-empty array.',
        );
    }
}
