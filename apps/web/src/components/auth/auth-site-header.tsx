import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { aboveFoldImageProps } from "@/lib/image-loading-props";

export function AuthSiteHeader() {
  return (
    <header className="border-b border-white/50 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-md items-center justify-center px-4 sm:h-16">
        <Link href="/" className="inline-flex items-center justify-center">
          <Image
            src="/marketing/home/brand-mark.png"
            alt="Ommm"
            width={104}
            height={104}
            className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24"
            {...aboveFoldImageProps()}
          />
        </Link>
      </div>
    </header>
  );
}
