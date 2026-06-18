import { test, expect, describe, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "../../components/LoginForm";

vi.mock("../../lib/api", () => ({
    login: vi.fn(),
}));

import { login } from "../../lib/api";

const mockLogin = vi.mocked(login);

describe("LoginForm - non authentifié", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("affiche le formulaire de connexion", () => {
        render(<LoginForm isAuthenticated={false} onLogin={vi.fn()} onLogout={vi.fn()} />);
        expect(screen.getByTestId("login-form")).toBeInTheDocument();
        expect(screen.getByLabelText("Email administrateur")).toBeInTheDocument();
        expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
    });

    test("appelle login et onLogin lors d'une connexion réussie", async () => {
        mockLogin.mockResolvedValue({ token: "jwt-token", is_admin: true, mail: "loise.fenoll@ynov.com" });
        const onLogin = vi.fn();

        render(<LoginForm isAuthenticated={false} onLogin={onLogin} onLogout={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("Email administrateur"), { target: { value: "loise.fenoll@ynov.com" } });
        fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "secret" } });
        fireEvent.click(screen.getByTestId("login-button"));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith("loise.fenoll@ynov.com", "secret");
        });
        await waitFor(() => {
            expect(onLogin).toHaveBeenCalledWith("jwt-token", "loise.fenoll@ynov.com");
        });
    });

    test("n'appelle pas onLogin si les identifiants sont invalides", async () => {
        mockLogin.mockRejectedValue(new Error("401"));
        const onLogin = vi.fn();

        render(<LoginForm isAuthenticated={false} onLogin={onLogin} onLogout={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("Email administrateur"), { target: { value: "bad@test.com" } });
        fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "wrong" } });
        fireEvent.click(screen.getByTestId("login-button"));

        await waitFor(() => expect(mockLogin).toHaveBeenCalled());
        expect(onLogin).not.toHaveBeenCalled();
    });
});

describe("LoginForm - authentifié", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("affiche la bannière admin et déclenche onLogout", () => {
        const onLogout = vi.fn();
        render(
            <LoginForm
                isAuthenticated={true}
                adminMail="loise.fenoll@ynov.com"
                onLogin={vi.fn()}
                onLogout={onLogout}
            />
        );

        expect(screen.getByTestId("admin-banner")).toBeInTheDocument();
        expect(screen.getByText("loise.fenoll@ynov.com")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("logout-button"));
        expect(onLogout).toHaveBeenCalled();
    });
});
