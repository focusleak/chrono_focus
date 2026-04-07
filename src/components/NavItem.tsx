interface NavItemProps {
  label: string
  isActive: boolean
  onClick: () => void
}

export const NavItem = ({ label, isActive, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-black/10 text-gray-900 dark:bg-white/10 dark:text-white shadow-sm'
        : 'text-gray-900 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-[#2c2c2e]/80'
    }`}
    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
  >
    <span className="text-sm">{label}</span>
  </button>
)
