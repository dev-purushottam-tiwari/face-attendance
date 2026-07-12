import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function AuthLayout({ children, title, subtitle }) {
  const { theme, toggle } = useTheme();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
      <button
        onClick={toggle}
        className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-slate-800 shadow"
      >
        {theme === 'dark' ? <FiSun /> : <FiMoon />}
      </button>
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white text-2xl mb-3 shadow-lg">
            🎯
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          {subtitle && <p className="text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className="card p-6">{children}</div>
      </div>
    </div>
  );
}