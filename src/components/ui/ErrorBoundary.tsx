import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error in UI boundary:', error, errorInfo);
    }

    public reset = () => {
        this.setState({ hasError: false, error: undefined });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 w-full h-full bg-slate-50/50 rounded-3xl border border-red-100">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center mb-4 text-center justify-center inline-flex shadow-inner">
                        <AlertTriangle size={32} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">Error de Vista</h2>
                    <p className="text-slate-500 mb-6 text-center max-w-md font-bold text-sm leading-relaxed">
                        Hemos logrado procesar tu acción con éxito en la base de datos,
                        pero la interfaz de usuario encontró un pico de desincronización y requiere actualizarse.
                    </p>
                    <button
                        onClick={this.reset}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-700 text-white shadow-xl shadow-slate-900/30 rounded-2xl font-black hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all"
                    >
                        <RefreshCw size={18} /> Refrescar Pantalla Seguro
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
