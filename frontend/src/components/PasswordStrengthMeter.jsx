import { getPasswordStrength } from '../utils/validation';

export default function PasswordStrengthMeter({ password }) {
  const { score, label, color, checks } = getPasswordStrength(password);
  
  if (!password) return null;
  
  const colors = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  };
  
  const textColors = {
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
  };
  
  const percentage = (score / 7) * 100;
  
  return (
    <div className="space-y-2 animate-fade-in">
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colors[color]} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`text-xs font-semibold ${textColors[color]}`}>
          {label}
        </span>
      </div>
      
      {/* Requirements Checklist */}
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className={`flex items-center gap-1 ${checks.length ? 'text-green-600' : 'text-slate-400'}`}>
          {checks.length ? '✓' : '○'} 8+ characters
        </div>
        <div className={`flex items-center gap-1 ${checks.uppercase ? 'text-green-600' : 'text-slate-400'}`}>
          {checks.uppercase ? '✓' : '○'} Uppercase letter
        </div>
        <div className={`flex items-center gap-1 ${checks.lowercase ? 'text-green-600' : 'text-slate-400'}`}>
          {checks.lowercase ? '✓' : '○'} Lowercase letter
        </div>
        <div className={`flex items-center gap-1 ${checks.number ? 'text-green-600' : 'text-slate-400'}`}>
          {checks.number ? '✓' : '○'} Number
        </div>
        <div className={`flex items-center gap-1 ${checks.special ? 'text-green-600' : 'text-slate-400'}`}>
          {checks.special ? '✓' : '○'} Special char (@$!%*?&)
        </div>
      </div>
    </div>
  );
}