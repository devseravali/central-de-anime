import styled from 'styled-components';

export const Page = styled.section`
    width: 100%;
    min-height: calc(100vh - 220px);
    padding: ${({ theme }) => theme.spacing.page.mobile};

    background:
        radial-gradient(
            900px 320px at 12% 0%,
            ${({ theme }) => theme.colors.primary}22,
            transparent 65%
        ),
        radial-gradient(
            760px 280px at 88% 8%,
            ${({ theme }) => theme.colors.cyan}16,
            transparent 68%
        ),
        ${({ theme }) => theme.colors.background};
`;

export const Container = styled.section`
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;

    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.component.medium};
`;

export const TopActions = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing.component.small};
    flex-wrap: wrap;
`;

export const BackButton = styled.button`
    min-height: 42px;
    border-radius: ${({ theme }) => theme.radii.button};
    padding: 0.55rem 1rem;
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};

    display: inline-flex;
    align-items: center;
    gap: 0.45rem;

    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};
`;

export const SaveButton = styled.button`
    min-height: 42px;
    border-radius: ${({ theme }) => theme.radii.button};
    padding: 0.55rem 1rem;
    border: 1px solid transparent;
    background: linear-gradient(
        90deg,
        ${({ theme }) => theme.colors.primary},
        ${({ theme }) => theme.colors.primaryHover}
    );
    color: ${({ theme }) => theme.colors.white};

    display: inline-flex;
    align-items: center;
    gap: 0.45rem;

    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

export const Card = styled.section`
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radii.card};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: ${({ theme }) => theme.shadows.card};
    padding: ${({ theme }) => theme.spacing.component.medium};

    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.component.medium};
`;

export const FormCard = styled.section`
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.card};
    background: ${({ theme }) => theme.colors.surfaceElevated};
    padding: ${({ theme }) => theme.spacing.component.medium};

    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.component.small};
`;

export const FieldsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: ${({ theme }) => theme.spacing.component.small};

    @media (min-width: 860px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
`;

export const FieldLabel = styled.label`
    display: block;
    margin-bottom: 0.35rem;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
`;

export const FieldInput = styled.input`
    width: 100%;
    min-height: 42px;
    border-radius: ${({ theme }) => theme.radii.input};
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};
    padding: 0.55rem 0.7rem;

    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};

    &:disabled {
        opacity: 0.75;
        cursor: not-allowed;
    }
`;

export const Heading = styled.h1`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.headlineLarge.fontFamily};
    font-size: clamp(1.4rem, 2.8vw, 2rem);
`;

export const SubHeading = styled.p`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

export const PreviewRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.component.small};
`;

export const AvatarPreview = styled.img`
    width: 88px;
    height: 88px;
    border-radius: ${({ theme }) => theme.radii.card};
    border: 2px solid ${({ theme }) => theme.colors.borderStrong};
    object-fit: cover;
    background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const PickerGrid = styled.ul`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${({ theme }) => theme.spacing.component.small};
    max-height: 460px;
    overflow-y: auto;
    padding-right: 0.25rem;

    @media (min-width: 640px) {
        grid-template-columns: repeat(5, minmax(0, 1fr));
    }

    @media (min-width: 980px) {
        grid-template-columns: repeat(7, minmax(0, 1fr));
    }
`;

export const AvatarOptionButton = styled.button<{ $selected?: boolean }>`
    width: 100%;
    border: 2px solid
        ${({ theme, $selected }) =>
            $selected ? theme.colors.primary : theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.card};
    background: ${({ theme }) => theme.colors.surfaceElevated};
    padding: 0.3rem;
    cursor: pointer;

    transition:
        border-color 160ms ease,
        transform 160ms ease,
        box-shadow 160ms ease;

    &:hover {
        border-color: ${({ theme }) => theme.colors.primaryHover};
        transform: translateY(-1px);
    }

    &:focus-visible {
        outline: 2px solid ${({ theme }) => theme.colors.cyan};
        outline-offset: 2px;
    }
`;

export const AvatarOptionImage = styled.img`
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: ${({ theme }) => theme.radii.card};
    object-fit: cover;
`;

export const AvatarOptionName = styled.span`
    display: block;
    margin-top: 0.35rem;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};
    text-align: center;
`;

export const BannerPreview = styled.div<{ $imageUrl?: string | null }>`
    width: min(100%, 560px);
    min-height: 140px;
    border-radius: ${({ theme }) => theme.radii.card};
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};

    background:
        linear-gradient(
            145deg,
            ${({ theme }) => theme.colors.bannerOverlay},
            ${({ theme }) => theme.colors.surface}
        )
        ${({ $imageUrl }) => ($imageUrl ? `, url(${$imageUrl})` : '')};
    background-size: cover;
    background-position: center;
`;

export const BackgroundGrid = styled.ul`
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: ${({ theme }) => theme.spacing.component.small};

    @media (min-width: 640px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
`;

export const BackgroundOptionButton = styled.button<{ $selected?: boolean }>`
    width: 100%;
    border: 2px solid
        ${({ theme, $selected }) =>
            $selected ? theme.colors.primary : theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.card};
    background: ${({ theme }) => theme.colors.surfaceElevated};
    padding: 0.35rem;
    cursor: pointer;

    transition:
        border-color 160ms ease,
        transform 160ms ease;

    &:hover {
        border-color: ${({ theme }) => theme.colors.primaryHover};
        transform: translateY(-1px);
    }
`;

export const BackgroundOptionImage = styled.img`
    width: 100%;
    height: 104px;
    border-radius: ${({ theme }) => theme.radii.card};
    object-fit: cover;
`;

export const Feedback = styled.span<{ $kind?: 'success' | 'error' }>`
    color: ${({ theme, $kind }) =>
        $kind === 'success' ? theme.colors.success : theme.colors.danger};
    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;
