import { FiX } from 'react-icons/fi';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className={`card w-full ${sizes[size]} p-6 animate-slide-up max-h-[90vh] overflow-auto relative`}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            {onClose && (
              <button 
                onClick={onClose} 
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <FiX size={20} />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}