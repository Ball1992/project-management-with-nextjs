import NextImage from 'next/image';
import { useState } from 'react';
import Box from '@mui/material/Box';
import { getImageUrl } from 'src/utils/image-url';

interface ImageWrapperProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  style?: React.CSSProperties;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export function ImageWrapper({
  src,
  alt,
  width,
  height,
  fill = false,
  style,
  className,
  priority = false,
  quality = 75,
  placeholder,
  blurDataURL,
  onLoad,
  onError,
  objectFit = 'cover',
}: ImageWrapperProps) {
  const [error, setError] = useState(false);
  const imageUrl = getImageUrl(src);

  // Fallback to regular img tag if there's an error or for external URLs
  if (error || !imageUrl) {
    return (
      <Box
        component="img"
        src={imageUrl}
        alt={alt}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          objectFit,
          ...style,
        }}
        className={className}
        onLoad={onLoad}
        onError={onError}
      />
    );
  }

  // For fill mode
  if (fill) {
    return (
      <NextImage
        src={imageUrl}
        alt={alt}
        fill
        style={{
          objectFit,
          ...style,
        }}
        className={className}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={onLoad}
        onError={(e) => {
          setError(true);
          onError?.();
        }}
        unoptimized
      />
    );
  }

  // For fixed dimensions
  return (
    <NextImage
      src={imageUrl}
      alt={alt}
      width={width || 100}
      height={height || 100}
      style={{
        objectFit,
        ...style,
      }}
      className={className}
      priority={priority}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onLoad={onLoad}
      onError={(e) => {
        setError(true);
        onError?.();
      }}
      unoptimized
    />
  );
}
