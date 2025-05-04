import React, { useState, Children, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

export const Step = ({ children }) => {
  return <div className="py-2">{children}</div>;
};

const stepVariants = {
  enter: (dir) => ({
    x: dir >= 0 ? "-100%" : "100%",
    opacity: 0,
  }),
  center: {
    x: "0%",
    opacity: 1,
  },
  exit: (dir) => ({
    x: dir >= 0 ? "50%" : "-50%",
    opacity: 0,
  }),
};

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  isDarkMode = false,
  allowSkipping = false,
  isSubmitting = false,
  finalStepLabel = "Create"
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep) => {
    // Only proceed if not going past the final step OR if onStepChange allows it
    let canProceed = true;
    if (newStep <= totalSteps) {
        // Call the parent's validation/handler
        canProceed = onStepChange(newStep);
    }

    // Only update state and potentially call final step handler if allowed
    if (canProceed) {
        setCurrentStep(newStep);
        if (newStep > totalSteps) {
            onFinalStepCompleted();
        }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setDirection(1);
      updateStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  const handleStepClick = (stepNumber) => {
    const isValidStep = allowSkipping || 
                       stepNumber <= currentStep || 
                       stepNumber === currentStep + 1;
    
    if (isValidStep) {
      setDirection(stepNumber > currentStep ? 1 : -1);
      updateStep(stepNumber);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className={`w-full max-w-lg p-6 rounded-xl ${isDarkMode ? 'bg-black shadow-lg border border-gray-800' : 'bg-white shadow-md border border-gray-100'} backdrop-blur-md`}>
        {/* Content first - moves content above step indicators */}
        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className="w-full"
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>
        
        {/* Step indicators moved below content */}
        <div className="flex justify-center items-center gap-4 mt-4">
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            const isClickable = allowSkipping || 
                               stepNumber <= currentStep || 
                               stepNumber === currentStep + 1;
            
            return (
              <div 
                key={stepNumber}
                className={`p-1 transition-all duration-200 ${
                  isClickable && !isSubmitting ? "cursor-pointer hover:scale-110" : "cursor-not-allowed opacity-70"
                }`}
                onClick={() => !isSubmitting && isClickable && handleStepClick(stepNumber)}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30 scale-110' 
                      : isCompleted 
                        ? 'bg-green-600 text-white shadow-sm shadow-green-500/20' 
                        : isDarkMode
                          ? 'bg-gray-800 text-gray-400'
                          : 'bg-gray-100 text-gray-500 border border-gray-300/50'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <span className={isActive ? 'text-white' : ''}>{stepNumber}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {!isCompleted && (
          <div className="w-full mt-6">
            <div className={`flex ${currentStep !== 1 ? "justify-between" : "justify-end"} gap-4`}>
              {currentStep !== 1 && (
                <button
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-800/50' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-200/80'
                  } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  ← Previous
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                  isDarkMode 
                    ? 'bg-cyan-500 hover:bg-cyan-600 shadow-sm shadow-cyan-500/20' 
                    : 'bg-cyan-600 hover:bg-cyan-700 shadow-sm shadow-cyan-600/20'
                } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'transform hover:scale-105'}`}
              >
                {isSubmitting && isLastStep && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLastStep ? finalStepLabel : "Next →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepContentWrapper({ isCompleted, currentStep, direction, children, className }) {
  const [parentHeight, setParentHeight] = useState(0);

  return (
    <motion.div
      className={className}
      style={{ position: "relative", overflow: "hidden" }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: "spring", duration: 0.4 }}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition key={currentStep} direction={direction} onHeightReady={(h) => setParentHeight(h)}>
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SlideTransition({ children, direction, onHeightReady }) {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (containerRef.current) onHeightReady(containerRef.current.offsetHeight);
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
      style={{ position: "absolute", left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}
