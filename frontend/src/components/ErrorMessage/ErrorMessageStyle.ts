import styled from 'styled-components';

export const StyledErrorMessage = styled.p`
    color: ${({ theme }) => theme.colors.danger};

    font-family: ${({ theme }) =>
        theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.bodyMedium.fontSize};
    font-weight: ${({ theme }) =>
        theme.typography.bodyMedium.fontWeight};
    line-height: ${({ theme }) =>
        theme.typography.bodyMedium.lineHeight};
`;