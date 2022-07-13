export interface Stream<TToken> {
    next(): TToken | undefined;
    peek(): TToken | undefined;
    eof(): boolean;
    fail(message: any): void;
}