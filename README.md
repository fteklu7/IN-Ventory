
This is a website for a small Ethiopian restaurant. We built it for our class to show what a restaurant owner might see before paying for a full website. The restaurant itself is made up.

Built with Node.js, Express, EJS, Bootstrap and SQLite.

Made by Michael and Fetume.

## What's on the site

The site has three pages:

- **Products** shows 13 dishes and drinks as cards. Each card has a photo, the dish name, its Amharic name and a short description.
- **About** has a short paragraph about the restaurant and a photo.
- **Contact** has Purdue's address and phone number, plus a form where people can send a message.

Every product card has a **Price & Availability** button. Clicking it opens a pop-up with the description and the price, which comes from the database.

## How to run it

You need Node.js 18 or newer. In a terminal:

```bash
npm install
npm start
```

Then go to http://localhost:3000.

The first time you run it, the app creates the database and adds the menu items to it. If you ever change the menu in `data/products.js`, run `npm run reset-db` so the database picks up the changes.

Other commands:


| `npm run dev` | Restarts the server automatically when you save a file |
| `npm test` | Runs the tests |
| `npm run reset-db` | Deletes and rebuilds the database |

## Folder layout

```
app.js            sets up Express and starts the server
routes/           the URLs for each page, and the menu links
controllers/      the code that talks to the database
database/         creates the database and its tables
data/             the list of menu items
views/            the EJS pages and shared pieces (header, footer, cards)
public/           CSS, the browser JavaScript and the food photos
scripts/          reset-db.js
tests/            the test file
```

### 1. Separation of concerns

We split the code up so each part only does one job. When something needs to change, we know which file to open, and changing one part doesn't break the others.

Here is what happens when someone opens the Products page:

1. The browser asks for `/products`.
2. The route in `routes/index.js` gets the request and asks the controller for the menu.
3. `controllers/productController.js` runs the SQL query and sends back the menu items.
4. The route passes the items to `views/pages/products.ejs`.
5. The view turns each item into a Bootstrap card, and the finished page goes back to the browser.

So routes handle URLs, controllers handle the database, and views handle what the page looks like. The views never touch the database, and the routes never write SQL.

A couple of other things we did:

- The product card, header and footer are each written once in `views/partials` and reused.
- The database file is kept in `database/`, not in `public/`, so nobody can download it from the browser.

### 2. Setting up routes and linking them to the menu

All the routes are in `routes/index.js`:

| URL | What it does |
|---|---|
| `/` | Sends you to `/products` |
| `/products` | Shows the menu cards |
| `/about` | Shows the About page |
| `/contact` | Shows the Contact page and saves the form when it's sent |
| `/api/products/:id` | Sends back the price for one item (used by the pop-up) |

The links in the navbar come from a list in `routes/navigation.js`:

```js
const navLinks = [
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];
```

`app.js` makes this list available to every page. The header (`views/partials/header.ejs`) loops through it and makes a link for each item. It also highlights the page you're currently on.

To add a new page, you add a route in `routes/index.js`, add a line to `navLinks`, and make a new file in `views/pages`.

## Photos

The food photos are in `public/images` and are named after each dish (like `doro-wat.jpg`). To change one, replace the file with a new photo that has the same name. 