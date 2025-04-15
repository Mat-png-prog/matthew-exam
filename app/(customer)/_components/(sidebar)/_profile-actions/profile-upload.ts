"use server"

import { validateRequest } from "@/auth"
import { put, del } from "@vercel/blob" // Import del function for deleting blobs
import prisma from "@/lib/prisma"

/**
 * Define allowed image types for security validation
 * Restricting to common image formats prevents upload of potentially harmful files
 */
const ALLOWED_IMAGE_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
] as const

/**
 * Maximum allowed image size in bytes (5MB)
 * Limiting file size prevents DoS attacks and excessive storage usage
 */
const MAX_IMAGE_SIZE: number = 5 * 1024 * 1024 // 5MB

/**
 * Response type for image upload operations
 * Provides type safety for all possible response scenarios
 */
export type UploadImageResponse = {
  success: boolean
  avatarUrl?: string
  imageUrl?: string
  error?: string
}

/**
 * Type for image categories
 * Using a union type for better type safety and code clarity
 */
type ImageType = "avatar" | "background"

/**
 * Server action to upload a new avatar image
 *
 * @param formData - FormData containing the avatar file to upload
 * @returns Promise with upload result including success status and URL or error
 */
export async function uploadAvatar(formData: FormData): Promise<UploadImageResponse> {
  return uploadProfileImage(formData, "avatar")
}

/**
 * Server action to upload a new background image
 *
 * @param formData - FormData containing the background file to upload
 * @returns Promise with upload result including success status and URL or error
 */
export async function uploadBackground(formData: FormData): Promise<UploadImageResponse> {
  return uploadProfileImage(formData, "background")
}

/**
 * Extract blob URL path from a full URL
 * This is needed to delete the blob using the del function
 *
 * @param url - Full URL of the blob
 * @returns The path part of the URL that can be used with del function
 */
function extractBlobPath(url: string): string {
  try {
    // Parse the URL to extract just the pathname
    const urlObj = new URL(url)
    // Return the pathname without the leading slash
    return urlObj.pathname.startsWith("/") ? urlObj.pathname.substring(1) : urlObj.pathname
  } catch (error) {
    // If URL parsing fails, return the original string
    console.error("Failed to parse blob URL:", error)
    return url
  }
}

/**
 * Delete an existing image from blob storage
 *
 * @param url - URL of the image to delete
 * @returns Promise that resolves when deletion is complete
 */
async function deleteExistingImage(url: string | null): Promise<void> {
  if (!url) return

  try {
    // Extract the blob path from the full URL
    const blobPath: string = extractBlobPath(url)

    // Delete the blob from storage
    await del(blobPath)
    console.log(`Successfully deleted old image: ${blobPath}`)
  } catch (error) {
    // Log error but don't throw - we don't want to prevent the new upload if deletion fails
    console.error("Error deleting old image:", error)
  }
}

/**
 * Helper function to handle image uploads with proper validation and error handling
 * Handles both avatar and background image uploads
 *
 * @param formData - FormData containing the image file
 * @param imageType - Type of image being uploaded (avatar or background)
 * @returns Promise with upload result including success status and URL or error
 */
async function uploadProfileImage(formData: FormData, imageType: ImageType): Promise<UploadImageResponse> {
  try {
    // Validate user authentication
    const { user } = await validateRequest()
    if (!user) throw new Error("Unauthorized access")

    // Get form data
    const fieldName: string = imageType === "avatar" ? "avatar" : "background"
    const file: File = formData.get(fieldName) as File

    // Validate file presence
    if (!file || !file.size) throw new Error(`No ${imageType} image provided`)

    // Validate image type for security
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error("Invalid file type. Allowed types are JPEG, PNG, GIF, WebP, SVG, BMP, and TIFF")
    }

    // Validate image size for performance
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error("File size must be less than 5MB")
    }

    // Get the current image URL from the database to delete it later
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        avatarUrl: imageType === "avatar",
        backgroundUrl: imageType === "background",
      },
    })

    // Determine the current image URL based on image type
    const currentImageUrl: string | null =
      imageType === "avatar" ? currentUser?.avatarUrl || null : currentUser?.backgroundUrl || null

    // Upload image to blob storage with secure naming
    const fileExt: string = file.name.split(".").pop() || "jpg"
    const timestamp: number = Date.now()
    const folder: string = imageType === "avatar" ? "avatars" : "backgrounds"
    const path: string = `${folder}/user_${user.id}_${timestamp}.${fileExt}`

    // Use Vercel Blob for optimized image storage
    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: false, // We already add timestamp for uniqueness
    })

    if (!blob.url) throw new Error("Failed to get URL from blob storage")

    // Update user's image URL in the database
    const dataField: string = imageType === "avatar" ? "avatarUrl" : "backgroundUrl"
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        [dataField]: blob.url,
      },
    })

    // After successful upload and database update, delete the old image
    if (currentImageUrl) {
      await deleteExistingImage(currentImageUrl)
    }

    // Return success response with appropriate URL field
    return imageType === "avatar" ? { success: true, avatarUrl: blob.url } : { success: true, imageUrl: blob.url }
  } catch (error) {
    // Comprehensive error handling
    console.error(`Error uploading ${imageType}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
