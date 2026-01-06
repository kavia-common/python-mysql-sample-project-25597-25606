import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UsersPage from "./UsersPage";

jest.mock("../../api/client", () => {
  return {
    getApiBaseUrl: () => "http://example.test",
    apiClient: {
      listUsers: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    },
  };
});

const { apiClient } = require("../../api/client");

describe("UsersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows loading and then empty state", async () => {
    apiClient.listUsers.mockResolvedValueOnce([]);

    render(<UsersPage />);

    expect(screen.getByText(/Loading users/i)).toBeInTheDocument();

    await waitFor(() => expect(apiClient.listUsers).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/No users yet/i)).toBeInTheDocument();
  });

  test("validates before create", async () => {
    apiClient.listUsers.mockResolvedValueOnce([]);

    render(<UsersPage />);

    // Wait initial load
    await waitFor(() => expect(apiClient.listUsers).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: /Create user/i }));

    expect(await screen.findByText(/Name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Email is required/i)).toBeInTheDocument();
    expect(apiClient.createUser).not.toHaveBeenCalled();
  });

  test("creates user with valid input", async () => {
    apiClient.listUsers.mockResolvedValueOnce([]);
    apiClient.createUser.mockResolvedValueOnce({ id: 1, name: "Ada", email: "ada@example.com" });
    apiClient.listUsers.mockResolvedValueOnce([{ id: 1, name: "Ada", email: "ada@example.com" }]);

    render(<UsersPage />);

    await waitFor(() => expect(apiClient.listUsers).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "ada@example.com" } });

    fireEvent.click(screen.getByRole("button", { name: /Create user/i }));

    await waitFor(() => expect(apiClient.createUser).toHaveBeenCalledTimes(1));
    expect(apiClient.createUser).toHaveBeenCalledWith({ name: "Ada", email: "ada@example.com" });
  });
});
