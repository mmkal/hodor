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


export const tokenTypeNames = [
    'Number', 'Boolean', 'Keyword', 'Variable', 'String', 'Punctuation', 'Operator', 'Assign', 'Binary', 'Lambda', 'If', 'Program', 'Call',
] as const

type TokenTypes_ = {
    Number: {value: string}
    Boolean: {value: boolean}
    Keyword: {value: string}
    Variable: {value: string}
    String: {value: string}
    Punctuation: {value: string}
    Operator: {
        value: string
        left?: Token
        right?: Token
    }
    Assign: {
        left: any // for some reason this being `Token` causes OOM exceptions
        right: any // for some reason this being `Token` causes OOM exceptions
    }
    Binary: {
        operator: string
        left: any // for some reason this being `Token` causes OOM exceptions
        right: any // for some reason this being `Token` causes OOM exceptions
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

type TokenName = typeof tokenTypeNames[number]

export type TokenTypes = {
    [K in TokenName]: TokenTypes_[K] & {type: K}
}

export type Token = TokenTypes[TokenName]
export type TokenType = Token['type']

export const types: {[K in typeof tokenTypeNames[number]]: K} = {} as any
tokenTypeNames.forEach(name => types[name as any] = name)
