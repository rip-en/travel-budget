import React from 'react';
import { motion } from 'framer-motion';
import CheckIcon from './CheckIcon';

function StepIndicator({ step, currentStep, onClickStep, isDarkMode }) {
  const status = currentStep === step ? "active" : currentStep < step ? "inactive" : "complete";

  return (
    <motion.div onClick={() => onClickStep(step)} className="step-indicator" animate={status} initial={false}>
      <motion.div
        variants={{
          inactive: { 
            scale: 1, 
            backgroundColor: isDarkMode ? "#374151" : "#e5e7eb",
            color: isDarkMode ? "#9ca3af" : "#6b7280" 
          },
          active: { 
            scale: 1.1, 
            backgroundColor: "#22c55e",
            color: "#ffffff" 
          },
          complete: { 
            scale: 1, 
            backgroundColor: "#22c55e",
            color: "#ffffff" 
          },
        }}
        transition={{ duration: 0.3 }}
        className="step-indicator-inner"
      >
        {status === "complete" ? (
          <CheckIcon className="check-icon" />
        ) : status === "active" ? (
          <div className="active-dot" />
        ) : (
          <span className="step-number">{step}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

export default StepIndicator; 