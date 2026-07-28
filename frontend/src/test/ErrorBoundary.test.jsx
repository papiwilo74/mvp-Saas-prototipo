import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

const GoodChild = () => <p>Funciona</p>;
const BadChild = () => { throw new Error('Test error'); };

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(<ErrorBoundary><GoodChild /></ErrorBoundary>);
    expect(screen.getByText('Funciona')).toBeInTheDocument();
  });

  it('renders error UI when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundary><BadChild /></ErrorBoundary>);
    expect(screen.getByText('Algo salio mal')).toBeInTheDocument();
    expect(screen.getByText('Recargar pagina')).toBeInTheDocument();
    console.error.mockRestore();
  });

  it('renders custom fallback action', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundary fallbackAction={<button>Custom</button>}><BadChild /></ErrorBoundary>);
    expect(screen.getByText('Custom')).toBeInTheDocument();
    console.error.mockRestore();
  });
});
