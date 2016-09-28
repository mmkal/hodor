import { Transpiler } from "../../hodor/transpiler";
import test from "../great-ape";

test("quick hodor", t => {
    t.isEqual(Transpiler.Hodor("hello"), "Hodor Hodor Hodor Hodor. Hodor. Hodor Hodor, Hodor Hodor. Hodor Hodor, Hodor Hodor. Hodor, Hodor, Hodor!");
});

test("slow pass", t => {
    return new Promise((res, rej) => {
        setTimeout(() => {
            t.isEqual(1, 1);
            res();
        }, 300);
    });
});

test("slow fail", t => {
    return new Promise((res, rej) => {
        setTimeout(rej, 3000);
    });
});

test("slightly slow pass", t => {
    return new Promise((res, rej) => {
        setTimeout(res, 1000);
    });
});