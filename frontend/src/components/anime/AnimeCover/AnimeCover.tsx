import placeholder from '../../../assets/placeholder-capa.jpg';
import {
  AnimeCoverStyle,
  AnimeCoverImage,
} from './AnimeCoverStyle';
import { resolveAnimeCoverUrl } from '../../../utils/animeCoverUrl';
import { applyImageFallback } from '../../../utils/imageFallback';

interface AnimeCoverProps {
  src: string | null | undefined;
  alt: string;
}

export const AnimeCover = ({
  src,
  alt,
}: AnimeCoverProps) => {
  const resolved = resolveAnimeCoverUrl(src);

  return (
    <AnimeCoverStyle>
      <AnimeCoverImage
        src={resolved || placeholder}
        alt={alt}
        onError={(event) =>
          applyImageFallback(event.currentTarget, placeholder)
        }
      />
    </AnimeCoverStyle>
  );
};