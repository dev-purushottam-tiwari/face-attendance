import { useState } from 'react';
import { FiCheck, FiAlertCircle, FiEye, FiEyeOff, FiLoader } from 'react-icons/fi';

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  success,
  loading,
  placeholder,
  required = false,
  helpText,
  maxLength,
  autoComplete,
  children, // For dropdowns/selects
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  
  const hasValue = value && value.length > 0;
  const showError = error && hasValue;
  const showSuccess = success && hasValue && !error;
  
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        {children ? (
          // Dropdown/Select
          <select
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={`input pr-10 ${
              showError ? 'border-red-500 focus:ring-red-500' :
              showSuccess ? 'border-green-500 focus:ring-green-500' : ''
            }`}
          >
            {children}
          </select>
        ) : (
          // Input
          <input
            type={inputType}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            autoComplete={autoComplete}
            className={`input pr-10 ${
              showError ? 'border-red-500 focus:ring-red-500' :
              showSuccess ? 'border-green-500 focus:ring-green-500' : ''
            }`}
          />
        )}
        
        {/* Status Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <FiLoader className="animate-spin text-slate-400" />}
          {showError && <FiAlertCircle className="text-red-500" />}
          {showSuccess && <FiCheck className="text-green-500" />}
          
          {/* Password toggle */}
          {isPassword && hasValue && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          )}
        </div>
      </div>
      
      {/* Error Message */}
      {showError && (
        <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
          <FiAlertCircle size={12} />
          {error}
        </p>
      )}
      
      {/* Help Text */}
      {helpText && !showError && (
        <p className="text-xs text-slate-500">{helpText}</p>
      )}
    </div>
  );
}