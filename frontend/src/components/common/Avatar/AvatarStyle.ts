import styled from 'styled-components';

interface StyledAvatarProps {
    $size: 'small' | 'medium' | 'large';
}

export const StyledAvatar = styled.img<StyledAvatarProps>`
    width: ${({ $size }) => {
        if ($size === 'small') return '32px';
        if ($size === 'large') return '64px';

        return '40px';
    }};

    height: ${({ $size }) => {
        if ($size === 'small') return '32px';
        if ($size === 'large') return '64px';

        return '40px';
    }};

    flex-shrink: 0;

    border-radius: ${({ theme }) => theme.radii.avatar};

    object-fit: cover;

    background-color: ${({ theme }) =>
        theme.colors.surfaceElevated};

    border: 2px solid ${({ theme }) => theme.colors.border};

    transition:
        border-color 200ms ease,
        box-shadow 200ms ease;

    &:hover {
        border-color: ${({ theme }) => theme.colors.borderHover};
    }
`;