export * from "./Hodor";

import Environment from "./Environment";

export { Environment };

export const hodor = (input: string) => {
  const interpreter = Environment.createBasic().createInterpreter();
  return interpreter.execute(input);
};
