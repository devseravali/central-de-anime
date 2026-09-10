import styled from "styled-components";

export const FooterContainer = styled.footer`
    background-color: ${({ theme }) => theme.colors.background};
    padding: 20px;
    text-align: center;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const FooterText = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
`;