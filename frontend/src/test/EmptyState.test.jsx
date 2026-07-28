import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders empty state with title and description', () => {
    render(<EmptyState title="Sin datos" description="No hay elementos" />);
    expect(screen.getByText('Sin datos')).toBeInTheDocument();
    expect(screen.getByText('No hay elementos')).toBeInTheDocument();
  });

  it('renders loading skeleton', () => {
    const { container } = render(<EmptyState isLoading />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<EmptyState isError errorMessage="Error de conexion" />);
    expect(screen.getByText('Algo salio mal')).toBeInTheDocument();
    expect(screen.getByText('Error de conexion')).toBeInTheDocument();
  });

  it('renders action button', () => {
    render(<EmptyState title="Test" description="Test" action={<button>Retry</button>} />);
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});
