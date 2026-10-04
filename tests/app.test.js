// Run with: npm test
// Uses a temporary in-memory database so the real one isn't changed.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.DB_FILE = ':memory:';

const { app } = await import('../app.js');
const { setupDatabase, closeDatabase, getDbConnection } = await import('../database.js');
const { availabilityFor } = await import('../controllers/productController.js');
const { validateContact } = await import('../controllers/contactController.js');
const { default: seed } = await import('../data/products.js');

let server;
let base;

before(async () => {
  await setupDatabase();
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((r) => server.close(r));
  await closeDatabase();
});

const get = (path) => fetch(base + path, { redirect: 'manual' });
const postForm = (path, fields) => fetch(base + path, {
  method: 'POST',
  redirect: 'manual',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams(fields),
});

// database
test('seed data has at least 10 products with unique slugs', () => {
  assert.ok(seed.length >= 10 && seed.length <= 13);
  assert.equal(new Set(seed.map((p) => p.slug)).size, seed.length);
});

test('setupDatabase is idempotent (no duplicate rows on restart)', async () => {
  await setupDatabase();
  await setupDatabase();
  const db = await getDbConnection();
  const { count } = await db.get('SELECT COUNT(*) AS count FROM products');
  assert.equal(count, seed.length);
});

// pages
for (const [path, text] of [
  ['/products', 'Traditional Ethiopian food'],
  ['/about', 'About Us'],
  ['/contact', '610 Purdue Mall'],
]) {
  test(`GET ${path} renders`, async () => {
    const res = await get(path);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, new RegExp(text));
    assert.match(html, /aria-current="page"/, 'active menu item is marked');
  });
}

test('products page renders one card per product with an image and a button', async () => {
  const html = await (await get('/products')).text();
  assert.equal((html.match(/class="card h-100 product-card/g) || []).length, seed.length);
  assert.equal((html.match(/js-details-btn/g) || []).length, seed.length);
  assert.match(html, /src="\/images\/doro-wat\.jpg"/);
  assert.equal((html.match(/id="productModal"/g) || []).length, 1);
  assert.doesNotMatch(html, /productModalImage/, 'pop-up has no photo');
  assert.doesNotMatch(html, /\$19\.95/);
});

test('products page has no category filter, badges or spice level', async () => {
  const html = await (await get('/products?category=Traditional%20Drinks')).text();
  assert.equal((html.match(/class="card h-100 product-card/g) || []).length, seed.length, 'query string is ignored');
  assert.doesNotMatch(html, /category-pills|badge-category|badge-spice|bi-fire/);
  assert.doesNotMatch(html, /Tap <strong>Price/);
});

test('root URL redirects to the Products page', async () => {
  const res = await get('/');
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('location'), '/products');
});

test('menu has exactly Products, About and Contact, and footer shows the authors', async () => {
  const html = await (await get('/about')).text();
  const links = [...html.matchAll(/class="nav-link[^"]*" href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(links, ['/products', '/about', '/contact']);
  assert.match(html, /Made by Michael and Fetume/);
});

test('unknown page returns 404', async () => {
  assert.equal((await get('/does-not-exist')).status, 404);
});

test('database file is not publicly downloadable', async () => {
  assert.equal((await get('/database/abeba.db')).status, 404);
  assert.equal((await get('/abeba.db')).status, 404);
});

test('static assets are served (css, js, bootstrap, image)', async () => {
  for (const p of ['/css/styles.css', '/js/main.js', '/vendor/bootstrap/css/bootstrap.min.css', '/images/injera.jpg', '/images/about.jpg']) {
    assert.equal((await get(p)).status, 200, p);
  }
});

// JSON API
test('GET /api/products/:id returns price and availability', async () => {
  const res = await get('/api/products/1');
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.name, 'Injera');
  assert.equal(body.priceFormatted, '$3.50');
  assert.equal(body.status, 'available');
});

test('sold-out and limited items are flagged', async () => {
  const db = await getDbConnection();
  const fossolia = await db.get("SELECT id FROM products WHERE slug = 'fossolia'");
  const kitfo = await db.get("SELECT id FROM products WHERE slug = 'kitfo'");
  assert.equal((await (await get(`/api/products/${fossolia.id}`)).json()).status, 'sold-out');
  const k = await (await get(`/api/products/${kitfo.id}`)).json();
  assert.equal(k.status, 'limited');
  assert.equal(k.ageRestricted, false);
});

test('pop-up script shows both price and availability', async () => {
  const js = await (await get('/js/main.js')).text();
  assert.match(js, /Price: \$\{d\.priceFormatted\} · \$\{d\.label\}/);
});

test('every product has a photo file that exists', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  for (const p of seed) {
    assert.equal(p.image, `/images/${p.slug}.jpg`);
    assert.ok(fs.existsSync(path.join(import.meta.dirname, '..', 'public', p.image)), `missing ${p.image}`);
  }
});

for (const bad of ['abc', '0', '-1', '1.5', '1;DROP TABLE products']) {
  test(`GET /api/products/${bad} -> 400`, async () => {
    const res = await get(`/api/products/${encodeURIComponent(bad)}`);
    assert.equal(res.status, 400);
    assert.ok((await res.json()).error);
  });
}

test('GET /api/products/99999 -> 404 JSON', async () => {
  const res = await get('/api/products/99999');
  assert.equal(res.status, 404);
  assert.equal((await res.json()).error, 'Product not found.');
});

// contact form
test('valid contact form is saved and redirects (Post/Redirect/Get)', async () => {
  const res = await postForm('/contact', {
    name: 'Selam', email: 'selam@example.com', message: 'Do you cater events on Friday?',
  });
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), '/contact?sent=1');
  const db = await getDbConnection();
  const row = await db.get('SELECT * FROM contact_messages ORDER BY id DESC LIMIT 1');
  assert.equal(row.email, 'selam@example.com');
  assert.equal(row.message, 'Do you cater events on Friday?');
});

test('contact form has no party size field', async () => {
  assert.doesNotMatch(await (await get('/contact')).text(), /partySize|Party size/);
});

test('invalid contact form re-renders with errors and keeps input', async () => {
  const res = await postForm('/contact', { name: 'Abebe', email: 'not-an-email', message: 'hi' });
  assert.equal(res.status, 422);
  const html = await res.text();
  assert.match(html, /Please enter a valid email address/);
  assert.match(html, /value="Abebe"/);
});

test('user input is HTML-escaped when re-rendered (no XSS)', async () => {
  const res = await postForm('/contact', { name: '<script>alert(1)</script>', email: 'x', message: 'x' });
  const html = await res.text();
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /&lt;script&gt;/);
});

// units
test('availabilityFor thresholds', () => {
  assert.equal(availabilityFor(0).status, 'sold-out');
  assert.equal(availabilityFor(-3).status, 'sold-out');
  assert.equal(availabilityFor(1).status, 'limited');
  assert.equal(availabilityFor(5).status, 'limited');
  assert.equal(availabilityFor(6).status, 'available');
});

test('validateContact edge cases', () => {
  assert.deepEqual(validateContact({ name: 'A', email: 'a@b.co', message: 'hello' }).errors, {});
  assert.ok(validateContact({}).errors.name);
  assert.ok(validateContact({ name: '   ' }).errors.name, 'whitespace-only name rejected');
  assert.ok(validateContact({ message: 'x'.repeat(1001) }).errors.message);
});
