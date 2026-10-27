const failedSources = new WeakMap<HTMLImageElement, string>();

export const applyImageFallback = (
  image: HTMLImageElement,
  fallbackUrl: string
): void => {
  const failedSource = image.currentSrc || image.src;

  if (failedSources.get(image) === failedSource) {
    return;
  }

  failedSources.set(image, failedSource);
  image.src = fallbackUrl;
};
