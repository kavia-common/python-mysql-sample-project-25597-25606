import { apiClient, getApiBaseUrl } from "./client";

describe("api client", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test("getApiBaseUrl prefers REACT_APP_API_BASE over REACT_APP_BACKEND_URL", () => {
    process.env.REACT_APP_API_BASE = "http://localhost:3001/";
    process.env.REACT_APP_BACKEND_URL = "http://localhost:9999/";
    expect(getApiBaseUrl()).toBe("http://localhost:3001");
  });

  test("throws a helpful error if base url is not configured", async () => {
    delete process.env.REACT_APP_API_BASE;
    delete process.env.REACT_APP_BACKEND_URL;

    await expect(apiClient.listUsers()).rejects.toThrow(/not configured/i);
  });

  test("surfaces backend error message on non-2xx response", async () => {
    process.env.REACT_APP_API_BASE = "http://example.test";

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ message: "Bad request" }),
    });

    await expect(apiClient.listUsers()).rejects.toThrow("Bad request");
    expect(global.fetch).toHaveBeenCalled();
  });
});
