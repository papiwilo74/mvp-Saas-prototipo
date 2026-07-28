import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../context/ToastContext';

function TestComponent() {
  const { toast } = useToast();
  return (
    <div>
      <button onClick={() => toast('Mensaje exitoso')}>Success</button>
      <button onClick={() => toast('Error ocurrido', 'error')}>Error</button>
      <button onClick={() => toast('Cuidado', 'warning')}>Warning</button>
      <button onClick={() => toast('Info', 'info')}>Info</button>
    </div>
  );
}

describe('ToastContext', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows and hides success toast', () => {
    render(<ToastProvider><TestComponent /></ToastProvider>);
    act(() => { screen.getByText('Success').click(); });
    expect(screen.getByText('Mensaje exitoso')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(3500); });
    expect(screen.queryByText('Mensaje exitoso')).not.toBeInTheDocument();
  });

  it('shows error toast', () => {
    render(<ToastProvider><TestComponent /></ToastProvider>);
    act(() => { screen.getByText('Error').click(); });
    expect(screen.getByText('Error ocurrido')).toBeInTheDocument();
  });

  it('shows warning toast', () => {
    render(<ToastProvider><TestComponent /></ToastProvider>);
    act(() => { screen.getByText('Warning').click(); });
    expect(screen.getByText('Cuidado')).toBeInTheDocument();
  });

  it('shows info toast', () => {
    render(<ToastProvider><TestComponent /></ToastProvider>);
    act(() => { screen.getByRole('button', { name: 'Info' }).click(); });
    expect(screen.getByRole('alert')).toHaveTextContent('Info');
  });

  it('throws when useToast is used outside provider', () => {
    expect(() => render(<TestComponent />)).toThrow('useToast debe usarse dentro de ToastProvider');
  });
});
