'use client';

import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

/**
 * Represents a single validation rule.
 * @typedef {object} ValidationRule
 * @property {string} id - A unique identifier for the rule.
 * @property {string} text - The description of the rule (e.g., "Minimum 6 characters").
 * @property {boolean} met - Whether the rule is currently met by the input value.
 */

/**
 * ValidationIndicator Component
 * 
 * Displays a list of validation rules with visual feedback (icons and color)
 * indicating whether each rule is met.
 * 
 * @param {object} props
 * @param {ValidationRule[]} props.rules - An array of validation rule objects.
 * @param {boolean} [props.show=true] - Whether to display the indicators (useful for showing on focus/interaction).
 * @param {boolean} [props.isDarkMode] - Flag for theme-aware styling.
 */
export default function ValidationIndicator({ rules = [], show = true, isDarkMode }) {
  if (!show || !rules || rules.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1">
      {rules.map((rule) => {
        const Icon = rule.met ? CheckCircle : AlertCircle; // Using AlertCircle for unmet instead of XCircle for less visual noise
        const colorClass = rule.met 
            ? (isDarkMode ? 'text-green-400' : 'text-green-600') 
            : (isDarkMode ? 'text-yellow-400' : 'text-yellow-600');
            
        return (
          <div key={rule.id} className={`flex items-center text-xs ${colorClass}`}>
            <Icon size={14} className="mr-1.5 flex-shrink-0" />
            <span>{rule.text}</span>
          </div>
        );
      })}
    </div>
  );
} 