import { Router } from 'express';
import {
  getAllProducts, getProductDetails,
} from '../controllers/productController.js';
import { validateContact, saveContactMessage } from '../controllers/contactController.js';

const router = Router();

router.get('/', (req, res) => res.redirect('/products'));

router.get('/products', async (req, res) => {
  const products = await getAllProducts();
  res.render('pages/products', {
    title: 'Products', products,
  });
});

router.get('/about', (req, res) => {
  res.render('pages/about', { title: 'About' });
});

router.get('/contact', (req, res) => {
  res.render('pages/contact', {
    title: 'Contact', values: {}, errors: {}, sent: req.query.sent === '1',
  });
});

router.post('/contact', async (req, res) => {
  const { values, errors } = validateContact(req.body);
  if (Object.keys(errors).length > 0) {
    // Show the form again with the errors and what they typed
    return res.status(422).render('pages/contact', {
      title: 'Contact', values, errors, sent: false,
    });
  }
  await saveContactMessage(values);
  // Redirect so refreshing the page doesn't send the form twice
  res.redirect(303, '/contact?sent=1');
});

// Used by the Price & Availability button
router.get('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Product id must be a positive whole number.' });
  }
  const details = await getProductDetails(id);
  if (!details) return res.status(404).json({ error: 'Product not found.' });
  res.json(details);
});

export default router;
