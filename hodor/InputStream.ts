import {Stream} from "./Stream";

export default class InputStream implements Stream<string> {
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

    peek(ahead?: number) {
        return ahead ? this.input.substring(this.position, this.position + arguments[0]) : this.input[this.position];
    }

    eof() {
        return typeof(this.peek()) === "undefined"; 
    }

    fail(message: any) {
        const line = this.input.split("\n")[this.line - 1];
        const part1 = line.substring(0, this.column);
        const part2 = line.substring(this.column);

        const explanation = part1 + " >>> " +  line[this.column] + " <<< " + part2;
        
        const err = `${message} (${this.line}:${this.column})`;

        throw new Error(err);
    }
}