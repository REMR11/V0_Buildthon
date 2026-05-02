/* ─────────────────────────────────────────────────────────────────────────
   Mock roommate profiles — used by Flujo 1 (cuarto → buscar roommate)
   Share the same habit-field schema as Listing so the scoring function
   from match-prefs can be reused directly.
───────────────────────────────────────────────────────────────────────── */

export type Roommate = {
  id: number;
  name: string;
  initials: string;
  color: string;
  age: number;
  occupation: "estudiante" | "profesional" | "sin-preferencia";
  city: string;
  bio: string;
  budget: number; // max monthly budget per person
  gender: "masculino" | "femenino" | "no-binario";
  verified: boolean;
  rating: number;
  reviews: number;
  // ── Habit fields (same keys as Listing.host* but without "host" prefix) ──
  schedule: "manana" | "noche" | "flexible" | "home-office";
  daysHome: "pocos" | "mitad" | "casi-siempre";
  noise: "muy-tranquilo" | "normal" | "social";
  kitchenUse: "raramente" | "cocino-seguido" | "meal-prep";
  commonTemp: "frio" | "templado" | "calido";
  bathroomTime: "rapido" | "normal" | "largo";
  pets: "no" | "si-pequena" | "si-grande" | "acepta";
  smoking: "no" | "afuera" | "si";
  alcohol: "no" | "social" | "frecuente";
  cleanliness: "muy-ordenado" | "normal" | "relajado";
  visits: "casi-nunca" | "a-veces" | "seguido";
  overnightGuests: "no" | "a-veces" | "si";
  personality: "introvertido" | "ambivertido" | "extrovertido";
  conflictStyle: "hablar-directo" | "escrito" | "evitar";
  cohabitation: "independencia-total" | "cordial" | "convivir";
};

export const mockRoommates: Roommate[] = [
  {
    id: 101,
    name: "Valeria Torres",
    initials: "VT",
    color: "#D85A30",
    age: 24,
    occupation: "profesional",
    city: "San Salvador",
    bio: "Diseñadora UX, trabajo desde casa 3 días a la semana. Me gusta tener el apartamento ordenado y tranquilo. Cocino seguido y me encanta el meal prep los domingos.",
    budget: 200,
    gender: "femenino",
    verified: true,
    rating: 4.9,
    reviews: 3,
    schedule: "manana",
    daysHome: "casi-siempre",
    noise: "muy-tranquilo",
    kitchenUse: "meal-prep",
    commonTemp: "templado",
    bathroomTime: "rapido",
    pets: "no",
    smoking: "no",
    alcohol: "social",
    cleanliness: "muy-ordenado",
    visits: "casi-nunca",
    overnightGuests: "a-veces",
    personality: "introvertido",
    conflictStyle: "hablar-directo",
    cohabitation: "independencia-total",
  },
  {
    id: 102,
    name: "Diego Morales",
    initials: "DM",
    color: "#2a7a6a",
    age: 22,
    occupation: "estudiante",
    city: "San Salvador",
    bio: "Estudiante de ingeniería en la UCA. Paso bastante tiempo fuera entre clases y trabajo de medio tiempo. No fumo, soy tranquilo y me llevo bien con todo el mundo.",
    budget: 180,
    gender: "masculino",
    verified: true,
    rating: 5.0,
    reviews: 1,
    schedule: "flexible",
    daysHome: "pocos",
    noise: "normal",
    kitchenUse: "raramente",
    commonTemp: "templado",
    bathroomTime: "rapido",
    pets: "acepta",
    smoking: "no",
    alcohol: "social",
    cleanliness: "normal",
    visits: "a-veces",
    overnightGuests: "no",
    personality: "ambivertido",
    conflictStyle: "hablar-directo",
    cohabitation: "cordial",
  },
  {
    id: 103,
    name: "Luisa Ramírez",
    initials: "LR",
    color: "#7a4a8a",
    age: 27,
    occupation: "profesional",
    city: "Antiguo Cuscatlán",
    bio: "Trabajo en marketing digital, horario de oficina normal. Me gustan las mañanas tranquilas y cocino bastante. Tengo una gata pequeña muy tranquila.",
    budget: 250,
    gender: "femenino",
    verified: true,
    rating: 4.7,
    reviews: 5,
    schedule: "manana",
    daysHome: "mitad",
    noise: "muy-tranquilo",
    kitchenUse: "cocino-seguido",
    commonTemp: "calido",
    bathroomTime: "normal",
    pets: "si-pequena",
    smoking: "no",
    alcohol: "no",
    cleanliness: "muy-ordenado",
    visits: "casi-nunca",
    overnightGuests: "no",
    personality: "introvertido",
    conflictStyle: "escrito",
    cohabitation: "cordial",
  },
  {
    id: 104,
    name: "Carlos Mendoza",
    initials: "CM",
    color: "#3a6a9a",
    age: 25,
    occupation: "profesional",
    city: "San Salvador",
    bio: "Ingeniero de software, trabajo en home office. Me gusta el orden, la música tranquila y hacer gym por las mañanas. Busco un ambiente relajado pero limpio.",
    budget: 220,
    gender: "masculino",
    verified: false,
    rating: 4.6,
    reviews: 2,
    schedule: "home-office",
    daysHome: "casi-siempre",
    noise: "normal",
    kitchenUse: "meal-prep",
    commonTemp: "frio",
    bathroomTime: "rapido",
    pets: "no",
    smoking: "no",
    alcohol: "social",
    cleanliness: "muy-ordenado",
    visits: "a-veces",
    overnightGuests: "a-veces",
    personality: "introvertido",
    conflictStyle: "hablar-directo",
    cohabitation: "independencia-total",
  },
  {
    id: 105,
    name: "Sofía Herrera",
    initials: "SH",
    color: "#8a6a2a",
    age: 23,
    occupation: "estudiante",
    city: "San Salvador",
    bio: "Estudio medicina, horarios locos pero soy muy ordenada. Los fines de semana me gusta hacer planes con amigos. Prefiero vivir con alguien que entienda mis horarios variables.",
    budget: 160,
    gender: "femenino",
    verified: true,
    rating: 4.8,
    reviews: 4,
    schedule: "flexible",
    daysHome: "mitad",
    noise: "normal",
    kitchenUse: "cocino-seguido",
    commonTemp: "calido",
    bathroomTime: "normal",
    pets: "acepta",
    smoking: "no",
    alcohol: "social",
    cleanliness: "normal",
    visits: "a-veces",
    overnightGuests: "a-veces",
    personality: "ambivertido",
    conflictStyle: "hablar-directo",
    cohabitation: "convivir",
  },
  {
    id: 106,
    name: "Andrés Vásquez",
    initials: "AV",
    color: "#c04f28",
    age: 28,
    occupation: "profesional",
    city: "Antiguo Cuscatlán",
    bio: "Trabajo en finanzas, salgo temprano y llego a tiempo razonable. Soy extrovertido pero respeto el espacio de los demás. Me gusta invitar amigos de vez en cuando.",
    budget: 280,
    gender: "masculino",
    verified: true,
    rating: 4.5,
    reviews: 7,
    schedule: "manana",
    daysHome: "pocos",
    noise: "social",
    kitchenUse: "raramente",
    commonTemp: "templado",
    bathroomTime: "largo",
    pets: "no",
    smoking: "afuera",
    alcohol: "social",
    cleanliness: "normal",
    visits: "seguido",
    overnightGuests: "si",
    personality: "extrovertido",
    conflictStyle: "evitar",
    cohabitation: "convivir",
  },
];
