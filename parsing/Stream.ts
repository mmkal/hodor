interface Stream<TToken> {
    next(): TToken;
    peek(): TToken;
    eof(): boolean;
    fail(message: any): void;
}