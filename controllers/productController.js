import { getDbConnection } from '../database.js';

// Turns the quantity into the text shown in the pop-up
export const availabilityFor = (qty) => {
  if (qty <= 0) return { status: 'sold-out', label: 'Sold out today' };
  if (qty <= 5) return { status: 'limited', label: `Only ${qty} left today` };
  return { status: 'available', label: 'Available now' };
};

// Price isn't loaded here. The button gets it separately.
const CARD_COLUMNS = 'id, slug, name, local_name, description, image';

export const getAllProducts = async () => {
  const db = await getDbConnection();
  return db.all(`SELECT ${CARD_COLUMNS} FROM products ORDER BY id`);
};

// Price and availability for one item
export const getProductDetails = async (id) => {
  const db = await getDbConnection();
  const row = await db.get(
    'SELECT id, name, price, quantity_available, is_alcoholic FROM products WHERE id = ?',
    id,
  );
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    priceFormatted: `$${row.price.toFixed(2)}`,
    quantityAvailable: row.quantity_available,
    ageRestricted: row.is_alcoholic === 1,
    ...availabilityFor(row.quantity_available),
  };
};
