export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Lavender Mist Candle",
    description: "Calming French lavender with notes of chamomile and soft vanilla.",
    price: "$18.00",
    image: "/products/product1.jpg",
  },
  {
    id: 2,
    name: "Amber & Oakmoss Candle",
    description: "Earthy oakmoss, warm golden amber, and rich cedar undertones.",
    price: "$22.50",
    image: "/products/product2.jpg",
  },
  {
    id: 3,
    name: "Vanilla Bean Candle",
    description: "Sweet Madagascar vanilla infused with warm sugar cane.",
    price: "$16.00",
    image: "/products/product3.jpg",
  },
  {
    id: 4,
    name: "Cedarwood Sage Candle",
    description: "Crisp mountain sage blended with fresh cedarwood and eucalyptus.",
    price: "$20.00",
    image: "/products/product4.jpg",
  },
  {
    id: 5,
    name: "Citrus Blossom Candle",
    description: "Bright bergamot, fresh orange blossom, and a touch of neroli.",
    price: "$19.50",
    image: "/products/product5.jpg",
  },
  {
    id: 6,
    name: "Midnight Jasmine Candle",
    description: "Night-blooming jasmine petals with subtle white tea leaves.",
    price: "$21.00",
    image: "/products/product6.jpg",
  },
];
