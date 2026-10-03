import React from "react";
import usePersonagem from "../../../hooks/UsePersonagem/UsePersonagem";
import { PersonagemCardContainer, PersonagemImage, FigurePersonagem, PersonagemCaption, PersonagemName } from "./PersonagemCardStyle";
    
type PersonagemCardProps = {
  nome: string;
  imagem?: string;
  className?: string;
  id?: string | number;
  urlBase?: string;
};

export const PersonagemCard: React.FC<PersonagemCardProps> = ({
  nome,
  imagem,
  className,
  id,
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

  return (
    <PersonagemCardContainer className={className}> 
      {loading ? (
        <p>Carregando personagem...</p>
      ) : error ? (
        <p role="alert">Erro: {error}</p>
      ) : (
        <>
          <FigurePersonagem>
            <PersonagemImage src={displayImagem} alt={`Imagem de ${displayNome}`} />

            <PersonagemCaption>
              <PersonagemName>{displayNome}</PersonagemName>
            </PersonagemCaption>
          </FigurePersonagem>
        </>
      )}
    </PersonagemCardContainer>
  );
};