import React from 'react';

export default function ColorPicker({ 
  label, 
  color, 
  onChange, 
  description,
  presetColors = ['#00af91', '#0077C5', '#3b82f6', '#ef4444', '#f59e0b', '#22c55e', '#8b5cf6', '#ec4899', '#6b7280']
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-24 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {presetColors.map((presetColor) => (
          <button
            key={presetColor}
            type="button"
            className={`h-6 w-6 rounded-full border ${
              color === presetColor ? 'border-gray-900 dark:border-white ring-2 ring-offset-2' : 'border-gray-300 dark:border-gray-600'
            }`}
            style={{ backgroundColor: presetColor }}
            onClick={() => onChange(presetColor)}
            aria-label={`Select color ${presetColor}`}
          />
        ))}
      </div>
    </div>
  );
}
