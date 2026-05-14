import Image from "next/image";
import { cn } from "@/lib/utils";

const sizeClasses = {
  mark: {
    sm: "h-9 w-9",
    md: "h-10 w-10",
    lg: "h-11 w-11",
  },
  full: {
    sm: "h-10 w-32",
    md: "h-12 w-44",
    lg: "h-24 w-80",
  },
};

export function BrandLogo({
  size = "md",
  variant = "mark",
  className,
}: {
  size?: keyof typeof sizeClasses.mark;
  variant?: keyof typeof sizeClasses;
  className?: string;
}) {
  const isFullLogo = variant === "full";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm",
        sizeClasses[variant][size],
        className,
      )}
    >
      <Image
        src="/brand/elder-visit-logo.png"
        alt="老人訪視系統 LOGO"
        fill
        sizes={
          isFullLogo
            ? size === "lg"
              ? "256px"
              : size === "md"
                ? "176px"
                : "128px"
            : size === "lg"
              ? "44px"
              : size === "md"
                ? "40px"
                : "36px"
        }
        className={cn(isFullLogo ? "object-contain p-1" : "object-cover object-left p-0.5")}
        priority={isFullLogo || size === "lg"}
      />
    </div>
  );
}
