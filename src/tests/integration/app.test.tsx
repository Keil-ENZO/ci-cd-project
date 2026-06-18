import { test, expect, describe, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../../App";

vi.mock("../../lib/api", () => ({
    countUsers: vi.fn(),
    addUser: vi.fn(),
    getUsers: vi.fn(),
    getUsersDetails: vi.fn(),
    login: vi.fn(),
    deleteUser: vi.fn(),
}));

import { countUsers, addUser, getUsers, getUsersDetails, login, deleteUser } from "../../lib/api";

const mockCountUsers = vi.mocked(countUsers);
const mockAddUser = vi.mocked(addUser);
const mockGetUsers = vi.mocked(getUsers);
const mockGetUsersDetails = vi.mocked(getUsersDetails);
const mockLogin = vi.mocked(login);
const mockDeleteUser = vi.mocked(deleteUser);

beforeEach(() => {
    mockGetUsers.mockResolvedValue([]);
});

describe("Integration - Chargement du compteur d'utilisateurs", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetUsers.mockResolvedValue([]);
    });

    test("affiche le nombre d'utilisateurs retourné par l'API", async () => {
        mockCountUsers.mockResolvedValue(5);

        render(<App />);

        await waitFor(() => {
            expect(screen.getByText("5 user(s) already registered")).toBeInTheDocument();
        });
    });

    test("affiche un message d'erreur si l'API échoue au chargement", async () => {
        mockCountUsers.mockRejectedValue(new Error("Network Error"));

        render(<App />);

        await waitFor(() => {
            expect(screen.getByTestId("load-error")).toBeInTheDocument();
        });
    });
});

describe("Integration - Inscription avec succès", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCountUsers.mockResolvedValue(3);
        mockAddUser.mockResolvedValue({ id: 11, nom: "Dupont", prenom: "Jean", mail: "jean@test.com", birth: "2000-01-15", ville: "Paris", cp: "75001" });
    });

    test("appelle addUser et incrémente le compteur après une inscription valide", async () => {
        render(<App />);

        await waitFor(() => screen.getByText("3 user(s) already registered"));

        fireEvent.change(screen.getByLabelText("Prénom"), { target: { value: "Jean" } });
        fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Dupont" } });
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jean.dupont@example.com" } });
        fireEvent.change(screen.getByLabelText("Date de naissance"), { target: { value: "2000-01-15" } });
        fireEvent.change(screen.getByLabelText("Ville"), { target: { value: "Paris" } });
        fireEvent.change(screen.getByLabelText("Code Postal"), { target: { value: "75001" } });

        const submitButton = screen.getByRole("button", { name: /Valider l'inscription/i });
        expect(submitButton).not.toBeDisabled();
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockAddUser).toHaveBeenCalledWith({
                nom: "Dupont",
                prenom: "Jean",
                mail: "jean.dupont@example.com",
                birth: "2000-01-15",
                ville: "Paris",
                cp: "75001",
            });
        });

        await waitFor(() => {
            expect(screen.getByText("4 user(s) already registered")).toBeInTheDocument();
        });
    });

    test("réinitialise le formulaire après une inscription réussie", async () => {
        render(<App />);

        await waitFor(() => screen.getByText("3 user(s) already registered"));

        const prenomInput = screen.getByLabelText("Prénom") as HTMLInputElement;
        fireEvent.change(prenomInput, { target: { value: "Jean" } });
        fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Dupont" } });
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jean.dupont@example.com" } });
        fireEvent.change(screen.getByLabelText("Date de naissance"), { target: { value: "2000-01-15" } });
        fireEvent.change(screen.getByLabelText("Ville"), { target: { value: "Paris" } });
        fireEvent.change(screen.getByLabelText("Code Postal"), { target: { value: "75001" } });

        fireEvent.click(screen.getByRole("button", { name: /Valider l'inscription/i }));

        await waitFor(() => {
            expect(prenomInput.value).toBe("");
        });
    });
});

describe("Integration - Inscription avec erreur API", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCountUsers.mockResolvedValue(2);
        mockAddUser.mockRejectedValue(new Error("500 Internal Server Error"));
    });

    test("affiche un toast d'erreur serveur si addUser échoue", async () => {
        render(<App />);

        await waitFor(() => screen.getByText("2 user(s) already registered"));

        fireEvent.change(screen.getByLabelText("Prénom"), { target: { value: "Jean" } });
        fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Dupont" } });
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jean.dupont@example.com" } });
        fireEvent.change(screen.getByLabelText("Date de naissance"), { target: { value: "2000-01-15" } });
        fireEvent.change(screen.getByLabelText("Ville"), { target: { value: "Paris" } });
        fireEvent.change(screen.getByLabelText("Code Postal"), { target: { value: "75001" } });

        fireEvent.click(screen.getByRole("button", { name: /Valider l'inscription/i }));

        await waitFor(() => {
            expect(screen.getByText("Erreur serveur")).toBeInTheDocument();
        });
    });

    test("ne modifie pas le compteur si addUser échoue", async () => {
        render(<App />);

        await waitFor(() => screen.getByText("2 user(s) already registered"));

        fireEvent.change(screen.getByLabelText("Prénom"), { target: { value: "Jean" } });
        fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Dupont" } });
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jean.dupont@example.com" } });
        fireEvent.change(screen.getByLabelText("Date de naissance"), { target: { value: "2000-01-15" } });
        fireEvent.change(screen.getByLabelText("Ville"), { target: { value: "Paris" } });
        fireEvent.change(screen.getByLabelText("Code Postal"), { target: { value: "75001" } });

        fireEvent.click(screen.getByRole("button", { name: /Valider l'inscription/i }));

        await waitFor(() => expect(mockAddUser).toHaveBeenCalled());

        expect(screen.getByText("2 user(s) already registered")).toBeInTheDocument();
    });
});

describe("Integration - Espace administrateur", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCountUsers.mockResolvedValue(1);
        mockGetUsers.mockResolvedValue([{ id: 1, nom: "Keil", prenom: "Enzo", ville: "Grasse" }]);
        mockLogin.mockResolvedValue({ token: "jwt-token", is_admin: true, mail: "loise.fenoll@ynov.com" });
        mockGetUsersDetails.mockResolvedValue([
            { id: 1, nom: "Keil", prenom: "Enzo", mail: "enzo@test.com", birth: "2004-11-20", ville: "Grasse", cp: "06130", is_admin: 0 },
        ]);
        mockDeleteUser.mockResolvedValue();
    });

    test("connexion admin, suppression d'un inscrit, puis déconnexion", async () => {
        render(<App />);

        fireEvent.change(screen.getByLabelText("Email administrateur"), { target: { value: "loise.fenoll@ynov.com" } });
        fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "secret" } });
        fireEvent.click(screen.getByTestId("login-button"));

        await waitFor(() => {
            expect(screen.getByTestId("admin-banner")).toBeInTheDocument();
        });
        expect(mockLogin).toHaveBeenCalledWith("loise.fenoll@ynov.com", "secret");

        await waitFor(() => {
            expect(screen.getByText(/enzo@test.com/)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId("delete-user-1"));
        await waitFor(() => {
            expect(mockDeleteUser).toHaveBeenCalledWith(1, "jwt-token");
        });

        fireEvent.click(screen.getByTestId("logout-button"));
        await waitFor(() => {
            expect(screen.queryByTestId("admin-banner")).not.toBeInTheDocument();
        });
    });
});

describe("Integration - Formulaire invalide", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCountUsers.mockResolvedValue(0);
    });

    test("n'appelle pas addUser si le formulaire est invalide", async () => {
        render(<App />);

        const submitButton = screen.getByRole("button", { name: /Valider l'inscription/i });
        expect(submitButton).toBeDisabled();

        fireEvent.submit(screen.getByTestId("registration-form"));

        expect(mockAddUser).not.toHaveBeenCalled();
    });

    test("désactive le bouton si l'utilisateur est mineur", async () => {
        render(<App />);

        const currentYear = new Date().getFullYear();
        fireEvent.change(screen.getByLabelText("Prénom"), { target: { value: "Jean" } });
        fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Dupont" } });
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jean@test.com" } });
        fireEvent.change(screen.getByLabelText("Date de naissance"), { target: { value: `${currentYear}-01-01` } });
        fireEvent.change(screen.getByLabelText("Ville"), { target: { value: "Paris" } });
        fireEvent.change(screen.getByLabelText("Code Postal"), { target: { value: "75001" } });

        const submitButton = screen.getByRole("button", { name: /Valider l'inscription/i });
        expect(submitButton).toBeDisabled();
        expect(mockAddUser).not.toHaveBeenCalled();
    });
});
