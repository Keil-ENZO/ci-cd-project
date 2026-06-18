import { test, expect, describe, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UsersList } from "../../components/UsersList";

vi.mock("../../lib/api", () => ({
    getUsers: vi.fn(),
    getUsersDetails: vi.fn(),
    deleteUser: vi.fn(),
}));

import { getUsers, getUsersDetails, deleteUser } from "../../lib/api";

const mockGetUsers = vi.mocked(getUsers);
const mockGetUsersDetails = vi.mocked(getUsersDetails);
const mockDeleteUser = vi.mocked(deleteUser);

describe("UsersList - visiteur (non admin)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("affiche la liste réduite et n'expose pas les infos privées", async () => {
        mockGetUsers.mockResolvedValue([
            { id: 1, nom: "Keil", prenom: "Enzo", ville: "Grasse" },
        ]);

        render(<UsersList token={null} refreshKey={0} />);

        await waitFor(() => {
            expect(screen.getByText(/Enzo Keil/)).toBeInTheDocument();
        });
        expect(mockGetUsers).toHaveBeenCalled();
        expect(mockGetUsersDetails).not.toHaveBeenCalled();
        expect(screen.queryByTestId("delete-user-1")).not.toBeInTheDocument();
    });

    test("affiche un message quand aucun utilisateur", async () => {
        mockGetUsers.mockResolvedValue([]);
        render(<UsersList token={null} refreshKey={0} />);
        await waitFor(() => {
            expect(screen.getByText(/Aucun utilisateur inscrit/)).toBeInTheDocument();
        });
    });

    test("affiche une erreur si le chargement échoue", async () => {
        mockGetUsers.mockRejectedValue(new Error("Network Error"));
        render(<UsersList token={null} refreshKey={0} />);
        await waitFor(() => {
            expect(screen.getByTestId("users-error")).toBeInTheDocument();
        });
    });
});

describe("UsersList - administrateur", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("affiche les infos privées et permet la suppression", async () => {
        mockGetUsersDetails.mockResolvedValue([
            { id: 1, nom: "Keil", prenom: "Enzo", mail: "enzo@test.com", birth: "2004-11-20", ville: "Grasse", cp: "06130", is_admin: 0 },
        ]);
        mockDeleteUser.mockResolvedValue();
        const onChange = vi.fn();

        render(<UsersList token="jwt-token" refreshKey={0} onChange={onChange} />);

        await waitFor(() => {
            expect(screen.getByText(/enzo@test.com/)).toBeInTheDocument();
        });
        expect(mockGetUsersDetails).toHaveBeenCalledWith("jwt-token");

        fireEvent.click(screen.getByTestId("delete-user-1"));

        await waitFor(() => {
            expect(mockDeleteUser).toHaveBeenCalledWith(1, "jwt-token");
        });
        await waitFor(() => {
            expect(onChange).toHaveBeenCalled();
        });
    });
});
