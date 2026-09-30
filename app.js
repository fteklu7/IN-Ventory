//import statements
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import meetings from "./public/data/data.js"

//set up local port connection
const app = express();
const port = 3000;

//set filename default
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
app.use(express.static(_dirname + "/public"));

//set the view engine with app.set
app.set('view enginer', 'ejs');

//get pages

//home page
app.get('/', (req, res) => {
    res.render('pages/index', {data: menu, title: 'Welcome!'});
})

//products/menu
app.get('/products', (req,res) => {
    res.render('pages/products', { data : menu, title: "Our Menu"});
});

//about
app.get('/about', (req,res) => {
    res.render('pages/about', { data : menu, title: "About Us"});
});

//contact
app.get('/contact', (req,res) => {
    res.render('pages/contact', { data : menu, title: "Contact"});
});

//Listen for requests
app.listen(port, () => {
    console.log(`App listening at ${port}`);
});