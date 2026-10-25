export default function SarpraLogo({ className = 'size-16' }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 120 120"
            fill="none"
            className={className}
            role="img"
            aria-label="Logo SARPRA"
        >
            <rect width="120" height="120" rx="28" fill="#1E3A5F" />
            <rect x="26" y="56" width="28" height="38" rx="6" fill="#3B82F6" fillOpacity="0.9" />
            <rect x="58" y="32" width="36" height="62" rx="6" fill="#FFFFFF" />
            <path
                d="M68 44H84M68 54H84M68 64H84M68 74H78"
                stroke="#1E3A5F"
                strokeWidth="3"
                strokeLinecap="round"
            />
            <path d="M34 66H46M34 76H46" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="76" cy="24" r="5" fill="#38BDF8" />
        </svg>
    );
}
