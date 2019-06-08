interface Token {
    type: string;
    operator?: string;
    left?: Token;
    right?: Token;
    value?: any;
    cond?: Token;
    then?: Token;
    else?: Token;
    func?: Token;
    args?: Token[];
    prog?: Token[];
    vars?: Token[];
    body?: Token;
}
