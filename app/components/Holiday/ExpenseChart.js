'use client';

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getCurrencySymbol } from '../../lib/utils'; // Assuming utils is two levels up
import { CATEGORY_COLORS } from '../../lib/constants'; // Import centralized colors

/**
 * ExpenseChart Component
 * 
 * Displays a Pie chart visualizing expense distribution by category.
 */
export default function ExpenseChart({ expenses, currency, isDarkMode }) {

  // Memoize processed data for the chart
  const chartData = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const dataMap = expenses.reduce((acc, expense) => {
      const category = expense.category || 'Other';
      const amount = Number(expense.amount) || 0;
      if (amount > 0) { // Only include positive expenses
        acc[category] = (acc[category] || 0) + amount;
      }
      return acc;
    }, {});

    // Convert map to array suitable for Recharts, calculate percentages
    const total = Object.values(dataMap).reduce((sum, val) => sum + val, 0);
    return Object.entries(dataMap).map(([name, value]) => ({
      name,
      value,
      // percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
      color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Default,
    }));
  }, [expenses]);

  const currencySymbol = getCurrencySymbol(currency);

  // Custom Tooltip Content
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-2 rounded shadow-lg text-xs ${isDarkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-700 border border-gray-200'}`}>
          <p className="font-semibold">{data.name}</p>
          <p>{`${currencySymbol}${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
          {/* <p>{`${data.percentage}%`}</p> */}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className={`flex items-center justify-center h-48 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/80'}`}>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No expense data for chart.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 200 }}> {/* Set explicit height */}
        <ResponsiveContainer>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    // label={renderCustomizedLabel} // Optional: Add labels if needed
                    outerRadius={80} // Adjust size
                    innerRadius={40} // Make it a donut chart
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {/* <Legend /> */}
            </PieChart>
        </ResponsiveContainer>
    </div>
  );
} 