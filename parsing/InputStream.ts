class InputStream implements Stream<string> {
    private position = 0;
    private line = 1;
    private column = 0;

    constructor(public input: string) {
    }

    next() {
        const char = this.peek();
        this.position++;

        if (char === "\n") {
            this.line++;
            this.column = 0;
        }
        else {
            this.column++;
        }

        return char;
    }

    peek() {
        return this.input[this.position];
    }

    eof() {
        return typeof(this.peek()) === "undefined"; 
    }

    fail(message: any) {
        throw new Error(`${message} (${this.line}:${this.column})."`);
    }
}