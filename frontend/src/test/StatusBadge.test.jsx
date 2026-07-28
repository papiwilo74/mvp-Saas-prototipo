import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../components/ui/StatusBadge';

describe('StatusBadge', () => {
  it.each([
    ['PENDING', 'Pendiente'],
    ['PREPARING', 'Preparando'],
    ['ON_THE_WAY', 'En camino'],
    ['DELIVERED', 'Entregado'],
    ['CANCELLED', 'Cancelado'],
  ])('renders label for %s', (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('falls back to raw status for unknown values', () => {
    render(<StatusBadge status="UNKNOWN" />);
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
  });
});
