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
    return (
        <StyledAvatar
            src={src}
            alt={alt}
            $size={size}
        />
    );
};