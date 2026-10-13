import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Zap, ShoppingCart, Tag, Phone, Check } from 'lucide-react';

const ONBOARDING_KEY = 'ecohavana_onboarding_completed';

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const steps: OnboardingStep[] = [
  {
    icon: <Zap size={48} />,
    title: 'Bienvenido a EcoHavana',
    description: 'Tu solución integral de energía para el hogar. Estaciones de energía, plantas eléctricas y paneles solares para mantener tu hogar funcionando sin apagones.',
    color: 'from-[#16A34A] to-[#22C55E]',
  },
  {
    icon: <Zap size={48} />,
    title: 'Explora el Catálogo',
    description: 'Descubre nuestra amplia selección de productos. Filtra por categoría, busca por nombre o encuentra ofertas especiales. Cada producto incluye especificaciones detalladas.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: <ShoppingCart size={48} />,
    title: 'Carrito Inteligente',
    description: 'Añade productos a tu carrito y ajusta cantidades. Cuando estés listo, realiza tu pedido directamente por WhatsApp con un solo clic.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: <Tag size={48} />,
    title: 'Ofertas Especiales',
    description: 'Mantente atento a nuestras ofertas y descuentos exclusivos. Productos destacados y nuevas llegadas aparecen en la página de inicio.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: <Phone size={48} />,
    title: 'Contacto Directo',
    description: '¿Tienes preguntas? Contáctanos directamente por WhatsApp al +53 55072322. Estamos aquí para ayudarte con asesoría personalizada.',
    color: 'from-[#25D366] to-[#1da851]',
  },
];

export default function Onboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsVisible(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-white dark:bg-[#151B24] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-transparent dark:border-white/10 transition-colors">
        {/* Progress bar */}
        <div className="h-1 bg-gray-200 dark:bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#16A34A] to-[#22C55E] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg transform transition-all duration-500`}>
            {step.icon}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-[#111827] dark:text-slate-100 mb-3 transition-all duration-300">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-center text-gray-600 dark:text-slate-400 leading-relaxed mb-8 transition-all duration-300">
            {step.description}
          </p>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-[#16A34A] dark:bg-[#22C55E]'
                    : index < currentStep
                    ? 'w-2 bg-[#16A34A]/50 dark:bg-[#22C55E]/50'
                    : 'w-2 bg-gray-300 dark:bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                Anterior
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-4 rounded-xl bg-[#16A34A] dark:bg-[#22C55E] text-white font-medium hover:bg-[#15803D] dark:hover:bg-[#16A34A] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#16A34A]/20 dark:shadow-[#22C55E]/20"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check size={18} />
                  Comenzar
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          {/* Skip link */}
          {currentStep < steps.length - 1 && (
            <button
              onClick={handleSkip}
              className="w-full mt-4 text-sm text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
            >
              Saltar introducción
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
