import { getDbConnection } from '../database.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = { name: 80, email: 120, message: 1000 };

// Checks the contact form. Returns any errors by field name.
export const validateContact = (body = {}) => {
  const values = {
    name: String(body.name ?? '').trim(),
    email: String(body.email ?? '').trim(),
    message: String(body.message ?? '').trim(),
  };
  const errors = {};

  if (!values.name) errors.name = 'Please tell us your name.';
  else if (values.name.length > LIMITS.name) errors.name = `Name must be ${LIMITS.name} characters or fewer.`;

  if (!EMAIL_RE.test(values.email)) errors.email = 'Please enter a valid email address.';
  else if (values.email.length > LIMITS.email) errors.email = 'Email address is too long.';

  if (values.message.length < 5) errors.message = 'Please write a short message (at least 5 characters).';
  else if (values.message.length > LIMITS.message) errors.message = `Message must be ${LIMITS.message} characters or fewer.`;

  return { values, errors };
};

export const saveContactMessage = async ({ name, email, message }) => {
  const db = await getDbConnection();
  const result = await db.run(
    'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
    name, email, message,
  );
  return result.lastID;
};
