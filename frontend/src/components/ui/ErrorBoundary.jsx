import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
          <div className="glass-panel max-w-md p-8 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-red-100 text-red-600 text-2xl font-black">!</div>
            <h1 className="text-xl font-black tracking-tight">Algo salio mal</h1>
            <p className="mt-2 text-sm text-stone-600">
              Ocurrio un error inesperado. Podes recargar la pagina o volver al inicio.
            </p>
            {this.props.fallbackAction || (
              <div className="mt-6 flex justify-center gap-3">
                <button onClick={() => window.location.reload()} className="btn-primary">
                  Recargar pagina
                </button>
                <a href="/" className="btn-secondary">Volver al inicio</a>
              </div>
            )}
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-xs font-semibold text-stone-400">Detalles tecnicos</summary>
                <pre className="mt-2 overflow-auto rounded bg-stone-100 p-3 text-xs text-stone-600">{this.state.error.message}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
