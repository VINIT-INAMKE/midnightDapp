"use client";

import Image from "next/image";
import { useState } from "react";

interface AvatarImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    className?: string;
}

export function AvatarImage({ src, alt, width, height, fill, className }: AvatarImageProps) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImgSrc("/default-avatar.svg");
        }
    };

    if (fill) {
        return (
            <Image
                src={imgSrc}
                alt={alt}
                fill
                className={className}
                onError={handleError}
                unoptimized={imgSrc === "/default-avatar.svg"}
            />
        );
    }

    return (
        <Image
            src={imgSrc}
            alt={alt}
            width={width || 40}
            height={height || 40}
            className={className}
            onError={handleError}
            unoptimized={imgSrc === "/default-avatar.svg"}
        />
    );
}
