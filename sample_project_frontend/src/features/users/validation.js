// PUBLIC_INTERFACE
export function validateUser(values) {
  /** Validate user payload. Returns { valid, errors }. */
  const errors = {};

  const name = (values.name || "").trim();
  const email = (values.email || "").trim();

  if (!name) errors.name = "Name is required.";
  if (name.length > 80) errors.name = "Name must be 80 characters or less.";

  if (!email) errors.email = "Email is required.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
