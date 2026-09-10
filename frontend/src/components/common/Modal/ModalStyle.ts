import styled from 'styled-components';

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: ${({ theme }) => theme.spacing.page.mobile};

  background-color: rgba(0, 0, 0, 0.7);

  overflow-y: auto;
`;

export const ModalContainer = styled.div`
  width: 100%;
  max-width: 520px;
  max-height: calc(100vh - 2rem);

  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};

  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radii.modal};

  box-shadow: ${({ theme }) => theme.shadows.modal};

  overflow: hidden;
`;

export const ModalHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: ${({ theme }) => theme.spacing.component.medium};

  padding: ${({ theme }) => theme.spacing.component.large};

  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.textPrimary};

  font-family: ${({ theme }) =>
    theme.typography.headlineMedium.fontFamily};

  font-size: ${({ theme }) =>
    theme.typography.headlineMedium.fontSize};

  font-weight: ${({ theme }) =>
    theme.typography.headlineMedium.fontWeight};

  line-height: ${({ theme }) =>
    theme.typography.headlineMedium.lineHeight};
`;

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;

  flex-shrink: 0;

  background-color: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};

  border-radius: ${({ theme }) => theme.radii.button};

  font-size: 24px;
  line-height: 1;

  transition:
    background-color 200ms ease,
    color 200ms ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceElevated};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:focus-visible {
    outline: none;

    box-shadow: ${({ theme }) =>
      theme.shadows.primaryGlow};
  }
`;

export const ModalContent = styled.div`
  padding: ${({ theme }) => theme.spacing.component.large};

  overflow-y: auto;
`;