import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../components/ui/Pagination';

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onChange={() => {}} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders page info', () => {
    render(<Pagination page={2} totalPages={5} onChange={() => {}} />);
    expect(screen.getByText('Pagina 2 de 5')).toBeInTheDocument();
  });

  it('disables previous on first page', () => {
    render(<Pagination page={1} totalPages={5} onChange={() => {}} />);
    expect(screen.getByText('Anterior')).toBeDisabled();
    expect(screen.getByText('Siguiente')).not.toBeDisabled();
  });

  it('disables next on last page', () => {
    render(<Pagination page={5} totalPages={5} onChange={() => {}} />);
    expect(screen.getByText('Anterior')).not.toBeDisabled();
    expect(screen.getByText('Siguiente')).toBeDisabled();
  });

  it('calls onChange with next page', () => {
    const onChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onChange={onChange} />);
    fireEvent.click(screen.getByText('Siguiente'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('calls onChange with previous page', () => {
    const onChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onChange={onChange} />);
    fireEvent.click(screen.getByText('Anterior'));
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
