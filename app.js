import express from 'express';
import bodyParser from 'body-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupDatabase } from './database.js';
import router from './routes/index.js';
import navLinks from './routes/navigation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

export const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Values every page can use
app.locals.siteName = 'Abeba';
app.locals.navLinks = navLinks;
app.locals.aboutImage = '/images/about.jpg';
app.use((req, res, next) => {
  res.locals.currentPath = req.path; // used to highlight the active menu link
  next();
});

// Block the database folder so the .db file can't be downloaded
app.use('/database', (req, res) => res.sendStatus(404));
app.use(express.static(path.join(__dirname, 'public')));
// Bootstrap is served from node_modules so it works offline
app.use('/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/vendor/bootstrap-icons', express.static(path.join(__dirname, 'node_modules/bootstrap-icons/font')));

// Reads form data into req.body
app.use(bodyParser.urlencoded({ extended: false, limit: '10kb' }));
app.use(bodyParser.json({ limit: '10kb' }));

app.use('/', router);

// 404 page
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found.' });
  res.status(404).render('pages/404', { title: 'Page not found' });
});

// Error page
app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith('/api/')) return res.status(500).json({ error: 'Internal server error.' });
  res.status(500).render('pages/500', { title: 'Something went wrong' });
});

// Only start the server when run with `node app.js` (not when the tests import it).
// The database is set up first, then the server starts.
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  setupDatabase()
    .then(() => {
      app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
    })
    .catch((err) => {
      console.error('Could not set up the database. Server not started.', err);
      process.exit(1);
    });
}
