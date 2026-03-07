// One-time script: uploads teaser video to Cloudinary CDN
// Run with: node scripts/upload-teaser-video.mjs

import { v2 as cloudinary } from "cloudinary";
import { readFileSync } from "fs";
import { resolve } from "path";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error("Missing Cloudinary env vars. Copy .env values and run:\n");
  console.error("  $env:CLOUDINARY_CLOUD_NAME='dj0kep34k'; $env:CLOUDINARY_API_KEY='669872791531555'; $env:CLOUDINARY_API_SECRET='b1sO0Lc2bmbTqZ65-u4r6Nmc3mo'; node scripts/upload-teaser-video.mjs\n");
  process.exit(1);
}

cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET, secure: true });

const videoPath = resolve("public/spark-openmic-teaser.mp4");
console.log("Uploading", videoPath, "to Cloudinary...");

const result = await cloudinary.uploader.upload(videoPath, {
  folder: "spark/openmic/teaser",
  resource_type: "video",
  public_id: "spark-openmic-10-teaser",
  overwrite: true,
  eager: [{ quality: "auto", fetch_format: "auto" }],
  eager_async: true,
});

console.log("\n Upload complete!");
console.log("URL:", result.secure_url);
console.log("\nSet this in page.tsx <video src=...> and in NEXT_PUBLIC_TEASER_URL env var.");
