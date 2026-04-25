import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const count = Math.min(Number(searchParams.get("count") ?? "20"), 20);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  const placeId = process.env.NEXT_PUBLIC_GOOGLE_PLACES_ID;

  if (!apiKey || !placeId || apiKey === "your_google_places_api_key") {
    return NextResponse.json({ photos: [] });
  }

  try {
    const detailsRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${apiKey}`
    );
    const details = await detailsRes.json();

    const refs: Array<{ photo_reference: string }> =
      (details.result?.photos ?? []).slice(0, count);

    // Follow redirects to get final lh3.googleusercontent.com URLs (no API key exposed in page HTML)
    const photos = await Promise.all(
      refs.map(async ({ photo_reference }) => {
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photo_reference}&key=${apiKey}`,
            { redirect: "follow" }
          );
          return res.url || null;
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json(
      { photos: photos.filter(Boolean) },
      { headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" } }
    );
  } catch {
    return NextResponse.json({ photos: [] });
  }
}
