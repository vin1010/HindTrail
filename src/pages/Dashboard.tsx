import "../App.css";
import HierarchyCard from "../components/HierarchyCard";

function Dashboard() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">JobTrail</div>

        <nav className="nav">
          <a className="active">Dashboard</a>
          <a>Projects</a>
          <a>Teams</a>
          <a>Tasks</a>
          <a>Documents</a>
        </nav>

        <div className="user">
          <span>Welcome back</span>
          <strong>Vindy</strong>
        </div>
      </aside>

      <main className="content">
        <h1>Mining Complex Alpha</h1>
        <p>Hierarchical Project Overview</p>

        <HierarchyCard
          title="Client: Glencore Ltd."
          subtitle="Primary stakeholder"
          progress={100}
          status="Completed"
        />

        <HierarchyCard
          title="Main Contractor: Roteq Engineering"
          subtitle="Execution partner"
          progress={78}
          status="In Progress"
        />

        <HierarchyCard
          title="Task: Equipment Installation"
          subtitle="Mechanical & safety checks"
          progress={45}
          status="Active"
        />
      </main>

      <aside className="panel">
        <h2>Project Overview</h2>
        <p>Phase: Implementation</p>
        <p>Deadline: Mar 30, 2025</p>
      </aside>
    </div>
  );
}

export default Dashboard;
