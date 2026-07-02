export type AuctionCardData = {
  id: string;
  name: string;
  price: string;
  timeLeft: string;
  urgent?: boolean;
  watching: number;
  meta: string;
  image: string;
};

export const auctionCards: AuctionCardData[] = [
  {
    id: "nike-dunk-low-panda",
    name: "Nike Dunk Low Panda",
    price: "₹18,500",
    timeLeft: "00:42",
    urgent: true,
    watching: 21,
    meta: "US 9 • DS",
    image: "/images/card-nike-dunk-low-panda.png",
  },
  {
    id: "yeezy-350-v2-beluga",
    name: "Yeezy 350 V2 Beluga",
    price: "₹25,200",
    timeLeft: "01:12",
    watching: 34,
    meta: "US 9.5 • VNDS",
    image: "/images/card-yeezy-350-v2-beluga.png",
  },
  {
    id: "supreme-box-logo-hoodie",
    name: "Supreme Box Logo Hoodie",
    price: "₹31,000",
    timeLeft: "02:15",
    watching: 18,
    meta: "Size L • DS",
    image: "/images/card-supreme-box-logo-hoodie.png",
  },
  {
    id: "air-jordan-4-university-blue",
    name: "Air Jordan 4 University Blue",
    price: "₹28,750",
    timeLeft: "02:31",
    watching: 12,
    meta: "US 10 • DS",
    image: "/images/card-air-jordan-4-university-blue.png",
  },
  {
    id: "off-white-air-jordan-1",
    name: "Off-White Air Jordan 1",
    price: "₹28,000",
    timeLeft: "03:33",
    watching: 16,
    meta: "US 9 • DS",
    image: "/images/card-off-white-air-jordan-1.png",
  },
  {
    id: "adidas-gazelle-bold-pink",
    name: "Adidas Gazelle Bold Pink",
    price: "₹9,800",
    timeLeft: "04:20",
    watching: 9,
    meta: "UK 7 • DS",
    image: "/images/card-adidas-gazelle-bold-pink.png",
  },
];

export const heroAuction = {
  name: "Air Jordan 1 Retro High OG 'Mocha'",
  currentBid: "₹18,500",
  bidIncrement: "+ ₹300",
  endsIn: { hr: "02", min: "14", sec: "33" },
  image: "/images/hero-product.png",
} as const;
