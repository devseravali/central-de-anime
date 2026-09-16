import styled from "styled-components";

export const AnimeCoverStyle = styled.article`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;

  border-radius: 8px;

  overflow: hidden;

  flex-shrink: 0;
`;

export const AnimeCoverImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

