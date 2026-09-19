import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SaasLayout } from '../layouts/SaasLayout';

describe('SaasLayout', () => {
  it('renders clean OrderFlow SaaS header and branding', () => {
    render(
      <MemoryRouter>
        <SaasLayout>
          <div>Contenido de Login</div>
        </SaasLayout>
      </MemoryRouter>
    );

    // Branding OrderFlow presente
    expect(screen.getByText('OrderFlow')).toBeInTheDocument();
    expect(screen.getByText('SaaS para negocios')).toBeInTheDocument();
    expect(screen.getByText('Calculadora de Ahorro')).toBeInTheDocument();
    expect(screen.getByText('Ingreso')).toBeInTheDocument();
    expect(screen.getByText('Probar 14 días gratis')).toBeInTheDocument();

    // Contenido hijo presente
    expect(screen.getByText('Contenido de Login')).toBeInTheDocument();

    // Enlaces de pie de página SaaS
    expect(screen.getByText('Términos de Servicio')).toBeInTheDocument();
    expect(screen.getByText('Política de Privacidad')).toBeInTheDocument();

    // NUNCA debe contener Demo Burger ni banner de demostración
    expect(screen.queryByText(/demo burger/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/entorno de demostración/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/3 zonas de entrega/i)).not.toBeInTheDocument();
  });
});
