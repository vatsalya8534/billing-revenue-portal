import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ZodIssueLike = {
  message?: string
}

type ErrorWithDetails = {
  name?: string
  message?: unknown
  code?: string
  meta?: { target?: string[] }
  issues?: ZodIssueLike[]
  errors?: ZodIssueLike[]
}

export function formatError(error: unknown) {
  try {
    const parsedError = error as ErrorWithDetails

    if (parsedError.name === "ZodError") {
      const issues = Array.isArray(parsedError.issues)
        ? parsedError.issues
        : Array.isArray(parsedError.errors)
          ? parsedError.errors
          : [];
      const filterErrors = issues.map(
        (issue) => issue.message,
      );

      return filterErrors.join(". ")
    } else if (parsedError.name === "PrismaClientKnownRequestError" && parsedError.code === "P2002") {
      const field = parsedError.meta?.target ? parsedError.meta.target[0] : "Field"
      return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    } else {
      return typeof parsedError.message === "string"
        ? parsedError.message
        : JSON.stringify(parsedError.message)
    }

  } catch {
    return "Something went wrong"
  }
}

export function incrementCode(value: number | string, length: number = 6): string {
  const number = typeof value === "string"
    ? parseInt(value, 10) + 1
    : value

  return number.toString().padStart(length, "0")
}
