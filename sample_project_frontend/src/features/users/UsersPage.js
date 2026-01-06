import React, { useEffect, useMemo, useState } from "react";
import { apiClient, getApiBaseUrl } from "../../api/client";
import { validateUser } from "./validation";

/**
 * Normalizes the backend response into a user array.
 * We accept either:
 * - Array<User>
 * - { users: Array<User> }
 */
function normalizeUsers(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.users)) return payload.users;
  return [];
}

function emptyForm() {
  return { name: "", email: "" };
}

// PUBLIC_INTERFACE
export default function UsersPage() {
  /** Users CRUD UI: list, create, update, delete with validation and request states. */
  const apiBase = useMemo(() => getApiBaseUrl(), []);
  const [users, setUsers] = useState([]);

  const [listState, setListState] = useState({ loading: false, error: null });
  const [mutState, setMutState] = useState({ loading: false, error: null });

  const [mode, setMode] = useState("create"); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [values, setValues] = useState(emptyForm());
  const [errors, setErrors] = useState({});

  async function refresh() {
    setListState({ loading: true, error: null });
    try {
      const payload = await apiClient.listUsers();
      setUsers(normalizeUsers(payload));
      setListState({ loading: false, error: null });
    } catch (e) {
      setListState({ loading: false, error: e?.message || "Failed to load users." });
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function startCreate() {
    setMode("create");
    setEditingId(null);
    setValues(emptyForm());
    setErrors({});
    setMutState({ loading: false, error: null });
  }

  function startEdit(user) {
    setMode("edit");
    setEditingId(user.id ?? user.user_id ?? user._id);
    setValues({
      name: user.name ?? "",
      email: user.email ?? "",
    });
    setErrors({});
    setMutState({ loading: false, error: null });
  }

  function onChange(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const result = validateUser(values);
    setErrors(result.errors);
    if (!result.valid) return;

    setMutState({ loading: true, error: null });
    try {
      if (mode === "create") {
        await apiClient.createUser(values);
      } else {
        await apiClient.updateUser(editingId, values);
      }
      setMutState({ loading: false, error: null });
      startCreate();
      await refresh();
    } catch (err) {
      setMutState({ loading: false, error: err?.message || "Request failed." });
    }
  }

  async function onDelete(id) {
    const ok = window.confirm("Delete this user? This action cannot be undone.");
    if (!ok) return;

    setMutState({ loading: true, error: null });
    try {
      await apiClient.deleteUser(id);
      setMutState({ loading: false, error: null });
      await refresh();
    } catch (err) {
      setMutState({ loading: false, error: err?.message || "Delete failed." });
    }
  }

  return (
    <div className="shell">
      <nav className="topnav" aria-label="Top navigation">
        <div className="topnav-inner">
          <div className="brand" aria-label="Application brand">
            <div className="brand-badge" aria-hidden="true" />
            <div>
              <p className="brand-title">Ocean Professional</p>
              <p className="brand-subtitle">Users Admin</p>
            </div>
          </div>

          <div className="badge" title="Backend base URL">
            <span className="badge-dot" aria-hidden="true" />
            <span>
              API: <span className="kbd">{apiBase || "not set"}</span>
            </span>
          </div>
        </div>
      </nav>

      <main className="main">
        <section className="card" aria-label="Users list">
          <div className="card-header">
            <h1 className="h1">Users</h1>
            <p className="p-muted">
              Manage users via <span className="kbd">/api/users</span>. All actions show loading and
              error states.
            </p>
          </div>

          <div className="card-body">
            {listState.error && (
              <div className="alert alert-error" role="alert">
                {listState.error}
              </div>
            )}

            {listState.loading ? (
              <div className="alert alert-info" role="status" aria-live="polite">
                Loading users…
              </div>
            ) : users.length === 0 ? (
              <div className="alert alert-info" role="status">
                No users yet. Create one using the form.
              </div>
            ) : (
              <table className="table" aria-label="Users table">
                <thead>
                  <tr>
                    <th style={{ width: "16%" }}>ID</th>
                    <th style={{ width: "32%" }}>Name</th>
                    <th style={{ width: "34%" }}>Email</th>
                    <th style={{ width: "18%", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const id = u.id ?? u.user_id ?? u._id;
                    return (
                      <tr key={String(id ?? u.email ?? u.name)}>
                        <td>{id ?? "—"}</td>
                        <td>{u.name ?? "—"}</td>
                        <td>{u.email ?? "—"}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              className="btn btn-ghost"
                              onClick={() => startEdit(u)}
                              disabled={mutState.loading}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => onDelete(id)}
                              disabled={mutState.loading || id === undefined || id === null}
                              title={
                                id === undefined || id === null
                                  ? "Cannot delete without an id field from backend."
                                  : "Delete user"
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <aside className="card" aria-label="User form">
          <div className="card-header">
            <h2 className="h1" style={{ fontSize: 18 }}>
              {mode === "create" ? "Create user" : "Edit user"}
            </h2>
            <p className="p-muted">
              {mode === "create"
                ? "Provide name and email to create a new user."
                : "Update the selected user's details."}
            </p>
          </div>

          <div className="card-body">
            {mutState.error && (
              <div className="alert alert-error" role="alert">
                {mutState.error}
              </div>
            )}

            <form onSubmit={onSubmit}>
              <div className="field">
                <label className="label" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  className="input"
                  value={values.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="e.g. Ada Lovelace"
                  autoComplete="name"
                  disabled={mutState.loading}
                />
                {errors.name ? <div className="error-text">{errors.name}</div> : null}
              </div>

              <div className="field">
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="input"
                  value={values.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  placeholder="e.g. ada@example.com"
                  autoComplete="email"
                  disabled={mutState.loading}
                />
                {errors.email ? <div className="error-text">{errors.email}</div> : null}
              </div>

              {mode === "edit" ? (
                <div className="help" style={{ marginBottom: 12 }}>
                  Editing ID: <span className="kbd">{String(editingId)}</span>
                </div>
              ) : null}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                {mode === "edit" ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={startCreate}
                    disabled={mutState.loading}
                  >
                    Cancel
                  </button>
                ) : null}
                <button type="submit" className="btn btn-primary" disabled={mutState.loading}>
                  {mutState.loading
                    ? mode === "create"
                      ? "Creating…"
                      : "Saving…"
                    : mode === "create"
                      ? "Create user"
                      : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </aside>
      </main>
    </div>
  );
}
