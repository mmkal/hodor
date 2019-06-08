export interface Token0 {
    type: string;
    operator?: string;
    left?: Token0;
    right?: Token0;
    value?: any;
    cond?: Token0;
    then?: Token0;
    else?: Token0;
    func?: Token0;
    args?: Token0[];
    prog?: Token0[];
    vars?: Token0[];
    body?: Token0;
}

type TokenTypes_ = {
    Number: {value: string}
    Boolean: {value: boolean}
    Keyword: {value: string}
    Variable: {value: string}
    String: {value: string}
    Punctuation: {value: string}
    Operator: {
        value: string
        left: Token
        right: Token
    }
    Assign: {
        left: TokenTypes['Variable']
        right: Token
    }
    Binary: {
        operator: string
        left: Token
        right: Token
    }
    Lambda: {
        vars: Token[]
        body: any
    }
    If: {
        cond: Token
        then: Token
        else?: Token
    }
    Program: {
        prog: Token[]
    }
    Call: {
        func: Token
        args: Token[]
    }
}

export type TokenTypesT = {
    [K in keyof TokenTypes_]: TokenTypes_[K] & {type: K}
}
export interface TokenTypes extends TokenTypesT {}

export type Token = TokenTypes[keyof TokenTypes]
// export interface Token2 extends TokenT {}
export type TokenType = Token['type']

export const types: {[K in keyof TokenTypes]: K} = {} as any
