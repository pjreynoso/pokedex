import { describe, it, expect } from 'vitest';

interface LastVisitedRecord {
  name: string;
  image: string;
  timestamp: number;
}

interface DismissedRecord {
  timestamp: number;
}

// Logic extractor representing the Toast display rule in Shell (Fase 7)
function shouldDisplayToast(
  lastVisited: LastVisitedRecord | null,
  dismissed: DismissedRecord | null
): boolean {
  if (!lastVisited || !lastVisited.name) {
    return false;
  }
  if (!dismissed) {
    return true;
  }
  return lastVisited.timestamp > dismissed.timestamp;
}

describe('Regla de Descarte y Visualización del Toast al Recargar', () => {
  it('no muestra el toast si no existe ningún Pokémon visitado', () => {
    expect(shouldDisplayToast(null, null)).toBe(false);
  });

  it('muestra el toast si existe un Pokémon visitado y no ha sido descartado', () => {
    const lastVisited: LastVisitedRecord = {
      name: 'pikachu',
      image: 'https://img.com/pikachu.png',
      timestamp: 1000,
    };
    expect(shouldDisplayToast(lastVisited, null)).toBe(true);
  });

  it('no muestra el toast si fue descartado para la misma visita (timestamp igual)', () => {
    const lastVisited: LastVisitedRecord = {
      name: 'pikachu',
      image: 'https://img.com/pikachu.png',
      timestamp: 1000,
    };
    const dismissed: DismissedRecord = {
      timestamp: 1000,
    };
    expect(shouldDisplayToast(lastVisited, dismissed)).toBe(false);
  });

  it('vuelve a mostrar el toast cuando se produce una nueva visita con timestamp posterior', () => {
    const dismissed: DismissedRecord = {
      timestamp: 1000,
    };
    const newVisit: LastVisitedRecord = {
      name: 'mewtwo',
      image: 'https://img.com/mewtwo.png',
      timestamp: 1500,
    };
    expect(shouldDisplayToast(newVisit, dismissed)).toBe(true);
  });
});
