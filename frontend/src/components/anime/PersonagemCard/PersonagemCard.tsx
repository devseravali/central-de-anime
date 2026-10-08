import React from "react";
import { Link } from 'react-router-dom';
import usePersonagem from "../../../hooks/UsePersonagem/UsePersonagem";
import { PersonagemCardContainer, PersonagemImage, FigurePersonagem, PersonagemCaption, PersonagemName, PersonagemRole } from "./PersonagemCardStyle";
    
type PersonagemCardProps = {
  nome: string;
  imagem?: string;
  className?: string;
  id?: string | number;
  onClick?: () => void;
  urlBase?: string;
};

export const PersonagemCard: React.FC<PersonagemCardProps> = ({
  nome,
  imagem,
  className,
  id,
  onClick,
  urlBase,
}) => {
  const urlBaseProp = urlBase;
  const { data, loading, error } = usePersonagem({ url: undefined, id, urlBase: urlBaseProp });

  const backendOrigin = React.useMemo(() => {
    try {
      return new URL(urlBaseProp ?? "http://localhost:3000/personagens/").origin;
    } catch {
      return "http://localhost:3000";
    }
  }, [urlBaseProp]);

  const normalizeImageSrc = React.useCallback((value?: string | null) => {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    const normalizedPath = value.startsWith("/") ? value : `/${value}`;
    return `${backendOrigin}${normalizedPath}`;
  }, [backendOrigin]);

  const dataNome = data?.nome ? String(data.nome) : null;
  const dataImagem = data?.imagem ? String(data.imagem) : null;

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
          {typeof data?.role === 'string' && (
            <PersonagemRole onClick={onClick}>{data.role}</PersonagemRole>
          )}
        </PersonagemCaption>
      </FigurePersonagem>
    </>
  );

  return (
    <PersonagemCardContainer className={className}>
      {loading ? (
        <p>Carregando personagem...</p>
      ) : error ? (
        <p role="alert">Erro: {error}</p>
      ) : id !== undefined && id !== null ? (
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