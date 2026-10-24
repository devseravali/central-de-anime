import { useAvatarImage } from '../../../hooks/UseAvatarImage/useAvatarImage';
import { StyledAvatar } from './AvatarStyle';

interface AvatarProps {
    src?: string;
    alt?: string;
    size?: 'small' | 'medium' | 'large';
}

export const Avatar = ({
    src,
    alt = 'Avatar do usuário',
    size = 'medium',
}: AvatarProps) => {
    const avatarImage = useAvatarImage(src);

    return (
        <StyledAvatar
            src={avatarImage.src}
            alt={alt}
            $size={size}
            onError={avatarImage.onError}
        />
    );
};