import React from "react";
import { Link } from 'react-router-dom';
import type { PersonagemHookData } from "../../../types/Personagem";
import { PersonagemCardContainer, PersonagemImage, FigurePersonagem, PersonagemCaption, PersonagemName, PersonagemRole } from "./PersonagemCardStyle";
    
type PersonagemCardProps = {
  nome: string;
  imagem?: string;
  className?: string;
  id?: string | number;
  personagem?: PersonagemHookData;
  onClick?: () => void;
  urlBase?: string;
};

export const PersonagemCard: React.FC<PersonagemCardProps> = ({
  nome,
  imagem,
  className,
  id,
  personagem,
  onClick,
  urlBase,
}) => {
  const urlBaseProp = urlBase;

  const backendOrigin = React.useMemo(() => {
    try {
      return new URL(urlBaseProp ?? "http://localhost:3000/personagens/").origin;
    } catch {
      return "http://localhost:3000";
    }
  }, [urlBaseProp]);

  const normalizeImageSrc = (value?: string | null) => {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    const normalizedPath = value.startsWith("/") ? value : `/${value}`;
    return `${backendOrigin}${normalizedPath}`;
  };

  const dataNome = personagem?.nome ? String(personagem.nome) : null;
  const dataImagem = personagem?.imagem ? String(personagem.imagem) : null;
  const personagemRole =
    typeof personagem?.role === 'string'
      ? personagem.role
      : typeof personagem?.papel === 'string'
        ? personagem.papel
        : null;

  const displayNome = dataNome ?? nome;
  const displayImagem =
    normalizeImageSrc(dataImagem) ??
    normalizeImageSrc(imagem) ??
    "/placeholder/personagem.png";

  const content = (
    <>
      <FigurePersonagem>
        <PersonagemImage src={displayImagem} alt={`Imagem de ${displayNome}`} />

        <PersonagemCaption>
          <PersonagemName>{displayNome}</PersonagemName>
          {personagemRole && (
            <PersonagemRole onClick={onClick}>{personagemRole}</PersonagemRole>
          )}
        </PersonagemCaption>
      </FigurePersonagem>
    </>
  );

  return (
    <PersonagemCardContainer className={className}>
      {id !== undefined && id !== null ? (
        <Link
          to={`/personagens/${id}`}
          aria-label={`Ver detalhes de ${displayNome}`}
          onClick={() => {
            if (typeof onClick === 'function') onClick();
          }}
          style={{ display: 'block' }}
        >
          {content}
        </Link>
      ) : (
        <PersonagemRole
          onClick={() => {
            if (typeof onClick === 'function') onClick();
          }}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          onKeyDown={(e) => {
            if (!onClick) return;
            if (e.key === 'Enter' || e.key === ' ') onClick();
          }}
        >
          {content}
        </PersonagemRole>
      )}
    </PersonagemCardContainer>
  );
};