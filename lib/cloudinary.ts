import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImageToCloudinary(file: File, folder: string) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image uploads are allowed");
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("Image exceeds 5MB size limit");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  });

  return result.secure_url;
}

const allowedScriptMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/rtf",
  "text/rtf",
]);

export async function uploadScriptToCloudinary(file: File, folder: string) {
  if (!allowedScriptMimeTypes.has(file.type)) {
    throw new Error("Only PDF, DOC, DOCX, TXT, and RTF files are allowed");
  }

  const maxBytes = 1 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("Script exceeds 1MB size limit");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "raw",
    allowed_formats: ["pdf", "doc", "docx", "txt", "rtf"],
  });

  return result.secure_url;
}
