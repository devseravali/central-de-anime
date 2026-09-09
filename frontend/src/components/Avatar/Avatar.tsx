import { StyledAvatar } from './AvatarStyle';
interface AvatarProps {
    src?: string;
    alt?: string;
}

export const Avatar = ({
    src,
    alt = 'Avatar do usuário',
}: AvatarProps) => {
    return (
        <StyledAvatar
            src={src}
            alt={alt}
        />
    );
};