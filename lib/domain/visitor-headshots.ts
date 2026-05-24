import { createAdminClient } from "@/lib/supabase/admin";

export const visitorHeadshotBucket = "visitor-headshots";

export function isInlineHeadshot(value: string | null) {
  return Boolean(value?.startsWith("data:image/"));
}

export async function uploadRegistrationHeadshot(registrationId: string, imageDataUrl: string) {
  const decoded = decodeImageDataUrl(imageDataUrl);
  if (!decoded) return null;

  const path = `registrations/${registrationId}/headshot.jpg`;
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(visitorHeadshotBucket).upload(path, decoded.bytes, {
    contentType: "image/jpeg",
    upsert: true,
  });

  return error ? null : path;
}

export async function getHeadshotPreviewUrl(value: string | null) {
  if (!value || isInlineHeadshot(value) || value.startsWith("http")) {
    return value;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage.from(visitorHeadshotBucket).createSignedUrl(value, 60 * 15);
    return error ? null : data.signedUrl;
  } catch {
    return null;
  }
}

export async function getHeadshotBytes(value: string | null) {
  if (!value) return null;

  const decoded = decodeImageDataUrl(value);
  if (decoded) {
    return decoded.bytes;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage.from(visitorHeadshotBucket).download(value);
    return error || !data ? null : Buffer.from(await data.arrayBuffer());
  } catch {
    return null;
  }
}

function decodeImageDataUrl(value: string) {
  const match = value.match(/^data:image\/(?:jpeg|jpg|png|webp);base64,(.+)$/i);
  if (!match) return null;

  return {
    bytes: Buffer.from(match[1], "base64"),
  };
}
