import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/routing/ProtectedRoute';

const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

describe('ProtectedRoute', () => {
  it('shows loading state', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    render(<ProtectedRoute><p>Contenido</p></ProtectedRoute>);
    expect(screen.getByText('Cargando sesion...')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(<MemoryRouter><ProtectedRoute><p>Contenido</p></ProtectedRoute></MemoryRouter>);
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, loading: false, isAdmin: false, isSuperAdmin: false });
    render(<ProtectedRoute><p>Contenido</p></ProtectedRoute>);
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('redirects when requireAdmin but user is not admin', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, loading: false, isAdmin: false, isSuperAdmin: false });
    render(<MemoryRouter><ProtectedRoute requireAdmin><p>Admin</p></ProtectedRoute></MemoryRouter>);
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('renders children when requireAdmin and isAdmin', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, loading: false, isAdmin: true, isSuperAdmin: false });
    render(<ProtectedRoute requireAdmin><p>Admin</p></ProtectedRoute>);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('redirects when requireSuperAdmin but user is not superadmin', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, loading: false, isAdmin: false, isSuperAdmin: false });
    render(<MemoryRouter><ProtectedRoute requireSuperAdmin><p>Super</p></ProtectedRoute></MemoryRouter>);
    expect(screen.queryByText('Super')).not.toBeInTheDocument();
  });

  it('renders children when requireSuperAdmin and isSuperAdmin', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, loading: false, isAdmin: true, isSuperAdmin: true });
    render(<ProtectedRoute requireSuperAdmin><p>Super</p></ProtectedRoute>);
    expect(screen.getByText('Super')).toBeInTheDocument();
  });
});
