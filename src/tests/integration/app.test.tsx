import { test, expect, describe, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../../App";

describe("Integration - Registration Flow", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    test("should fill and submit the registration form successfully", async () => {
        render(<App />);

        const prenomInput = screen.getByLabelText("Prénom");
        const nomInput = screen.getByLabelText("Nom");
        const mailInput = screen.getByLabelText("Email");
        const birthInput = screen.getByLabelText("Date de naissance");
        const villeInput = screen.getByLabelText("Ville");
        const cpInput = screen.getByLabelText("Code Postal");
        const submitButton = screen.getByRole("button", { name: /Valider l'inscription/i });

        fireEvent.change(prenomInput, { target: { value: "Jean" } });
        fireEvent.change(nomInput, { target: { value: "Dupont" } });
        fireEvent.change(mailInput, { target: { value: "jean.dupont@example.com" } });
        fireEvent.change(birthInput, { target: { value: "1990-01-01" } });
        fireEvent.change(villeInput, { target: { value: "Paris" } });
        fireEvent.change(cpInput, { target: { value: "75001" } });

        expect(submitButton).not.toBeDisabled();

        fireEvent.click(submitButton);

        await waitFor(() => {
            const savedData = JSON.parse(localStorage.getItem('user_registration') || '{}');
            expect(savedData.prenom).toBe("Jean");
            expect(savedData.nom).toBe("Dupont");
            expect(savedData.cp).toBe("75001");
        });

        await waitFor(() => {
            expect((prenomInput as HTMLInputElement).value).toBe("");
            expect((nomInput as HTMLInputElement).value).toBe("");
            expect((cpInput as HTMLInputElement).value).toBe("");
        });
    });

    test("should show error messages for invalid inputs", async () => {
        render(<App />);

        const mailInput = screen.getByLabelText("Email");
        const cpInput = screen.getByLabelText("Code Postal");
        const prenomInput = screen.getByLabelText("Prénom");

        fireEvent.change(prenomInput, { target: { value: "A" } });
        expect(await screen.findByTestId("error-prenom")).toBeInTheDocument();

        const nomInput = screen.getByLabelText("Nom");
        fireEvent.change(nomInput, { target: { value: "1" } });
        expect(await screen.findByTestId("error-nom")).toBeInTheDocument();

        const villeInput = screen.getByLabelText("Ville");
        fireEvent.change(villeInput, { target: { value: "B" } });
        expect(await screen.findByTestId("error-ville")).toBeInTheDocument();

        fireEvent.change(mailInput, { target: { value: "invalid-email" } });
        expect(await screen.findByTestId("error-mail")).toBeInTheDocument();

        fireEvent.change(cpInput, { target: { value: "123" } });
        expect(await screen.findByTestId("error-cp")).toBeInTheDocument();

        const form = screen.getByTestId("registration-form");
        fireEvent.submit(form);
        expect(localStorage.getItem('user_registration')).toBeNull();
    });

    test("should trigger all error toasts when submitting completely empty form", () => {
        render(<App />);

        const form = screen.getByTestId("registration-form");
        fireEvent.submit(form);

        expect(localStorage.getItem('user_registration')).toBeNull();

        const submitButton = screen.getByRole("button", { name: /Valider l'inscription/i });
        expect(submitButton).toBeDisabled();
    });

    test("should keep the button disabled if user is under 18", () => {
        render(<App />);

        const birthInput = screen.getByLabelText("Date de naissance");
        const submitButton = screen.getByRole("button", { name: /Valider l'inscription/i });

        fireEvent.change(screen.getByLabelText("Prénom"), { target: { value: "Jean" } });
        fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Dupont" } });
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jean@test.com" } });
        fireEvent.change(screen.getByLabelText("Ville"), { target: { value: "Paris" } });
        fireEvent.change(screen.getByLabelText("Code Postal"), { target: { value: "75001" } });

        const currentYear = new Date().getFullYear();
        fireEvent.change(birthInput, { target: { value: `${currentYear}-01-01` } });

        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/Mineur \(Inscription bloquée\)/i)).toBeInTheDocument();
    });
});
