import sharp from "sharp";

// Image targets from eng review D7
export const HERO_W = 1920;
export const HERO_H = 818;
export const POSTER_W = 400;
export const POSTER_H = 600;

export async function resizeHero(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .resize(HERO_W, HERO_H, { fit: "cover", position: "center" })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}

export async function resizePoster(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .resize(POSTER_W, POSTER_H, { fit: "cover", position: "center" })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}
