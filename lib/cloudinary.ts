import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const allowedScreenshotMimeTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export async function uploadImageToCloudinary(file: File, folder: string) {
  if (!allowedScreenshotMimeTypes.has(file.type)) {
    throw new Error("Only JPG, PNG, or WebP screenshots are allowed");
  }

  const maxBytes = 1 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("Screenshot exceeds 1MB size limit");
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

const mimeToExt: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/plain": "txt",
  "application/rtf": "rtf",
  "text/rtf": "rtf",
};

export async function uploadScriptToCloudinary(file: File, folder: string) {
  if (!allowedScriptMimeTypes.has(file.type)) {
    throw new Error("Only PDF, DOC, DOCX, TXT, and RTF files are allowed");
  }

  const maxBytes = 2 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("Script exceeds 2MB size limit");
  }

  const ext = mimeToExt[file.type] ?? "pdf";
  // Strip any existing extension from the original name then re-append correct one
  const baseName = (file.name ?? "script").replace(/\.[^/.]+$/, "");
  const publicId = `${folder}/${baseName}_${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    public_id: publicId,
    resource_type: "raw",
    use_filename: false,
    unique_filename: false,
    overwrite: false,
  });

  return result.secure_url;
}
