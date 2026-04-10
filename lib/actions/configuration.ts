"use server";

import { Configuration } from "@/types";
import { prisma } from "@/lib/prisma";
import { configurationSchema } from "../validators";
import { formatError } from "../utils";

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