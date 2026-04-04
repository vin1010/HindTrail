import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../api";
import "./Contractors.css";

interface ContractorNode {
  id: string;
  name: string;
  type: string;
  children: ContractorNode[];
}

export default function Contractors() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tree, setTree] = useState<ContractorNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [allCompanies, setAllCompanies] = useState<any[]>([]);

  // Load tree on mount
  useEffect(() => {
    loadTree();
  }, []);

  const loadTree = async () => {
    setLoading(true);
    try {
      const data = await api.contractors.tree();
      setTree(data);
      // Flatten tree to get all companies for the link modal dropdown
      const flattened = flattenTree(data);
      setAllCompanies(flattened);
    } finally {
      setLoading(false);
    }
  };

  // Flatten nested tree to a flat list
  const flattenTree = (nodes: ContractorNode[]): any[] => {
    let result: any[] = [];
    nodes.forEach((node) => {
      result.push(node);
      result = result.concat(flattenTree(node.children));
    });
    return result;
  };

  const toggle = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const openModal = (parentId: string) => {
    setSelectedParentId(parentId);
    setSelectedChildId("");
    setShowModal(true);
  };

  const handleLink = async () => {
    if (!selectedChildId || !selectedParentId) return;
    try {
      await api.contractors.link(selectedChildId, selectedParentId);
      loadTree();
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to link contractor");
    }
  };

  if (!user) return null;
  const activeCompany = user.memberships.find((m) => m.id === user.activeCompanyId);

  return (
    <div className="contractors-layout">
      <aside className="ct-sidebar">
        <div className="ct-logo" onClick={() => navigate("/workspace")}>HindTrail</div>
        <nav className="ct-nav">
          <a onClick={() => navigate("/workspace")}><span className="ct-nav-icon">&#9632;</span> Dashboard</a>
          <a onClick={() => navigate("/projects")}><span className="ct-nav-icon">&#9645;</span> Projects</a>
          <a className="active"><span className="ct-nav-icon">&#9829;</span> Contractors</a>
        </nav>
        <div className="ct-user">
          <div className="ct-user-info">
            <div className="ct-avatar">{user.fullName.charAt(0)}</div>
            <div><strong>{user.fullName}</strong><span>{activeCompany?.name}</span></div>
          </div>
          <button className="ct-logout" onClick={() => { logout(); navigate("/login"); }}>Sign out</button>
        </div>
      </aside>

      <main className="ct-main">
        <div className="ct-header">
          <h1>Contractor Hierarchy</h1>
          <p>View and manage sub-contractor relationships</p>
        </div>

        {loading ? (
          <p>Loading contractor structure...</p>
        ) : tree.length === 0 ? (
          <p className="ct-empty">No contractors yet. Create one to get started.</p>
        ) : (
          <div className="ct-tree">
            {tree.map((node) => (
              <ContractorNode
                key={node.id}
                node={node}
                depth={0}
                expanded={expanded}
                toggle={toggle}
                onAddClick={openModal}
              />
            ))}
          </div>
        )}
      </main>

      {/* Link modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Sub-contractor</h2>
            <div className="modal-fields">
              <label>
                Select contractor to add as sub-contractor
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                >
                  <option value="">Choose a contractor...</option>
                  {allCompanies
                    .filter((c) => c.id !== selectedParentId && c.parentCompanyId !== selectedParentId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type})
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleLink}
                disabled={!selectedChildId}
              >
                Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Recursive tree node component
function ContractorNode({
  node,
  depth,
  expanded,
  toggle,
  onAddClick,
}: {
  node: ContractorNode;
  depth: number;
  expanded: Set<string>;
  toggle: (id: string) => void;
  onAddClick: (parentId: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isOpen = expanded.has(node.id);

  return (
    <div className="ct-node" style={{ paddingLeft: depth * 24 }}>
      <div className="ct-node-row">
        <button
          className="ct-toggle"
          onClick={() => toggle(node.id)}
        >
          {hasChildren ? (isOpen ? "▾" : "▸") : "·"}
        </button>
        <span className={`ct-type-badge ct-type-${node.type}`}>
          {node.type}
        </span>
        <span className="ct-node-name">{node.name}</span>
        <button
          className="btn-ghost btn-xs ct-add-btn"
          onClick={() => onAddClick(node.id)}
        >
          + Add sub-contractor
        </button>
      </div>
      {isOpen && hasChildren && (
        <div className="ct-children">
          {node.children.map((child) => (
            <ContractorNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              toggle={toggle}
              onAddClick={onAddClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
