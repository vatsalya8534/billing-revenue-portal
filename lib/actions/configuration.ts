"use server";

import { Configuration } from "@/types";
import { prisma } from "@/lib/prisma";
import { configurationSchema } from "../validators";
import { formatError } from "../utils";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// ================= GET CONFIGURATION =================
export async function getConfiguration() {
  try {
    const config = await prisma.configuration.findFirst();
    return config ?? null;
  } catch (error) {
    console.error("Error fetching configuration:", error);
    return null;
  }
}

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

export async function saveConfigurationFromForm(formData: FormData) {
  try {
    const existingId = String(formData.get("id") || "").trim();
    const currentConfiguration = existingId
      ? await prisma.configuration.findUnique({ where: { id: existingId } })
      : await prisma.configuration.findFirst();

    const logoInput = formData.get("logo");
    const faviconInput = formData.get("favicon");
    const existingLogo = String(formData.get("existingLogo") || "").trim();
    const existingFavicon = String(formData.get("existingFavicon") || "").trim();

    const logo =
      logoInput instanceof File && logoInput.size > 0
        ? await saveUploadedFile(logoInput)
        : existingLogo || undefined;

    const favicon =
      faviconInput instanceof File && faviconInput.size > 0
        ? await saveUploadedFile(faviconInput)
        : existingFavicon || undefined;

    const payload: Configuration = {
      id: currentConfiguration?.id,
      name: String(formData.get("name") || "").trim(),
      logo,
      favicon,
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || "").trim(),
    };

    return await createOrUpdateConfiguration(payload, currentConfiguration?.id);
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// ================= CREATE / UPDATE CONFIGURATION =================
export async function createOrUpdateConfiguration(
  data: Configuration,
  id?: string
) {
  try {
    // ✅ Validate input
    const configuration = configurationSchema.parse(data);

    // ✅ IMPORTANT FIX:
    // Prisma only accepts string, not File
    const formattedData = {
      ...configuration,
      logo:
        typeof configuration.logo === "string"
          ? configuration.logo
          : undefined,
      favicon:
        typeof configuration.favicon === "string"
          ? configuration.favicon
          : undefined,
    };

    // ✅ UPDATE
    if (id) {
      await prisma.configuration.update({
        where: { id },
        data: formattedData,
      });
    }
    // ✅ CREATE
    else {
      await prisma.configuration.create({
        data: formattedData,
      });
    }

    return {
      success: true,
      message: "Configuration saved successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
