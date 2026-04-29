export type Listing = {
  id: number;
  title: string;
  host: string;
  hostInitials: string;
  hostColor: string;
  price: number;
  rating: number;
  reviews: number;
  lat: number;
  lng: number;
  neighborhood: string;
  city: string;
  environment: "Familia con hijos" | "Pareja" | "Persona sola" | "Vivo solo/a";
  available: boolean;
  verified: boolean;
  amenities: string[];
  description: string;

  // Extended fields
  slug: string;
  images: string[];
  rules: string[];
  includes: string[];
  roomSize: number;
  floor: number;
  availableFrom: string;
  minStay: number;
  deposit: number;
  contractType: "mensual" | "trimestral" | "semestral" | "anual";

  hostProfile: {
    name: string;
    initials: string;
    color: string;
    memberSince: string;
    responseTime: string;
    totalRooms: number;
    verified: boolean;
    bio: string;
  };

  location: {
    neighborhood: string;
    city: string;
    lat: number;
    lng: number;
    nearbyPlaces: {
      name: string;
      type: "universidad" | "hospital" | "supermercado" | "transporte" | "parque";
      distanceMin: number;
    }[];
  };
};

export const mockListings: Listing[] = [
  {
    id: 1,
    title: "Habitación amplia con baño privado",
    host: "Carmen López",
    hostInitials: "CL",
    hostColor: "#D85A30",
    price: 220,
    rating: 4.8,
    reviews: 14,
    lat: 13.7034,
    lng: -89.224,
    neighborhood: "Colonia Escalón",
    city: "San Salvador",
    environment: "Familia con hijos",
    available: true,
    verified: true,
    amenities: ["WiFi", "Agua caliente", "Cocina compartida"],
    description:
      "Cuarto cómodo en casa familiar, tranquilo, con acceso a sala y jardín. La habitación cuenta con ventanas amplias que permiten buena ventilación natural durante todo el día. La familia es acogedora y mantiene la casa en excelente estado de limpieza. Ideal para profesional o estudiante que busca un ambiente tranquilo y familiar en una de las zonas más residenciales de San Salvador.",
    slug: "habitacion-amplia-bano-privado-escalon",
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80",
    ],
    rules: [
      "No fumar dentro de la casa",
      "No mascotas",
      "Silencio después de las 10pm",
      "Visitas solo en áreas comunes",
      "Limpieza de áreas comunes compartida",
    ],
    includes: ["Agua", "Electricidad", "WiFi", "Gas"],
    roomSize: 14,
    floor: 1,
    availableFrom: "2025-04-01",
    minStay: 3,
    deposit: 220,
    contractType: "mensual",
    hostProfile: {
      name: "Carmen López",
      initials: "CL",
      color: "#D85A30",
      memberSince: "Marzo 2023",
      responseTime: "Responde en menos de 1 hora",
      totalRooms: 3,
      verified: true,
      bio: "Soy maestra jubilada y vivo con mi familia en Escalón desde hace 20 años. Me encanta recibir personas responsables y respetuosas en mi hogar.",
    },
    location: {
      neighborhood: "Colonia Escalón",
      city: "San Salvador",
      lat: 13.7034,
      lng: -89.224,
      nearbyPlaces: [
        { name: "Universidad Centroamericana (UCA)", type: "universidad", distanceMin: 12 },
        { name: "Hospital de Diagnóstico", type: "hospital", distanceMin: 8 },
        { name: "Súper Selectos Escalón", type: "supermercado", distanceMin: 5 },
        { name: "Parada Bus Ruta 52", type: "transporte", distanceMin: 3 },
        { name: "Parque Beethoven", type: "parque", distanceMin: 7 },
      ],
    },
  },
  {
    id: 2,
    title: "Cuarto soleado en zona céntrica",
    host: "Roberto Méndez",
    hostInitials: "RM",
    hostColor: "#2a7a6a",
    price: 180,
    rating: 4.5,
    reviews: 9,
    lat: 13.698,
    lng: -89.218,
    neighborhood: "Centro Histórico",
    city: "San Salvador",
    environment: "Persona sola",
    available: true,
    verified: true,
    amenities: ["WiFi", "Estacionamiento", "Aire acondicionado"],
    description:
      "Excelente ubicación, a dos cuadras del parque central. Habitación con ventanas hacia el patio interior que garantizan privacidad y luz natural durante la mañana. El edificio es seguro con portero durante el día. Perfecta opción para quien trabaja en el centro y quiere evitar el tráfico cotidiano.",
    slug: "cuarto-soleado-zona-centrica",
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=900&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=80",
      "https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=900&q=80",
    ],
    rules: [
      "No fumar",
      "No mascotas",
      "No fiestas ni reuniones ruidosas",
      "Aviso previo de 15 días para salida",
    ],
    includes: ["Agua", "Electricidad", "WiFi"],
    roomSize: 11,
    floor: 2,
    availableFrom: "2025-03-15",
    minStay: 1,
    deposit: 180,
    contractType: "mensual",
    hostProfile: {
      name: "Roberto Méndez",
      initials: "RM",
      color: "#2a7a6a",
      memberSince: "Enero 2024",
      responseTime: "Responde en menos de 3 horas",
      totalRooms: 2,
      verified: true,
      bio: "Empresario local con dos propiedades en el centro. Busco inquilinos tranquilos y responsables que valoren la comodidad de vivir cerca de todo.",
    },
    location: {
      neighborhood: "Centro Histórico",
      city: "San Salvador",
      lat: 13.698,
      lng: -89.218,
      nearbyPlaces: [
        { name: "Parque Libertad", type: "parque", distanceMin: 2 },
        { name: "Terminal de Buses Oriente", type: "transporte", distanceMin: 10 },
        { name: "Hospital Rosales", type: "hospital", distanceMin: 15 },
        { name: "Mercado Central", type: "supermercado", distanceMin: 5 },
      ],
    },
  },
  {
    id: 3,
    title: "Habitación en casa de pareja tranquila",
    host: "Ana y Luis Flores",
    hostInitials: "AF",
    hostColor: "#7a4a8a",
    price: 250,
    rating: 4.9,
    reviews: 22,
    lat: 13.6875,
    lng: -89.2415,
    neighborhood: "Antiguo Cuscatlán",
    city: "Antiguo Cuscatlán",
    environment: "Pareja",
    available: true,
    verified: true,
    amenities: ["WiFi", "Agua caliente", "Lavandería", "Jardín"],
    description:
      "Casa moderna, silenciosa, ideal para estudiantes o profesionales. La habitación tiene su propio baño y acceso directo al jardín trasero con zona de descanso. Ana y Luis son anfitriones experimentados que cuidan mucho la convivencia respetuosa. La zona de Antiguo Cuscatlán es una de las más seguras y agradables del área metropolitana.",
    slug: "habitacion-casa-pareja-tranquila-antiguo",
    images: [
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=900&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=900&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&q=80",
      "https://images.unsplash.com/photo-1556909172-8c2f041fca1e?w=900&q=80",
    ],
    rules: [
      "No fumar",
      "No mascotas",
      "Silencio después de las 10pm",
      "No visitas que pernocten",
      "Uso responsable del jardín",
    ],
    includes: ["Agua", "Electricidad", "WiFi", "Gas", "Lavandería"],
    roomSize: 16,
    floor: 0,
    availableFrom: "2025-04-15",
    minStay: 3,
    deposit: 500,
    contractType: "trimestral",
    hostProfile: {
      name: "Ana y Luis Flores",
      initials: "AF",
      color: "#7a4a8a",
      memberSince: "Junio 2022",
      responseTime: "Responde en menos de 2 horas",
      totalRooms: 6,
      verified: true,
      bio: "Somos una pareja de profesionales apasionados por crear hogares acogedores. Tenemos experiencia alojando estudiantes universitarios y personas en movilidad laboral.",
    },
    location: {
      neighborhood: "Antiguo Cuscatlán",
      city: "Antiguo Cuscatlán",
      lat: 13.6875,
      lng: -89.2415,
      nearbyPlaces: [
        { name: "Universidad Francisco Gavidia", type: "universidad", distanceMin: 18 },
        { name: "Multiplaza", type: "supermercado", distanceMin: 10 },
        { name: "Clínica Médica La Esperanza", type: "hospital", distanceMin: 12 },
        { name: "Parada Bus Ruta 44", type: "transporte", distanceMin: 4 },
        { name: "Parque Municipal Antiguo Cuscatlán", type: "parque", distanceMin: 6 },
      ],
    },
  },
  {
    id: 4,
    title: "Cuarto independiente con entrada propia",
    host: "Mario Gutiérrez",
    hostInitials: "MG",
    hostColor: "#3a6a9a",
    price: 195,
    rating: 4.3,
    reviews: 6,
    lat: 13.7095,
    lng: -89.2355,
    neighborhood: "Santa Elena",
    city: "Antiguo Cuscatlán",
    environment: "Vivo solo/a",
    available: false,
    verified: true,
    amenities: ["WiFi", "Baño privado", "Cocina compartida"],
    description:
      "Habitación con entrada independiente, total privacidad. El cuarto tiene su propia puerta exterior por lo que el inquilino va y viene sin molestar al propietario. Incluye baño privado y pequeña área de escritorio junto a la ventana. Ideal para profesional que viaja frecuentemente y necesita un espacio confiable en Santa Elena.",
    slug: "cuarto-independiente-entrada-propia-santa-elena",
    images: [
      "https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=900&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80",
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=900&q=80",
    ],
    rules: [
      "No fumar",
      "No mascotas",
      "No ruidos fuertes después de las 9pm",
      "Aviso de 30 días para desocupar",
    ],
    includes: ["Agua", "Electricidad", "WiFi"],
    roomSize: 12,
    floor: 0,
    availableFrom: "2025-06-01",
    minStay: 2,
    deposit: 195,
    contractType: "mensual",
    hostProfile: {
      name: "Mario Gutiérrez",
      initials: "MG",
      color: "#3a6a9a",
      memberSince: "Agosto 2023",
      responseTime: "Responde en menos de 4 horas",
      totalRooms: 1,
      verified: true,
      bio: "Vivo en la propiedad principal y rento el cuarto anexo de forma independiente. Soy respetuoso de la privacidad del inquilino y espero lo mismo a cambio.",
    },
    location: {
      neighborhood: "Santa Elena",
      city: "Antiguo Cuscatlán",
      lat: 13.7095,
      lng: -89.2355,
      nearbyPlaces: [
        { name: "World Trade Center", type: "transporte", distanceMin: 5 },
        { name: "Súper Selectos Santa Elena", type: "supermercado", distanceMin: 4 },
        { name: "Hospital Diagnóstico Perpetuo Socorro", type: "hospital", distanceMin: 9 },
        { name: "Parada Bus Ruta 101B", type: "transporte", distanceMin: 3 },
        { name: "Parque de Santa Elena", type: "parque", distanceMin: 8 },
      ],
    },
  },
  {
    id: 5,
    title: "Habitación luminosa cerca de UTEC",
    host: "Patricia Vásquez",
    hostInitials: "PV",
    hostColor: "#8a6a2a",
    price: 160,
    rating: 4.6,
    reviews: 11,
    lat: 13.7012,
    lng: -89.2098,
    neighborhood: "Colonia Médica",
    city: "San Salvador",
    environment: "Persona sola",
    available: true,
    verified: false,
    amenities: ["WiFi", "Agua caliente"],
    description:
      "A cinco minutos de la UTEC, zona segura y bien conectada. La habitación tiene luz natural todo el día por su orientación sur y ventana grande. Patricia ofrece un ambiente tranquilo y limpio, perfecto para estudiantes universitarios con rutinas exigentes. Las rutas de bus cercanas conectan con toda el área metropolitana.",
    slug: "habitacion-luminosa-cerca-utec-colonia-medica",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=900&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=80",
    ],
    rules: [
      "No fumar",
      "No mascotas",
      "No visitas después de las 8pm",
      "Silencio en horas de estudio (8am–12pm)",
    ],
    includes: ["Agua", "Electricidad", "WiFi"],
    roomSize: 10,
    floor: 1,
    availableFrom: "2025-03-20",
    minStay: 1,
    deposit: 160,
    contractType: "mensual",
    hostProfile: {
      name: "Patricia Vásquez",
      initials: "PV",
      color: "#8a6a2a",
      memberSince: "Febrero 2024",
      responseTime: "Responde en menos de 6 horas",
      totalRooms: 1,
      verified: false,
      bio: "Vivo sola y rento una habitación de mi apartamento hace un año. Busco estudiante o profesional tranquilo con quien compartir el espacio de manera respetuosa.",
    },
    location: {
      neighborhood: "Colonia Médica",
      city: "San Salvador",
      lat: 13.7012,
      lng: -89.2098,
      nearbyPlaces: [
        { name: "UTEC San Salvador", type: "universidad", distanceMin: 5 },
        { name: "Hospital de la Mujer", type: "hospital", distanceMin: 7 },
        { name: "Súper Selectos Médica", type: "supermercado", distanceMin: 6 },
        { name: "Parada Bus Ruta 30B", type: "transporte", distanceMin: 2 },
      ],
    },
  },
  {
    id: 6,
    title: "Cuarto en casa familiar con niños",
    host: "Sonia Hernández",
    hostInitials: "SH",
    hostColor: "#c04f28",
    price: 200,
    rating: 4.7,
    reviews: 18,
    lat: 13.7156,
    lng: -89.2188,
    neighborhood: "Colonia San Benito",
    city: "San Salvador",
    environment: "Familia con hijos",
    available: true,
    verified: true,
    amenities: ["WiFi", "Comidas incluidas", "Agua caliente", "Jardín"],
    description:
      "Familia acogedora, ambiente seguro y hogareño. Incluye desayuno y cena preparados diariamente con ingredientes frescos. La habitación está ubicada en la planta alta con vista al jardín y tiene ventilación cruzada natural. San Benito es una colonia residencial tranquila con excelente seguridad y cerca de los principales centros comerciales.",
    slug: "cuarto-casa-familiar-san-benito",
    images: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=900&q=80",
      "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=900&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=900&q=80",
    ],
    rules: [
      "No fumar",
      "No alcohol en las habitaciones",
      "No mascotas",
      "Respeto con los niños de la familia",
      "Silencio después de las 9pm",
    ],
    includes: ["Agua", "Electricidad", "WiFi", "Gas", "Desayuno", "Cena"],
    roomSize: 13,
    floor: 1,
    availableFrom: "2025-04-01",
    minStay: 3,
    deposit: 400,
    contractType: "trimestral",
    hostProfile: {
      name: "Sonia Hernández",
      initials: "SH",
      color: "#c04f28",
      memberSince: "Octubre 2022",
      responseTime: "Responde en menos de 2 horas",
      totalRooms: 4,
      verified: true,
      bio: "Madre de familia con experiencia alojando estudiantes universitarios desde 2022. Mi hogar es cálido, limpio y ordenado, y trato a cada inquilino como parte de la familia.",
    },
    location: {
      neighborhood: "Colonia San Benito",
      city: "San Salvador",
      lat: 13.7156,
      lng: -89.2188,
      nearbyPlaces: [
        { name: "Metrópolis", type: "supermercado", distanceMin: 8 },
        { name: "Hospital Centro de Especialidades", type: "hospital", distanceMin: 11 },
        { name: "Parada Bus Ruta 4", type: "transporte", distanceMin: 4 },
        { name: "Parque San Benito", type: "parque", distanceMin: 5 },
        { name: "Universidad Dr. José Matías Delgado", type: "universidad", distanceMin: 20 },
      ],
    },
  },
  {
    id: 7,
    title: "Habitación moderna en residencial privada",
    host: "Diego Alvarado",
    hostInitials: "DA",
    hostColor: "#2a6a4a",
    price: 280,
    rating: 4.4,
    reviews: 5,
    lat: 13.6812,
    lng: -89.2498,
    neighborhood: "Las Colinas",
    city: "Antiguo Cuscatlán",
    environment: "Pareja",
    available: true,
    verified: true,
    amenities: ["WiFi", "Piscina", "Gimnasio", "Estacionamiento", "Aire acondicionado"],
    description:
      "Residencial con vigilancia 24h, acceso a amenidades exclusivas. La habitación está completamente amueblada con estilo moderno y cuenta con aire acondicionado propio. Los residentes tienen acceso libre a la piscina, gimnasio y salón de usos múltiples. Ideal para pareja o profesional que busca comodidades premium en el área de Antiguo Cuscatlán.",
    slug: "habitacion-moderna-residencial-privada-las-colinas",
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=900&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=900&q=80",
      "https://images.unsplash.com/photo-1560440021-33f9b867899d?w=900&q=80",
    ],
    rules: [
      "No fumar dentro de la residencia",
      "No mascotas",
      "Respetar normativas del condominio",
      "Registro previo de visitas en portería",
    ],
    includes: ["Agua", "Electricidad", "WiFi", "Aire acondicionado", "Gym", "Piscina"],
    roomSize: 18,
    floor: 3,
    availableFrom: "2025-05-01",
    minStay: 6,
    deposit: 560,
    contractType: "semestral",
    hostProfile: {
      name: "Diego Alvarado",
      initials: "DA",
      color: "#2a6a4a",
      memberSince: "Abril 2023",
      responseTime: "Responde en menos de 1 hora",
      totalRooms: 2,
      verified: true,
      bio: "Arquitecto y propietario de dos unidades en Las Colinas. Me importa que el espacio sea funcional, estético y confortable para quien lo habite.",
    },
    location: {
      neighborhood: "Las Colinas",
      city: "Antiguo Cuscatlán",
      lat: 13.6812,
      lng: -89.2498,
      nearbyPlaces: [
        { name: "Galerías Mall", type: "supermercado", distanceMin: 12 },
        { name: "Clínica Las Colinas", type: "hospital", distanceMin: 7 },
        { name: "Parada Bus Ruta 44C", type: "transporte", distanceMin: 6 },
        { name: "Parque Las Colinas", type: "parque", distanceMin: 3 },
        { name: "ITCA Metrópolis", type: "universidad", distanceMin: 15 },
      ],
    },
  },
  {
    id: 8,
    title: "Cuarto económico cerca de plaza",
    host: "Elena Ramos",
    hostInitials: "ER",
    hostColor: "#6a2a7a",
    price: 140,
    rating: 4.1,
    reviews: 3,
    lat: 13.6945,
    lng: -89.2305,
    neighborhood: "Barrio San Jacinto",
    city: "San Salvador",
    environment: "Vivo solo/a",
    available: false,
    verified: false,
    amenities: ["WiFi", "Cocina compartida"],
    description:
      "Opción económica, zona comercial, cerca de rutas de bus. La habitación es sencilla pero funcional, con espacio para cama doble y escritorio. Se comparte cocina y baño con máximo dos personas más. Excelente para persona que trabaja en el centro y prioriza el ahorro sin sacrificar conectividad.",
    slug: "cuarto-economico-cerca-plaza-san-jacinto",
    images: [
      "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=900&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80",
    ],
    rules: [
      "No fumar",
      "No mascotas",
      "Aviso de 15 días para desocupar",
    ],
    includes: ["Agua", "WiFi"],
    roomSize: 9,
    floor: 0,
    availableFrom: "2025-07-01",
    minStay: 1,
    deposit: 140,
    contractType: "mensual",
    hostProfile: {
      name: "Elena Ramos",
      initials: "ER",
      color: "#6a2a7a",
      memberSince: "Noviembre 2024",
      responseTime: "Responde en menos de 12 horas",
      totalRooms: 1,
      verified: false,
      bio: "Rento una habitación de mi casa para generar ingresos adicionales. Soy tranquila y respetuosa, y busco un inquilino con las mismas características.",
    },
    location: {
      neighborhood: "Barrio San Jacinto",
      city: "San Salvador",
      lat: 13.6945,
      lng: -89.2305,
      nearbyPlaces: [
        { name: "Mercado San Jacinto", type: "supermercado", distanceMin: 3 },
        { name: "Parada Bus Ruta 9", type: "transporte", distanceMin: 2 },
        { name: "Hospital San Juan de Dios", type: "hospital", distanceMin: 14 },
        { name: "Parque Infantil San Jacinto", type: "parque", distanceMin: 5 },
      ],
    },
  },
];

export function getRoomBySlug(slug: string): Listing | undefined {
  return mockListings.find((l) => l.slug === slug);
}
