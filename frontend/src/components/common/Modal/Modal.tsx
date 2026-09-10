import type { ReactNode } from 'react';

import {
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalContent,
} from './ModalStyle';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export const Modal = ({
  isOpen,
  title,
  children,
  onClose,
}: ModalProps) => {
  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay
      role="presentation"
      onClick={handleOverlayClick}
    >
      <ModalContainer
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <ModalHeader>
          <ModalTitle id="modal-title">
            {title}
          </ModalTitle>

          <CloseButton
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            ×
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          {children}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
}