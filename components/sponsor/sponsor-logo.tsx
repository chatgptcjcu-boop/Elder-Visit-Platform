import Image from "next/image";
import type { SponsorPartner } from "@/lib/domain/sponsors";
import { cn } from "@/lib/utils";

const sizeClass = {
  sm: "h-6 w-6 rounded-full text-[10px]",
  md: "h-10 w-10 rounded-lg text-sm",
  lg: "h-14 w-14 rounded-xl text-base",
  xl: "h-20 w-20 rounded-xl text-lg",
};

export function SponsorLogoMark({
  sponsor,
  size = "md",
  className,
}: {
  sponsor: SponsorPartner;
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  const fallbackText = (sponsor.logoText || sponsor.shortName || sponsor.name || "企").slice(0, 2);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden border bg-white font-semibold text-white",
        sizeClass[size],
        className,
      )}
      style={sponsor.logoUrl ? undefined : { backgroundColor: sponsor.themeColor }}
    >
      {sponsor.logoUrl ? (
        <Image
          src={sponsor.logoUrl}
          alt={`${sponsor.name} LOGO`}
          width={160}
          height={160}
          className="h-full w-full object-contain p-1"
          unoptimized
        />
      ) : (
        fallbackText
      )}
    </div>
  );
}
