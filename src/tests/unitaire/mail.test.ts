import { test, expect, describe } from "vitest";
import { checkMail } from "../../utils/mail";

describe("checkMail", () => {
    test("should return true if email is valid", () => {
        const mail = "test@test.com";
        expect(checkMail(mail)).toEqual(true);
    });

    test("should return false if email is invalid", () => {
        const mail = "test";
        expect(checkMail(mail)).toEqual(false);
    });

    test("should return false if email is empty", () => {
        const mail = "";
        expect(checkMail(mail)).toEqual(false);
    });

    test("should return false if email is null", () => {
        expect(checkMail(null as any)).toEqual(false);
    });

    test("should return false if email is undefined", () => {
        expect(checkMail(undefined as any)).toEqual(false);
    });

    test("should return false if email is not a string", () => {
        expect(checkMail(123 as any)).toEqual(false);
    });

    test("should return false if email contains space", () => {
        const mail = "test@t est.com";
        expect(checkMail(mail)).toEqual(false);
    });

    test("should return false if email does not contain @", () => {
        const mail = "testtest.com";
        expect(checkMail(mail)).toEqual(false);
    });

    test("should return false if email does not contain .", () => {
        const mail = "test@testcom";
        expect(checkMail(mail)).toEqual(false);
    });

    test("should return false if email contains @ at the beginning", () => {
        const mail = "@test.com";
        expect(checkMail(mail)).toEqual(false);
    });

    test("should return false if email contains @ and @ is at the end", () => {
        const mail = "test@";
        expect(checkMail(mail)).toEqual(false);
    });

    test("should return false if email contains . at the beginning", () => {
        const mail = ".test.com";
        expect(checkMail(mail)).toEqual(false);
    });

    test("should return false if email contains . at the end", () => {
        const mail = "test@test.";
        expect(checkMail(mail)).toEqual(false);
    });
});