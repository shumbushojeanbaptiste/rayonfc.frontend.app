interface Props {
  label: string;
  collapsed: boolean;
  children: React.ReactNode;
}

const SidebarTooltip = ({ label, collapsed, children }: Props) => {
  return (
    <div className="relative group flex items-center">
      {children}

      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-3 z-50
          whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white
          opacity-0 transition-opacity group-hover:opacity-100">
          {label}
        </span>
      )}
    </div>
  );
};

export default SidebarTooltip;
