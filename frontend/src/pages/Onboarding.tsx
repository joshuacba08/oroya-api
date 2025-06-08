import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  const handleContinueWithoutLogin = () => {
    navigate("/projects");
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-foreground sm:text-6xl md:text-7xl">
              Bienvenido a{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Oroya API
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              La herramienta perfecta para desarrolladores en formación. Genera
              bases de datos y endpoints sin la necesidad de un servidor
              complejo.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-12">
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Rápido y Fácil
              </h3>
              <p className="text-sm text-muted-foreground">
                Configura tu API en minutos, no en horas
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Base de Datos Local
              </h3>
              <p className="text-sm text-muted-foreground">
                SQLite integrado, sin configuración adicional
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Para Aprender
              </h3>
              <p className="text-sm text-muted-foreground">
                Perfect para estudiantes y desarrolladores junior
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleContinueWithoutLogin}
              size="lg"
              className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Continuar sin cuenta
            </Button>

            <Button
              onClick={handleGoToLogin}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto min-w-[200px] border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500 font-medium transition-all duration-200"
            >
              Iniciar sesión
            </Button>
          </div>

          {/* Footer note */}
          <p className="text-sm text-muted-foreground mt-8">
            ¿Primera vez aquí? Puedes continuar sin cuenta y explorar todas las
            funcionalidades.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
