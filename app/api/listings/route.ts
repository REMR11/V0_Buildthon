import { NextRequest, NextResponse } from "next/server";
import { mockListings } from "@/lib/listings";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const city = searchParams.get("city");
  const available = searchParams.get("available");
  const maxPrice = searchParams.get("maxPrice");
  const verified = searchParams.get("verified");
  const environment = searchParams.get("environment");

  let results = [...mockListings];

  if (city) {
    results = results.filter((l) =>
      l.city.toLowerCase().includes(city.toLowerCase())
    );
  }
  if (available === "true") {
    results = results.filter((l) => l.available);
  }
  if (verified === "true") {
    results = results.filter((l) => l.verified);
  }
  if (maxPrice) {
    const max = parseInt(maxPrice, 10);
    if (!isNaN(max)) {
      results = results.filter((l) => l.price <= max);
    }
  }
  if (environment) {
    results = results.filter((l) => l.environment === environment);
  }

  return NextResponse.json(results);
}
