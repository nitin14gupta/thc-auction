import { readdir } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const imagesDir = join(process.cwd(), "public/images");
  const files = await readdir(imagesDir);
  const heroImages = files
    .filter((f) => /^hero-/.test(f))
    .sort()
    .map((f) => `/images/${f}`);
  return NextResponse.json(heroImages);
}
