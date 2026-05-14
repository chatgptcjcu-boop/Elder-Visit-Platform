import Image from "next/image";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-9 w-9",
  md: "h-10 w-10",
  lg: "h-11 w-11",
};

export function BrandLogo({
  size = "md",
  className,
}: {
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm",
        sizeClasses[size],
        className,
      )}
    >
      <Image
        src="/brand/elder-visit-logo.png"
        alt="老人訪視系統 LOGO"
        fill
        sizes={size === "lg" ? "44px" : size === "md" ? "40px" : "36px"}
        className="object-contain p-1"
        priority={size === "lg"}
      />
    </div>
  );
}
