import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function configure() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadBookFile(
  buffer: Buffer
): Promise<{ url: string; publicId: string }> {
  configure();

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File too large: ${(buffer.length / 1024 / 1024).toFixed(1)}MB (max: ${MAX_FILE_SIZE_MB}MB)`
    );
  }

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "raw",
          folder: "hena_books/pdfs",
          public_id: randomUUID(),
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!);
        }
      )
      .end(buffer);
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function uploadCoverImage(
  buffer: Buffer
): Promise<{ url: string; publicId: string }> {
  configure();

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image",
          folder: "hena_books/covers",
          public_id: randomUUID(),
          transformation: [
            { width: 400, height: 600, crop: "fill" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!);
        }
      )
      .end(buffer);
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteFile(
  publicId: string,
  resourceType: "raw" | "image" = "raw"
): Promise<boolean> {
  configure();
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result.result === "ok";
  } catch {
    return false;
  }
}

export function getDownloadUrl(publicId: string): string | null {
  configure();
  try {
    const url = cloudinary.url(publicId, {
      resource_type: "raw",
      flags: "attachment",
      secure: true,
    });
    return url || null;
  } catch {
    return null;
  }
}
