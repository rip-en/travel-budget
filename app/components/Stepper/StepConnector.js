import React from 'react';
import { motion } from 'framer-motion';

function StepConnector({ isComplete, isDarkMode }) {
  return (
    <div className={`step-connector ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
      <motion.div
        className="step-connector-inner"
        initial={false}
        animate={{ width: isComplete ? "100%" : 0 }}
        style={{ backgroundColor: "#22c55e" }}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

export default StepConnector; 