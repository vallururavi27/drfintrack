import React from 'react';

/**
 * Toggle Switch Component
 * @param {Object} props - Component props
 * @param {boolean} props.checked - Whether the toggle is checked
 * @param {Function} props.onChange - Function to call when toggle changes
 * @param {string} props.label - Label for the toggle
 * @param {string} props.id - Unique ID for the toggle
 */
export default function ToggleSwitch({ checked, onChange, label, id }) {
  return (
    <label htmlFor={id} className="toggle-switch">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="toggle-switch-input"
      />
      <span className="toggle-switch-label"></span>
      {label && <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{label}</span>}
    </label>
  );
}
