"use server";

import { Configuration } from "@/types";
import { prisma } from "@/lib/prisma";
import { configurationSchema } from "../validators";
import { formatError } from "../utils";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/* ================= GET CONFIGURATION ================= */
export async function getConfiguration() {
  try {
    const config = await prisma.configuration.findFirst();
    return config ?? null;
  } catch (error) {
    console.error("Error fetching configuration:", error);
    return null;
  }
}

/* ================= SAVE FILE ================= */
async function saveUploadedFile(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const extension = path.extname(file.name || "") || ".png";
  const fileName = `${randomUUID()}${extension}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, fileName);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, buffer);

  return `/uploads/${fileName}`;
}

/* ================= SAVE FROM FORM ================= */
export async function saveConfigurationFromForm(formData: FormData) {
  try {
    const existing = await prisma.configuration.findFirst();

    const logoInput = formData.get("logo");
    const faviconInput = formData.get("favicon");

    const existingLogo = String(formData.get("existingLogo") || "").trim();
    const existingFavicon = String(formData.get("existingFavicon") || "").trim();

    let logo: string | undefined = existingLogo || undefined;
    let favicon: string | undefined = existingFavicon || undefined;

    if (logoInput instanceof File && logoInput.size > 0) {
      logo = await saveUploadedFile(logoInput);
    }

    if (faviconInput instanceof File && faviconInput.size > 0) {
      favicon = await saveUploadedFile(faviconInput);
    }

    const payload: Configuration = {
      id: existing?.id,
      name: String(formData.get("name") || "").trim(),
      logo,
      favicon,
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || "").trim(),
    };

    return await createOrUpdateConfiguration(payload);
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: formatError(error),
    };
  }
}

/* ================= CREATE / UPDATE ================= */
export async function createOrUpdateConfiguration(data: Configuration) {
  try {
    const configuration = configurationSchema.parse(data);

    const formattedData = {
      name: configuration.name || null,
      logo:
        typeof configuration.logo === "string"
          ? configuration.logo
          : null,
      favicon:
        typeof configuration.favicon === "string"
          ? configuration.favicon
          : null,
      email: configuration.email || null,
      password: configuration.password || null,
    };

    const existing = await prisma.configuration.findFirst();

    if (existing) {
      await prisma.configuration.update({
        where: { id: existing.id },
        data: formattedData,
      });
    } else {
      await prisma.configuration.create({
        data: formattedData,
      });
    }

    return {
      success: true,
      message: "Configuration saved successfully",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: formatError(error),
    };
  }
}