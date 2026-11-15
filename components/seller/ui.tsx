export const inputClass =
  "w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c4b5fd]";

export const labelClass = "mb-1 block text-sm font-semibold text-gray-200";

export const fileClass =
  "block w-full text-sm text-gray-300 file:mr-4 file:rounded-full file:border-0 file:bg-[#c4b5fd] file:px-4 file:py-2 file:font-medium file:text-gray-900 hover:file:brightness-95";

export function Modal({
  title,
  error,
  onClose,
  children,
}: {
  title: string;
  error: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/20 bg-[#1e1b4b] p-6 text-white shadow-2xl [scrollbar-color:#6d5fd6_transparent] [scrollbar-width:thin]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold">{title}</h2>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}