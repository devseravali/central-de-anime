import styled from 'styled-components';

export const EmptyStyle = styled.section`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: 200px;

    padding: ${({ theme }) => theme.spacing.section.medium};

    text-align: center;
`;

export const EmptyMessage = styled.p`
    color: ${({ theme }) => theme.colors.textSecondary};

    font-family: ${({ theme }) =>
        theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.bodyMedium.fontSize};
    font-weight: ${({ theme }) =>
        theme.typography.bodyMedium.fontWeight};
    line-height: ${({ theme }) =>
        theme.typography.bodyMedium.lineHeight};
`;

export const EmptyError = styled.p`
    margin-top: ${({ theme }) => theme.spacing.component.small};

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