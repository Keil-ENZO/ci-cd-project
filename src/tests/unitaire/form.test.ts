import { test, expect, describe } from "vitest";
import { checkName, checkCP } from "../../utils/form";

describe("checkName", () => {
    test("should return true for valid names", () => {
        expect(checkName("Dupont")).toBe(true);
        expect(checkName("Jean-Pierre")).toBe(true);
        expect(checkName("René")).toBe(true);
        expect(checkName("De La Fontaine")).toBe(true);
    });

    test("should return false for names too short", () => {
        expect(checkName("A")).toBe(false);
    });

    test("should return false for invalid characters", () => {
        expect(checkName("Jean123")).toBe(false);
        expect(checkName("Jean@")).toBe(false);
    });

    test("should return false for non-string inputs", () => {
        expect(checkName(123 as any)).toBe(false);
        expect(checkName(null as any)).toBe(false);
    });
});

describe("checkCP", () => {
    test("should return true for valid French postal codes", () => {
        expect(checkCP("75001")).toBe(true);
        expect(checkCP("13000")).toBe(true);
    });

    test("should return false for invalid formats", () => {
        expect(checkCP("7500")).toBe(false);
        expect(checkCP("750011")).toBe(false);
        expect(checkCP("ABCDE")).toBe(false);
        expect(checkCP("75 01")).toBe(false);
    });

    test("should return false for non-string inputs", () => {
        expect(checkCP(12345 as any)).toBe(false);
        expect(checkCP(null as any)).toBe(false);
    });
});
