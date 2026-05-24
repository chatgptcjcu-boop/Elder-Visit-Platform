import { createAdminClient } from "@/lib/supabase/admin";

export const visitorRemittanceBucket = "visitor-remittance-documents";

export async function uploadVisitorPassbook(profileId: string, imageDataUrl: string) {
  const decoded = decodeImageDataUrl(imageDataUrl);
  if (!decoded) return null;

  try {
    const path = `profiles/${profileId}/passbook-cover.jpg`;
    const supabase = createAdminClient();
    const { error } = await supabase.storage.from(visitorRemittanceBucket).upload(path, decoded, {
      contentType: "image/jpeg",
      upsert: true,
    });

    return error ? null : path;
  } catch {
    return null;
  }
}

export async function getPassbookPreviewUrl(value: string | null) {
  if (!value || value.startsWith("data:image/") || value.startsWith("http")) {
    return value;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage.from(visitorRemittanceBucket).createSignedUrl(value, 60 * 15);
    return error ? null : data.signedUrl;
  } catch {
    return null;
  }
}

export async function getPassbookBytes(value: string | null) {
  if (!value) return null;

  const decoded = decodeImageDataUrl(value);
  if (decoded) {
    return decoded;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage.from(visitorRemittanceBucket).download(value);
    return error || !data ? null : Buffer.from(await data.arrayBuffer());
  } catch {
    return null;
  }
}

function decodeImageDataUrl(value: string) {
  const match = value.match(/^data:image\/(?:jpeg|jpg|png|webp);base64,(.+)$/i);
  return match ? Buffer.from(match[1], "base64") : null;
}
