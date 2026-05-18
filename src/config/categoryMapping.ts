export const CATEGORY_MAP: Record<string, { label: string; value: string; types: { label: string; value: string }[] }> = {
  men: {
    label: 'Men',
    value: 'men',
    types: [
      { label: 'Shirts (Casual, Formal, T-Shirts, Polos)', value: 'shirts' },
      { label: 'Trousers & Chinos', value: 'trousers' },
      { label: 'Jeans', value: 'jeans' },
      { label: 'Suits & Blazers', value: 'suits' },
      { label: '3-Piece Suits', value: '3-piece-suits' },
      { label: 'Up-and-down Sets', value: 'up-and-down-sets' },
      { label: 'Shirt and Trouser Sets', value: 'shirt-and-trouser-sets' },
      { label: 'Jackets & Hoodies', value: 'jackets' },
      { label: 'Shorts', value: 'shorts' },
    ]
  },
  women: {
    label: 'Women',
    value: 'women',
    types: [
      { label: 'Dresses (Casual, Evening, Maxi)', value: 'dresses' },
      { label: 'Tops & Blouses', value: 'tops' },
      { label: 'Skirts', value: 'skirts' },
      { label: 'Pants & Trousers', value: 'pants' },
      { label: 'Jumpsuits', value: 'jumpsuits' },
      { label: '3-Piece Sets', value: '3-piece-sets' },
      { label: 'Jackets & Hoodies', value: 'jackets' },
      { label: 'Denim', value: 'denim' },
    ]
  },
  kids: {
    label: 'Kids',
    value: 'kids',
    types: [
      { label: 'Boys Clothing', value: 'boys' },
      { label: 'Girls Clothing', value: 'girls' },
      { label: 'Baby Wear', value: 'baby' },
      { label: 'Footwear', value: 'footwear' },
      { label: 'Bags', value: 'bags' },
      { label: 'Cloth', value: 'cloth' },
    ]
  },
  footwear: {
    label: 'Footwear',
    value: 'footwear',
    types: [
      { label: 'Sneakers', value: 'sneakers' },
      { label: 'Sandals', value: 'sandals' },
      { label: 'Heels', value: 'heels' },
      { label: 'Boots', value: 'boots' },
      { label: 'Slippers', value: 'slippers' },
    ]
  },
  accessories: {
    label: 'Accessories',
    value: 'accessories',
    types: [
      { label: 'Bags', value: 'bags' },
      { label: 'Belts', value: 'belts' },
      { label: 'Hats & Caps', value: 'hats' },
      { label: 'Sunglasses', value: 'sunglasses' },
      { label: 'Jewelry', value: 'jewelry' },
      { label: 'Watches', value: 'watches' },
      { label: 'Suspender', value: 'suspender' },
      { label: 'Tie', value: 'tie' },
      { label: 'Perfume', value: 'perfume' },
      { label: 'Cufflinks', value: 'cufflinks' },
    ]
  }
};

export const ALL_CATEGORIES = Object.values(CATEGORY_MAP).map(cat => ({ 
  label: cat.label, 
  value: cat.value 
}));
