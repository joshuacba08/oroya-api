import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log("Login attempted with:", { email, password });
    // For now, navigate to home after "login"
    navigate("/home");
  };

  const handleCreateAccount = () => {
    // TODO: Navigate to register page when implemented
    console.log("Create account clicked");
  };

  const handleForgotPassword = () => {
    // TODO: Navigate to forgot password page when implemented
    console.log("Forgot password clicked");
  };

  const handleBackToOnboarding = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center dark">
      <div className="max-w-md w-full mx-auto px-6">
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Iniciar Sesión
            </h1>
            <p className="text-muted-foreground">
              Bienvenido de vuelta a{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                Oroya API
              </span>
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground text-left"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="tu@ejemplo.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground text-left"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                Iniciar Sesión
              </Button>
            </form>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                onClick={handleForgotPassword}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          {/* Create Account Section */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                ¿No tienes cuenta?
              </h3>
              <p className="text-sm text-muted-foreground">
                Crea una cuenta para sincronizar tus proyectos y acceder desde
                cualquier dispositivo
              </p>
              <Button
                onClick={handleCreateAccount}
                variant="outline"
                size="lg"
                className="w-full border-border hover:bg-accent hover:text-accent-foreground font-medium"
              >
                Crear cuenta nueva
              </Button>
            </div>
          </div>

          {/* Back to Onboarding */}
          <div className="text-center">
            <button
              onClick={handleBackToOnboarding}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
