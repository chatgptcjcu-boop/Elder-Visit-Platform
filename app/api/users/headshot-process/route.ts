import { NextResponse } from "next/server";
import sharp from "sharp";

type HeadshotProcessRequest = {
  imageDataUrl?: string;
};

const maxImageBytes = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const body = (await request.json()) as HeadshotProcessRequest;
  const imageDataUrl = body.imageDataUrl;

  if (!imageDataUrl) {
    return NextResponse.json(
      { error: { code: "MISSING_IMAGE", message: "請先上傳自拍照片。" } },
      { status: 400 },
    );
  }

  const match = imageDataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);
  if (!match) {
    return NextResponse.json(
      { error: { code: "INVALID_IMAGE", message: "照片格式需為 JPG、PNG 或 WebP。" } },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.byteLength > maxImageBytes) {
    return NextResponse.json(
      { error: { code: "IMAGE_TOO_LARGE", message: "照片檔案過大，請改用較小的照片。" } },
      { status: 413 },
    );
  }

  const processed = await sharp(buffer)
    .rotate()
    .resize({
      width: 300,
      height: 400,
      fit: "cover",
      position: "attention",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  return NextResponse.json({
    data: {
      processedDataUrl: `data:image/jpeg;base64,${processed.toString("base64")}`,
      width: 300,
      height: 400,
      mode: "server_document_photo",
      note: "已完成伺服器端白底一寸比例裁切與壓縮；尚未接入外部 AI 去背服務。",
    },
  });
}
