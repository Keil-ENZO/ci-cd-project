import { test, expect, describe, beforeAll, afterAll, vi } from "vitest";
import { checkAge } from "../../utils/age";

describe("checkAge", () => {
    beforeAll(() => {
        // Fixe la date système pour que le test soit déterministe
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-05-05"));
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    test("should return true for a person exactly 18 years old", () => {
        expect(checkAge("2008-05-05")).toBe(true);
    });

    test("should return true for a person older than 18", () => {
        expect(checkAge("2000-01-01")).toBe(true);
    });

    test("should return false for a person younger than 18", () => {
        expect(checkAge("2010-01-01")).toBe(false);
    });

    test("should return false for an invalid date string", () => {
        expect(checkAge("not-a-date")).toBe(false);
    });

    test("should return false for a date in the future", () => {
        expect(checkAge("2030-01-01")).toBe(false);
    });

    test("should return false for empty or null input", () => {
        expect(checkAge("")).toBe(false);
        expect(checkAge(null as any)).toBe(false);
    });

    test("should work with a Date object directly", () => {
        const date = new Date("2000-01-01");
        expect(checkAge(date)).toBe(true);
    });
});
