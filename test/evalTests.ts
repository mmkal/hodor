import * as hodor from "../hodor/main";

test("adding", () => expect(hodor.hodor("Hodor...Hodor, Hodor, Hodor! Hodor, Hodor. Hodor. + Hodor...Hodor! Hodor Hodor, Hodor! Hodor, Hodor, Hodor!")).toBe(3));
test("bodMas", () => expect(hodor.hodor("Hodor...Hodor, Hodor, Hodor! Hodor, Hodor. Hodor. + Hodor...Hodor! Hodor Hodor, Hodor! Hodor, Hodor, Hodor! * Hodor...Hodor! Hodor Hodor Hodor Hodor. Hodor Hodor, Hodor. Hodor. Hodor.")).toBe(7));
test("Bodmas", () => expect(hodor.hodor("(Hodor...Hodor, Hodor, Hodor! Hodor, Hodor. Hodor. + Hodor...Hodor! Hodor Hodor, Hodor! Hodor, Hodor, Hodor!) * Hodor...Hodor! Hodor Hodor Hodor Hodor. Hodor Hodor, Hodor. Hodor. Hodor.")).toBe(9));
test("BoDmas", () => expect(hodor.hodor("Hodor...Hodor, Hodor, Hodor! Hodor, Hodor. Hodor. + Hodor...Hodor! Hodor Hodor, Hodor! Hodor, Hodor, Hodor! * Hodor...Hodor! Hodor Hodor Hodor Hodor. Hodor Hodor, Hodor. Hodor. Hodor. / Hodor...Hodor Hodor Hodor, Hodor. Hodor, Hodor, Hodor! Hodor Hodor Hodor! Hodor Hodor, Hodor.")).toBe(2.5));
