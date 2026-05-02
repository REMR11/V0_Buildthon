export type MatchPrefs = {
  schedule: string;
  daysHome: string;
  noise: string;
  kitchenUse: string;
  commonTemp: string;
  bathroomTime: string;
  pets: string;
  smoking: string;
  alcohol: string;
  cleanliness: string;
  visits: string;
  overnightGuests: string;
  personality: string;
  conflictStyle: string;
  cohabitation: string;
  budget: number;
  city: string;
  roommateGender: string;
  occupation: string;
};

const STORAGE_KEY = "nidoo_match_prefs";

export function savePrefs(prefs: MatchPrefs): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function getPrefs(): MatchPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MatchPrefs;
  } catch {
    return null;
  }
}

export function clearPrefs(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/** Build prefs from URLSearchParams (used by results page) */
export function prefsFromParams(sp: URLSearchParams): MatchPrefs {
  return {
    schedule: sp.get("schedule") ?? "",
    daysHome: sp.get("daysHome") ?? "",
    noise: sp.get("noise") ?? "",
    kitchenUse: sp.get("kitchenUse") ?? "",
    commonTemp: sp.get("commonTemp") ?? "",
    bathroomTime: sp.get("bathroomTime") ?? "",
    pets: sp.get("pets") ?? "",
    smoking: sp.get("smoking") ?? "",
    alcohol: sp.get("alcohol") ?? "",
    cleanliness: sp.get("cleanliness") ?? "",
    visits: sp.get("visits") ?? "",
    overnightGuests: sp.get("overnightGuests") ?? "",
    personality: sp.get("personality") ?? "",
    conflictStyle: sp.get("conflictStyle") ?? "",
    cohabitation: sp.get("cohabitation") ?? "",
    budget: Number(sp.get("budget") ?? 300),
    city: sp.get("city") ?? "",
    roommateGender: sp.get("roommateGender") ?? "",
    occupation: sp.get("occupation") ?? "",
  };
}
