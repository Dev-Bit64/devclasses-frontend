import React, { useState, useRef, useEffect } from 'react';
import { DownOutlined } from '@ant-design/icons';
import './CustomDropdown.scss';

// Dropdown option type
export interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: 'large' | 'middle' | 'small';
}

/**
 * CustomDropdown - A custom dropdown component resembling Ant Design's Select
 * - Closes automatically after selection
 * - Keyboard and mouse support
 * - Styled to match Ant Design
 */
const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select',
  disabled = false,
  className = '',
  size = 'middle',
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
    onChange(optionValue);
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

  return (
    <div
      className={`custom-dropdown ${open ? 'open' : ''} ${disabled ? 'disabled' : ''} ${className} custom-dropdown-${size}`}
      tabIndex={disabled ? -1 : 0}
      ref={ref}
      onClick={() => !disabled && setOpen((prev) => !prev)}
      onKeyDown={handleKeyDown}
      aria-haspopup="listbox"
      aria-expanded={open}
    >
      <div className="custom-dropdown-selector">
        <span className={`custom-dropdown-value ${!selectedLabel ? 'placeholder' : ''}`}>
          {selectedLabel || placeholder}
        </span>
        <DownOutlined className="custom-dropdown-arrow" />
      </div>
      {open && (
        <div className="custom-dropdown-list" role="listbox">
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