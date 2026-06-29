export default function MissingSection({ title }: { title?: string }) {
  return (
    <div className="card p-6 border-slate-200 bg-slate-50 text-center animate-fade-up">
      {title && <h3 className="text-lg font-semibold text-slate-800 mb-3">{title}</h3>}
      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-slate-500">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-700 mb-1">
        Insufficient evidence was collected to confidently generate this section.
      </p>
      <p className="text-sm text-slate-500">
        We intentionally omitted recommendations rather than guessing.
      </p>
    </div>
  );
}
