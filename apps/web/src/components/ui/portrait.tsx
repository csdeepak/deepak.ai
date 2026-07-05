import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Portrait — the product's ONE likeness component.
 *
 * There is deliberately no Avatar family: D-025 rejected it (Dex has
 * no face per D-019; visitors have no accounts). The only likeness in
 * the product is Deepak's photograph, governed by DSVL §10 (honest
 * light, no synthetic imagery, yearly renewal per Brand §8).
 */
interface PortraitProps {
  src: string;
  alt: string; // meaningful alt is mandatory (media-library rule)
  size?: number;
  className?: string;
}

export function Portrait({ src, alt, size = 160, className }: PortraitProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-md border border-border object-cover", className)}
    />
  );
}
