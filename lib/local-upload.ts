import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

function getExtension(file: File) {
  const fromName = path.extname(file.name || "").toLowerCase();
  if (fromName) return fromName;

  const byMime: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };

  return byMime[file.type] ?? ".bin";
}

export async function saveImageLocally(file: File, folder: string) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image uploads are allowed");
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("Image exceeds 5MB size limit");
  }

  const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, "");
  const extension = getExtension(file);
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const relativeDir = path.join("uploads", safeFolder);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  const absolutePath = path.join(absoluteDir, fileName);

  await mkdir(absoluteDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  const publicPath = `/${path.posix.join(relativeDir.replace(/\\/g, "/"), fileName)}`;
  return publicPath;
}

const allowedScriptMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/rtf",
  "text/rtf",
]);

const allowedScriptExtensions = new Set([".pdf", ".doc", ".docx", ".txt", ".rtf"]);

export async function saveScriptLocally(file: File, folder: string) {
  const extension = getExtension(file);

  if (!allowedScriptMimeTypes.has(file.type) || !allowedScriptExtensions.has(extension)) {
    throw new Error("Only PDF, DOC, DOCX, TXT, and RTF files are allowed");
  }

  const maxBytes = 1 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("Script exceeds 1MB size limit");
  }

  const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, "");
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const relativeDir = path.join("uploads", safeFolder);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  const absolutePath = path.join(absoluteDir, fileName);

  await mkdir(absoluteDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  const publicPath = `/${path.posix.join(relativeDir.replace(/\\/g, "/"), fileName)}`;
  return publicPath;
}