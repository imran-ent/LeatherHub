import { useEffect } from 'react';

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — Leather-Hub` : 'Leather-Hub';
    return () => {
      document.title = 'Leather-Hub';
    };
  }, [title]);
}