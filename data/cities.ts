export type City = {
  name: string;
  country: string;
  listings: string;
  priceFrom: number;
  image: string;
  /** Short sentence used as the <Image> alt attribute. */
  description: string;
  popular: boolean;
  // Navigation fields
  slug: string;
  lat: number;
  lng: number;
  zoom: number;
  roomCount: number;
};

export const cities: City[] = [
  {
    name: "San Salvador",
    country: "El Salvador",
    listings: "310+",
    priceFrom: 140,
    image: "/images/cities/san-salvador.jpg",
    description: "Vista aérea del skyline de San Salvador con el volcán Quetzaltepec al fondo.",
    popular: true,
    slug: "san-salvador",
    lat: 13.6929,
    lng: -89.2182,
    zoom: 13,
    roomCount: 5,
  },
  {
    name: "Antiguo Cuscatlán",
    country: "El Salvador",
    listings: "120+",
    priceFrom: 195,
    image: "/images/cities/antiguo-cuscatlan.jpg",
    description: "Bulevares arbolados y edificios modernos en Antiguo Cuscatlán, El Salvador.",
    popular: true,
    slug: "antiguo-cuscatlan",
    lat: 13.6699,
    lng: -89.2499,
    zoom: 14,
    roomCount: 3,
  },
  {
    name: "Santa Ana",
    country: "El Salvador",
    listings: "80+",
    priceFrom: 130,
    image: "/images/cities/santa-ana.jpg",
    description: "Catedral neogótica y plaza colonial del centro histórico de Santa Ana, El Salvador.",
    popular: false,
    slug: "santa-ana",
    lat: 13.9946,
    lng: -89.5597,
    zoom: 14,
    roomCount: 0,
  },
  {
    name: "San Miguel",
    country: "El Salvador",
    listings: "55+",
    priceFrom: 120,
    image: "/images/cities/san-miguel.jpg",
    description: "Ciudad de San Miguel con el volcán Chaparrastique y arquitectura colonial al fondo.",
    popular: false,
    slug: "san-miguel",
    lat: 13.4833,
    lng: -88.1833,
    zoom: 14,
    roomCount: 0,
  },
  {
    name: "Soyapango",
    country: "El Salvador",
    listings: "40+",
    priceFrom: 110,
    image: "/images/cities/soyapango.jpg",
    description: "Calle comercial vibrante con locales coloridos y vida comunitaria en Soyapango.",
    popular: false,
    slug: "soyapango",
    lat: 13.71,
    lng: -89.15,
    zoom: 14,
    roomCount: 0,
  },
];

/** Look up a City by its slug. Returns undefined if not found. */
export function getCityBySlug(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}
