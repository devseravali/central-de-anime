import styled from 'styled-components';

export const StyledAvatar = styled.img`
    width: 40px;
    height: 40px;

    border-radius: ${({ theme }) => theme.radii.avatar};

    object-fit: cover;

    background-color: ${({ theme }) => theme.colors.surfaceElevated};
`;