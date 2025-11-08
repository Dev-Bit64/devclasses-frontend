import React, { useState, useRef, useEffect } from 'react';
import { DownOutlined } from '@ant-design/icons';
import './CustomDropdown.scss';
import type { SelectProps } from 'antd';

// Dropdown option type
export interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps extends Omit<SelectProps<any>, 'options'> {
  options?: DropdownOption[];
}

/**
 * CustomDropdown - A custom dropdown component resembling Ant Design's Select
 * - Closes automatically after selection
 * - Keyboard and mouse support
 * - Styled to match Ant Design
 */
const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select',
  disabled = false,
  className = '',
  size = 'middle',
  dropdownStyle,
  style,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  /**
  /**
   * Handle option selection
   * - Calls onChange callback with selected value
   * - Closes dropdown immediately after selection
   * - Prevents event propagation to avoid double-click issues
   */
  const handleSelect = (optionValue: string, event?: React.MouseEvent) => {
    // Prevent event from bubbling up
    if (event) {
      event.stopPropagation();
    }
    // Only call onChange if it's provided
    onChange?.(optionValue);
    // Close dropdown after selection
    setOpen(false);
  };
  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') setOpen((prev) => !prev);
    if (e.key === 'Escape') setOpen(false);
  };

  // Get selected label
  const selectedLabel = options.find(opt => opt.value === value)?.label;

  // ensure the dropdown options area stays inside its panel and becomes scrollable
  const mergedDropdownStyle: React.CSSProperties = {
    maxHeight: 260,
    overflowY: 'auto',
    overflowX: 'hidden',
    // keep any custom styles passed in without breaking layout
    ...(dropdownStyle as React.CSSProperties || {}),
  };

  return (
    <div
      className={`custom-dropdown ${open ? 'open' : ''} ${disabled ? 'disabled' : ''} ${className} custom-dropdown-${size}`}
      tabIndex={disabled ? -1 : 0}
      ref={ref}
      onClick={() => !disabled && setOpen((prev) => !prev)}
      onKeyDown={handleKeyDown}
      aria-haspopup="listbox"
      aria-expanded={open}
      style={style}
    >
      <div className="custom-dropdown-selector">
        <span className={`custom-dropdown-value ${!selectedLabel ? 'placeholder' : ''}`}>
          {selectedLabel || placeholder}
        </span>
        <DownOutlined className="custom-dropdown-arrow" />
      </div>
      {open && (
        // apply mergedDropdownStyle here so long lists get an internal scrollbar
        <div className="custom-dropdown-list" role="listbox" style={mergedDropdownStyle}>
          {options.length === 0 ? (
            <div className="custom-dropdown-option disabled">No options</div>
          ) : (
            options.map(opt => (
              <div
                key={opt.value}
                className={`custom-dropdown-option${opt.value === value ? ' selected' : ''}`}
                onClick={(e) => handleSelect(opt.value, e)}
                role="option"
                aria-selected={opt.value === value}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;