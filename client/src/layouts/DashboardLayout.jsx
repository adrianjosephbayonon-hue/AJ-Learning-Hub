import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import DashboardShell from "../components/dashboard/layout/DashboardShell";

function DashboardLayout({ children }) {
  return (
    <DashboardShell
      sidebar={<Sidebar />}
      header={<Header />}
    >
      {children}
    </DashboardShell>
  );
}

export default DashboardLayout;