function DashboardShell({ sidebar, header, children }) {
  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">

      {/* Sidebar */}
      <aside className="w-64 shrink-0">
        {sidebar}
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">

        {/* Header */}
        <header>
          {header}
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>

      </div>

    </div>
  );
}

export default DashboardShell;