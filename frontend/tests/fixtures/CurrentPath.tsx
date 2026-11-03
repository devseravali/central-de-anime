import { useLocation } from 'react-router-dom';

export const CurrentPath = () => {
  const { pathname, search } = useLocation();
  return (
    <div data-testid="current-path">
      {pathname}
      {search}
    </div>
  );
};
