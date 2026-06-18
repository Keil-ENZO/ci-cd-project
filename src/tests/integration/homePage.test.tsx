import { test, expect, describe, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HomePage } from "../../pages/HomePage/HomePage";

vi.mock("../../lib/api", () => ({
    addUser: vi.fn(),
}));

import { addUser } from "../../lib/api";

const mockAddUser = vi.mocked(addUser);

describe("HomePage - retours de validation par champ", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("affiche les erreurs inline pour des valeurs invalides", () => {
        render(<HomePage />);

        fireEvent.change(screen.getByLabelText("Prénom"), { target: { value: "J" } });
        fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "D" } });
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } });
        fireEvent.change(screen.getByLabelText("Date de naissance"), { target: { value: `${new Date().getFullYear()}-01-01` } });
        fireEvent.change(screen.getByLabelText("Ville"), { target: { value: "P" } });
        fireEvent.change(screen.getByLabelText("Code Postal"), { target: { value: "123" } });

        expect(screen.getByTestId("error-prenom")).toBeInTheDocument();
        expect(screen.getByTestId("error-nom")).toBeInTheDocument();
        expect(screen.getByTestId("error-mail")).toBeInTheDocument();
        expect(screen.getByTestId("error-age")).toBeInTheDocument();
        expect(screen.getByTestId("error-ville")).toBeInTheDocument();
        expect(screen.getByTestId("error-cp")).toBeInTheDocument();
    });

    test("affiche les retours positifs pour des valeurs valides", () => {
        render(<HomePage />);

        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jean.dupont@example.com" } });
        fireEvent.change(screen.getByLabelText("Date de naissance"), { target: { value: "2000-01-15" } });
        fireEvent.change(screen.getByLabelText("Code Postal"), { target: { value: "75001" } });

        expect(screen.getByText("Email valide")).toBeInTheDocument();
        expect(screen.getByText("Majeur")).toBeInTheDocument();
        expect(screen.getByText("Format valide")).toBeInTheDocument();
    });

    test("affiche des toasts d'erreur si on soumet un formulaire invalide", () => {
        render(<HomePage />);
        fireEvent.submit(screen.getByTestId("registration-form"));
        expect(mockAddUser).not.toHaveBeenCalled();
    });

    const fillValid = () => {
        fireEvent.change(screen.getByLabelText("Prénom"), { target: { value: "Jean" } });
        fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Dupont" } });
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jean.dupont@example.com" } });
        fireEvent.change(screen.getByLabelText("Date de naissance"), { target: { value: "2000-01-15" } });
        fireEvent.change(screen.getByLabelText("Ville"), { target: { value: "Paris" } });
        fireEvent.change(screen.getByLabelText("Code Postal"), { target: { value: "75001" } });
    };

    test("toast ciblé quand seul le code postal est invalide (couvre les branches valides)", () => {
        render(<HomePage />);
        fillValid();
        fireEvent.change(screen.getByLabelText("Code Postal"), { target: { value: "12" } });
        fireEvent.submit(screen.getByTestId("registration-form"));
        expect(mockAddUser).not.toHaveBeenCalled();
    });

    test("toast ciblé quand seul le prénom est invalide (couvre la branche CP valide)", () => {
        render(<HomePage />);
        fillValid();
        fireEvent.change(screen.getByLabelText("Prénom"), { target: { value: "J" } });
        fireEvent.submit(screen.getByTestId("registration-form"));
        expect(mockAddUser).not.toHaveBeenCalled();
    });

    test("appelle addUser quand le formulaire est valide", async () => {
        mockAddUser.mockResolvedValue({ id: 1, nom: "Dupont", prenom: "Jean", mail: "jean.dupont@example.com", birth: "2000-01-15", ville: "Paris", cp: "75001" });
        const onUserAdded = vi.fn();
        render(<HomePage onUserAdded={onUserAdded} />);

        fireEvent.change(screen.getByLabelText("Prénom"), { target: { value: "Jean" } });
        fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Dupont" } });
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jean.dupont@example.com" } });
        fireEvent.change(screen.getByLabelText("Date de naissance"), { target: { value: "2000-01-15" } });
        fireEvent.change(screen.getByLabelText("Ville"), { target: { value: "Paris" } });
        fireEvent.change(screen.getByLabelText("Code Postal"), { target: { value: "75001" } });

        fireEvent.click(screen.getByRole("button", { name: /Valider l'inscription/i }));

        await waitFor(() => {
            expect(mockAddUser).toHaveBeenCalled();
            expect(onUserAdded).toHaveBeenCalled();
        });
    });
});
