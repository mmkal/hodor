import * as hodor from "../hodor/main";

test("adding", () => expect(hodor.hodor("1 + 2")).toBe(3));
test("bodMas", () => expect(hodor.hodor("1 + 2 * 3")).toBe(7));
test("Bodmas", () => expect(hodor.hodor("(1 + 2) * 3")).toBe(9));
test("BoDmas", () => expect(hodor.hodor("1 + 2 * 3 / 4")).toBe(2.5));
