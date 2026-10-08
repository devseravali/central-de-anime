
import styled from 'styled-components';

export const RankingContainer = styled.div`
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
`;

export const RankingHeader = styled.header`
    position: sticky;
    top: 0;
    z-index: 10;
    background: ${({ theme }) => theme.colors.surfaceFloating};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    backdrop-filter: blur(12px);
    padding: 12px 16px;
`;

export const HeaderContent = styled.nav`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: min(1240px, 100% - 2rem);
    margin: 0 auto;
`;

export const Brand = styled.h2`
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    font-size: 16px;
    font-weight: 700;
`;

export const BrandIcon = styled.span`
    display: block;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 8px;
`;

export const RankingMain = styled.main`
    width: min(1240px, 100% - 2rem);
    margin: 0 auto;
    padding: 1.5rem 0 3rem;
`;

export const RankingIntroduction = styled.section`
    h1 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
    }
`;

export const RankingSubtitle = styled.p`
    margin: 6px 0 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 14px;
`;

export const Section = styled.section`
    margin-top: 24px;
`;

export const SectionTitle = styled.h2`
    margin: 0;
    font-size: 16px;
    font-weight: 700;
`;

export const Podium = styled.ol`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
`;

export const RankingCard = styled.li`
    min-width: 0;
    padding: 8px;
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 10px;
`;

export const RankingAvatar = styled.figure`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 140px;
    margin: 0;
    background: ${({ theme }) => theme.colors.surfaceElevated};
    border-radius: 6px;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 13px;
`;

export const RankingInfo = styled.figcaption`
    margin-top: 8px;
`;

export const RankingTitle = styled.h3`
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    overflow-wrap: anywhere;
`;

export const RankingScore = styled.p`
    margin: 6px 0 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 12px;
`;

export const RankingList = styled.ol`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
`;

export const RankingItem = styled.li`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
`;

export const RankingPosition = styled.span`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 13px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
`;

export const RankingName = styled.span`
    flex: 1;
    min-width: 0;
    font-size: 14px;
    overflow-wrap: anywhere;
`;

export const RankingRating = styled.span`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 14px;
    font-variant-numeric: tabular-nums;
`;
