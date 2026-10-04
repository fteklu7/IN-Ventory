// Menu items that get added to the products table

const products = [
  // Breads & Starters
  {
    slug: 'injera', name: 'Injera', local_name: 'እንጀራ', category: 'Breads & Starters',
    description: 'Our spongy, slightly sour flatbread made from 100% teff and fermented for three days. It is your plate, your utensil and your side - all in one.',
    price: 3.5, quantity_available: 120, is_vegan: 1, is_alcoholic: 0,
  },
  {
    slug: 'kitcha', name: 'Kitcha', local_name: 'ቂጣ', category: 'Breads & Starters',
    description: 'Unleavened wheat flatbread griddled until golden and brushed with spiced clarified butter.',
    price: 4.0, quantity_available: 30, is_vegan: 0, is_alcoholic: 0,
  },
  {
    slug: 'sambusa', name: 'Sambusa (3 pcs)', local_name: 'ሳምቡሳ', category: 'Breads & Starters',
    description: 'Crisp, hand-folded pastry triangles stuffed with green lentils, onion, garlic and green chili.',
    price: 6.5, quantity_available: 40, is_vegan: 1, is_alcoholic: 0,
  },

  // Meat Specialties
  {
    slug: 'doro-wat', name: 'Doro Wat', local_name: 'ዶሮ ወጥ', category: 'Meat Specialties',
    description: 'The national dish: chicken drumsticks slow-simmered for hours in berbere and niter kibbeh, served with a hard-boiled egg.',
    price: 19.95, quantity_available: 18, is_vegan: 0, is_alcoholic: 0,
  },
  {
    slug: 'key-wat', name: 'Siga Wat (Key Wat)', local_name: 'ሥጋ ወጥ', category: 'Meat Specialties',
    description: 'Tender cubes of beef stewed in a deep red berbere sauce with caramelized onions.',
    price: 17.95, quantity_available: 22, is_vegan: 0, is_alcoholic: 0,
  },
  {
    slug: 'kitfo', name: 'Kitfo', local_name: 'ክትፎ', category: 'Meat Specialties',
    description: 'Finely minced lean beef dressed in mitmita and spiced butter, served with ayib and gomen. Traditionally raw; ask for it leb leb (lightly warmed) or fully cooked.',
    price: 18.95, quantity_available: 5, is_vegan: 0, is_alcoholic: 0,
  },
  {
    slug: 'beef-tibs', name: 'Derek Tibs', local_name: 'ደረቅ ጥብስ', category: 'Meat Specialties',
    description: 'Pan-fried cubes of beef, crisped in spiced butter with onion, rosemary, jalapeno and garlic, brought to the table in a hot clay dish.',
    price: 17.5, quantity_available: 25, is_vegan: 0, is_alcoholic: 0,
  },

  // Vegetarian (Tsom / Fasting)
  {
    slug: 'shiro-wat', name: 'Shiro Wat', local_name: 'ሽሮ ወጥ', category: 'Vegetarian (Tsom)',
    description: 'Silky, slow-cooked stew of roasted chickpea flour, garlic and berbere. Served bubbling in a clay pot.',
    price: 13.95, quantity_available: 30, is_vegan: 1, is_alcoholic: 0,
  },
  {
    slug: 'misir-wat', name: 'Misir Wat', local_name: 'ምስር ወጥ', category: 'Vegetarian (Tsom)',
    description: 'Red lentils simmered in a rich berbere and onion sauce - the most popular vegan dish on our menu.',
    price: 13.5, quantity_available: 35, is_vegan: 1, is_alcoholic: 0,
  },
  {
    slug: 'kik-alicha', name: 'Kik Alicha', local_name: 'ክክ አልጫ', category: 'Vegetarian (Tsom)',
    description: 'Mild yellow split peas cooked with turmeric, ginger and garlic. Comforting and not spicy.',
    price: 12.95, quantity_available: 28, is_vegan: 1, is_alcoholic: 0,
  },
  {
    slug: 'fossolia', name: 'Fossolia', local_name: 'ፎሶሊያ', category: 'Vegetarian (Tsom)',
    description: 'Green beans and carrots sauteed with onion, garlic, ginger and tomato.',
    price: 12.5, quantity_available: 0, is_vegan: 1, is_alcoholic: 0,
  },
  {
    slug: 'yetsom-beyaynetu', name: 'Yetsom Beyaynetu (for 2)', local_name: 'የጾም በየዓይነቱ', category: 'Vegetarian (Tsom)',
    description: 'The vegan combination platter: misir, kik alicha, shiro, gomen and atakilt arranged on a large injera. Made for sharing.',
    price: 26.95, quantity_available: 14, is_vegan: 1, is_alcoholic: 0,
  },

  // Traditional Drinks
  {
    slug: 'buna', name: 'Buna - Coffee Ceremony', local_name: 'ቡና', category: 'Traditional Drinks',
    description: 'Green coffee beans roasted at your table, ground and brewed in a clay jebena. Served in small cini cups with popcorn and incense. Serves 2-3.',
    price: 12.0, quantity_available: 9, is_vegan: 1, is_alcoholic: 0,
  },
];

// Each photo is named after the dish, e.g. /images/doro-wat.jpg
export default products.map((p) => ({ ...p, image: `/images/${p.slug}.jpg` }));
