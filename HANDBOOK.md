
This handbook explains how we built the Abeba restaurant website and why we made the choices we did. It's meant for someone new to the team who needs to build a similar prototype for a client. Most small businesses ask for something like this before they pay for a full website, so the same steps should work for a bakery, a coffee shop or a clothing store.

## 1. Installs

We started with an empty folder and ran:

```bash
npm init -y
npm install express ejs sqlite sqlite3 body-parser bootstrap bootstrap-icons
```

`npm init -y` creates `package.json`, which keeps track of everything the project needs. We also added `"type": "module"` to it so we could use `import` instead of `require`.

What each package does:

- **express** runs the web server and handles the routes.
- **ejs** lets us write HTML pages that can include data from the server.
- **sqlite3** talks to the SQLite database file.
- **sqlite** sits on top of sqlite3 so every database call returns a promise.
- **body-parser** reads the data from the contact form so we can use it.
- **bootstrap** and **bootstrap-icons** give us the layout, cards, buttons, pop-up and icons.

We installed Bootstrap with npm instead of linking to it online, so the site still works without internet.

The `node_modules` folder is listed in `.gitignore`. Anyone can get those files back by running `npm install`, so they don't need to be on GitHub.

## 2. Routes

The routes live in `routes/index.js`. Each one gets the request, asks a controller for data if it needs any, and then shows a page or sends back data.

```js
router.get('/products', async (req, res) => {
  const products = await getAllProducts();
  res.render('pages/products', { title: 'Products', products });
});
```

We have routes for `/products`, `/about` and `/contact`. Going to `/` just redirects to `/products`. There is also `POST /contact` for the form and `GET /api/products/:id` for the price pop-up.

The navbar links come from a list in `routes/navigation.js`, so every page uses the same menu. To add a page, we add a route, add a line to that list and create the view.

## 3. UI with Bootstrap

Every page is built from shared pieces in `views/partials`: `head.ejs` loads the CSS, `header.ejs` is the navbar and `footer.ejs` is the footer. This way we only write them once.

The Products page uses a Bootstrap grid of cards, which is how most online stores show their items:

```html
<div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
```

That gives one card per row on a phone and up to four on a wide screen, without writing any extra CSS. Each card (`product-card.ejs`) has the photo, name, Amharic name, description and a button.

The button opens a Bootstrap modal (pop-up) that is shared by all the cards. We used a few Bootstrap classes on the Contact form too, like `is-invalid` to show errors under each field.

Our own colors and fonts are in `public/css/styles.css`. Everything else comes from Bootstrap.

## 4. How data moves between the page and the server

There are three ways data travels in this app:

1. **Loading a page.** When you open `/products`, the server gets the menu from the database, fills in the EJS template and sends finished HTML to the browser.
2. **Sending the contact form.** The form sends the name, email and message to `POST /contact`. body-parser puts them in `req.body`. The controller checks them, and if something is wrong the page comes back with an error message under that field. If everything is fine, the message is saved to the `contact_messages` table and the page shows "Thank you!"
3. **Clicking Price & Availability.** `public/js/main.js` calls `fetch('/api/products/5')`. The server looks up that dish and sends back JSON with the price. The script then fills in the pop-up with the description and the price.

We check all input on the server, not just in the browser, because browser checks can be skipped.

## 5. How promises coordinate database access

Database calls take time, so they return promises. A promise means "the answer will be ready later."

When the server starts, we use a `.then()` chain so each step waits for the one before it:

```js
let db;
getDbConnection()
  .then((connection) => { db = connection; return db.exec(CREATE_PRODUCTS); })
  .then(() => db.get('SELECT COUNT(*) AS count FROM products'))
  .then(({ count }) => (count > 0 ? count : seedProducts(db)));
```

The tables have to exist before we count the rows, and we only add the menu items if the table is empty. That stops the duplicate rows we had in the class tutorial. The server only starts listening after this whole chain finishes.

In the controllers we use `async` and `await` instead. It does the same thing as `.then()` but reads top to bottom:

```js
export const getAllProducts = async () => {
  const db = await getDbConnection();
  return db.all('SELECT id, slug, name, local_name, description, image FROM products ORDER BY id');
};
```

## 6. How data comes back from the database and gets shown

`db.all()` gives back an array, with one object for each row. For example:

```js
{ id: 4, name: 'Doro Wat', local_name: 'ዶሮ ወጥ', description: '...', image: '/images/doro-wat.jpg' }
```

The route hands that array to `products.ejs`, which loops through it and makes one card for each dish. Inside the card, `<%= product.name %>` prints the value. EJS escapes the text, so even if a name had HTML in it, it would show up as plain text.

For the pop-up, `db.get()` returns just one row. The controller turns the price into text like `$19.95` before sending it, so the browser only has to display it.

