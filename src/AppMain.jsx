import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AppMain.css";

const API_URL = "https://ajanlat-app.onrender.com";

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templateItems, setTemplateItems] = useState([]);

  const [editingItemId, setEditingItemId] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateItemId, setTemplateItemId] = useState("");
  const [templateQuantity, setTemplateQuantity] = useState("");

  const [projectId, setProjectId] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [activeProjectName, setActiveProjectName] = useState("");
  const [projectItems, setProjectItems] = useState([]);
  const [projectTotal, setProjectTotal] = useState(0);

  const [quantities, setQuantities] = useState({});
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState("work");
  const [unit, setUnit] = useState("m2");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const jsonAuthHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const handleAuthError = (res) => {
    if (res.status === 401) {
      localStorage.removeItem("user_id");
      localStorage.removeItem("token");
      navigate("/login");
      return true;
    }

    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const loadItems = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/items/me`, { headers: authHeaders });
      if (handleAuthError(res)) return;

      const data = await res.json();
      const safeData = Array.isArray(data) ? data : [];

      setItems(safeData);

      const initialQuantities = {};
      safeData.forEach((item) => {
        initialQuantities[item.id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (err) {
      console.error("Item betöltési hiba:", err);
      setItems([]);
    }
  };

  const loadProjects = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/projects/me`, { headers: authHeaders });
      if (handleAuthError(res)) return;

      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Projekt lista betöltési hiba:", err);
      setProjects([]);
    }
  };

  const loadCustomers = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/customers/me`, { headers: authHeaders });
      if (handleAuthError(res)) return;

      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Ügyfél lista betöltési hiba:", err);
      setCustomers([]);
    }
  };

  const loadTemplates = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/templates/me`, { headers: authHeaders });
      if (handleAuthError(res)) return;

      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Template betöltési hiba:", err);
      setTemplates([]);
    }
  };

  const loadTemplateItems = async (templateId) => {
    if (!templateId || !token) {
      setTemplateItems([]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/templates/${templateId}/items`, {
        headers: authHeaders,
      });

      if (handleAuthError(res)) return;

      const data = await res.json();
      setTemplateItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Template item betöltési hiba:", err);
      setTemplateItems([]);
    }
  };

  const loadCompanyName = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/settings/company/me`, {
        headers: authHeaders,
      });

      if (handleAuthError(res)) return;

      const data = await res.json();

      setCompanyName(data.company_name || "");
      setCompanyEmail(data.company_email || "");
      setCompanyPhone(data.company_phone || "");
    } catch (err) {
      console.error("Cégadatok betöltési hiba:", err);
    }
  };

  const loadProjectItems = async (currentProjectId) => {
    if (!currentProjectId || !token) return;

    try {
      const res = await fetch(`${API_URL}/projects/${currentProjectId}/items`, {
        headers: authHeaders,
      });

      if (handleAuthError(res)) return;

      const data = await res.json();
      setProjectItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Projekt tételek betöltési hiba:", err);
      setProjectItems([]);
    }
  };

  const loadProjectTotal = async (currentProjectId) => {
    if (!currentProjectId || !token) return;

    try {
      const res = await fetch(`${API_URL}/projects/${currentProjectId}/total`, {
        headers: authHeaders,
      });

      if (handleAuthError(res)) return;

      const data = await res.json();
      setProjectTotal(Number(data.total) || 0);
    } catch (err) {
      console.error("Projekt végösszeg betöltési hiba:", err);
      setProjectTotal(0);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    loadItems();
    loadProjects();
    loadCustomers();
    loadTemplates();
    loadCompanyName();
  }, []);

  const selectProject = async (project) => {
    setProjectId(project.id);
    setActiveProjectName(project.name);
    setValidUntil(project.valid_until || "");
    setSelectedCustomerId(project.customer_id ? String(project.customer_id) : "");

    await loadProjectItems(project.id);
    await loadProjectTotal(project.id);
  };

  const createProject = async () => {
    if (!projectName.trim()) {
      alert("Adj meg projektnevet!");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/projects?name=${encodeURIComponent(
          projectName
        )}&valid_until=${encodeURIComponent(validUntil)}`,
        {
          method: "POST",
          headers: authHeaders,
        }
      );

      if (handleAuthError(res)) return;

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error || "Projekt létrehozása sikertelen.");
        return;
      }

      setProjectId(data.id);
      setActiveProjectName(data.name);
      setProjectName("");
      setValidUntil("");
      setProjectItems([]);
      setProjectTotal(0);
      setSelectedCustomerId("");

      await loadProjects();
    } catch (err) {
      console.error("Projekt létrehozási hiba:", err);
    }
  };

  const startEditProject = (project) => {
    setEditingProjectId(project.id);
    setProjectName(project.name);
    setValidUntil(project.valid_until || "");
  };

  const cancelEditProject = () => {
    setEditingProjectId(null);
    setProjectName("");
    setValidUntil("");
  };

  const updateProject = async () => {
    if (!projectName.trim()) {
      alert("Adj meg projektnevet!");
      return;
    }

    try {
      const currentEditingId = editingProjectId;

      const res = await fetch(`${API_URL}/projects/${currentEditingId}`, {
        method: "PUT",
        headers: jsonAuthHeaders,
        body: JSON.stringify({
          name: projectName,
          valid_until: validUntil,
        }),
      });

      if (handleAuthError(res)) return;

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error || "Projekt módosítása sikertelen.");
        return;
      }

      if (projectId === currentEditingId) {
        setActiveProjectName(data.name);
        setValidUntil(data.valid_until || "");
      }

      cancelEditProject();
      await loadProjects();
    } catch (err) {
      console.error("Projekt update hiba:", err);
      alert("Projekt módosítása sikertelen.");
    }
  };

  const deleteProject = async (projectToDeleteId) => {
    const confirmed = window.confirm("Biztosan törlöd ezt a projektet?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/projects/${projectToDeleteId}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (handleAuthError(res)) return;

      if (!res.ok) {
        alert("Projekt törlése sikertelen.");
        return;
      }

      if (projectId === projectToDeleteId) {
        setProjectId(null);
        setActiveProjectName("");
        setProjectItems([]);
        setProjectTotal(0);
        setSelectedCustomerId("");
      }

      await loadProjects();
    } catch (err) {
      console.error("Projekt törlési hiba:", err);
      alert("Projekt törlése sikertelen.");
    }
  };

  const createCustomer = async () => {
    if (!customerName.trim()) {
      alert("Adj meg ügyfélnevet!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: jsonAuthHeaders,
        body: JSON.stringify({
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: customerAddress,
        }),
      });

      if (handleAuthError(res)) return;

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error || "Ügyfél létrehozása sikertelen.");
        return;
      }

      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setCustomerAddress("");

      await loadCustomers();
    } catch (err) {
      console.error("Ügyfél létrehozási hiba:", err);
      alert("Ügyfél létrehozása sikertelen.");
    }
  };

  const deleteCustomer = async (customerId) => {
    const confirmed = window.confirm("Biztosan törlöd ezt az ügyfelet?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/customers/${customerId}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (handleAuthError(res)) return;

      if (!res.ok) {
        alert("Ügyfél törlése sikertelen.");
        return;
      }

      if (selectedCustomerId === String(customerId)) {
        setSelectedCustomerId("");
      }

      await loadCustomers();
      await loadProjects();
    } catch (err) {
      console.error("Ügyfél törlési hiba:", err);
      alert("Ügyfél törlése sikertelen.");
    }
  };

  const assignCustomerToProject = async () => {
    if (!projectId) {
      alert("Először válassz vagy hozz létre projektet!");
      return;
    }

    if (!selectedCustomerId) {
      alert("Válassz ügyfelet!");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/projects/${projectId}/customer/${selectedCustomerId}`,
        {
          method: "PUT",
          headers: authHeaders,
        }
      );

      if (handleAuthError(res)) return;

      if (!res.ok) {
        alert("Ügyfél hozzárendelése sikertelen.");
        return;
      }

      alert("Ügyfél hozzárendelve a projekthez!");
      await loadProjects();
    } catch (err) {
      console.error("Ügyfél hozzárendelési hiba:", err);
      alert("Ügyfél hozzárendelése sikertelen.");
    }
  };

  const createTemplate = async () => {
    if (!templateName.trim()) {
      alert("Adj meg sablon nevet!");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/templates?name=${encodeURIComponent(templateName)}`,
        {
          method: "POST",
          headers: authHeaders,
        }
      );

      if (handleAuthError(res)) return;

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error || "Sablon létrehozása sikertelen.");
        return;
      }

      setTemplateName("");
      setSelectedTemplateId(String(data.id));
      await loadTemplates();
      await loadTemplateItems(data.id);
    } catch (err) {
      console.error("Sablon létrehozási hiba:", err);
    }
  };

  const addItemToTemplate = async () => {
    if (!selectedTemplateId) {
      alert("Először válassz vagy hozz létre sablont!");
      return;
    }

    if (!templateItemId) {
      alert("Válassz itemet!");
      return;
    }

    const qty = Number(templateQuantity);
    if (!qty || qty <= 0) {
      alert("Adj meg érvényes mennyiséget!");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/templates/${selectedTemplateId}/items?item_id=${templateItemId}&default_quantity=${qty}`,
        {
          method: "POST",
          headers: authHeaders,
        }
      );

      if (handleAuthError(res)) return;

      setTemplateItemId("");
      setTemplateQuantity("");
      loadTemplateItems(selectedTemplateId);
    } catch (err) {
      console.error("Sablon item hozzáadási hiba:", err);
    }
  };

  const deleteTemplateItem = async (templateItemIdToDelete) => {
    if (!selectedTemplateId) return;

    try {
      const res = await fetch(
        `${API_URL}/templates/${selectedTemplateId}/items/${templateItemIdToDelete}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      if (handleAuthError(res)) return;

      loadTemplateItems(selectedTemplateId);
    } catch (err) {
      console.error("Sablon item törlési hiba:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/items`, {
        method: "POST",
        headers: jsonAuthHeaders,
        body: JSON.stringify({
          name,
          type,
          unit,
          price: Number(price),
          description,
        }),
      });

      if (handleAuthError(res)) return;

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error || "Item mentése sikertelen.");
        return;
      }

      setName("");
      setType("work");
      setUnit("m2");
      setPrice("");
      setDescription("");

      loadItems();
    } catch (err) {
      console.error("Item mentési hiba:", err);
    }
  };

  const startEditItem = (item) => {
    setEditingItemId(item.id);
    setName(item.name);
    setType(item.type);
    setUnit(item.unit);
    setPrice(item.price);
    setDescription(item.description || "");
  };

  const cancelEditItem = () => {
    setEditingItemId(null);
    setName("");
    setType("work");
    setUnit("m2");
    setPrice("");
    setDescription("");
  };

  const updateItem = async () => {
    try {
      const res = await fetch(`${API_URL}/items/${editingItemId}`, {
        method: "PUT",
        headers: jsonAuthHeaders,
        body: JSON.stringify({
          name,
          type,
          unit,
          price: Number(price),
          description,
        }),
      });

      if (handleAuthError(res)) return;

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error || "Item módosítása sikertelen.");
        return;
      }

      cancelEditItem();
      loadItems();
    } catch (err) {
      console.error("Item update hiba:", err);
      alert("Item módosítása sikertelen.");
    }
  };

  const handleDelete = async (itemId) => {
    try {
      const res = await fetch(`${API_URL}/items/${itemId}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (handleAuthError(res)) return;

      loadItems();
    } catch (err) {
      console.error("Item törlési hiba:", err);
    }
  };

  const handleQuantityChange = (itemId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const addToProject = async (itemId) => {
    if (!projectId) {
      alert("Először válassz vagy hozz létre projektet!");
      return;
    }

    const quantity = Number(quantities[itemId]);
    if (!quantity || quantity <= 0) {
      alert("Adj meg érvényes mennyiséget!");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/projects/${projectId}/add-item/${itemId}?quantity=${quantity}`,
        {
          method: "POST",
          headers: authHeaders,
        }
      );

      if (handleAuthError(res)) return;

      loadProjectItems(projectId);
      loadProjectTotal(projectId);
    } catch (err) {
      console.error("Projekthez adási hiba:", err);
    }
  };

  const addTemplateToProject = async () => {
    if (!projectId) {
      alert("Először válassz vagy hozz létre projektet!");
      return;
    }

    if (!selectedTemplateId) {
      alert("Válassz sablont!");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/projects/${projectId}/add-template/${selectedTemplateId}`,
        {
          method: "POST",
          headers: authHeaders,
        }
      );

      if (handleAuthError(res)) return;

      loadProjectItems(projectId);
      loadProjectTotal(projectId);
    } catch (err) {
      console.error("Sablon projekthez adási hiba:", err);
    }
  };

  const deleteProjectItem = async (projectItemId) => {
    if (!projectId) return;

    try {
      const res = await fetch(
        `${API_URL}/projects/${projectId}/items/${projectItemId}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      if (handleAuthError(res)) return;

      loadProjectItems(projectId);
      loadProjectTotal(projectId);
    } catch (err) {
      console.error("Projekt tétel törlési hiba:", err);
    }
  };

  const exportPdf = async () => {
    if (!projectId) {
      alert("Először válassz vagy hozz létre projektet!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/export-pdf`, {
        headers: authHeaders,
      });

      if (handleAuthError(res)) return;

      if (!res.ok) {
        alert("PDF generálás sikertelen.");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `project_${projectId}.pdf`;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export hiba:", err);
      alert("PDF export sikertelen.");
    }
  };

  const saveCompanyName = async () => {
    if (!companyName.trim()) {
      alert("Adj meg cégnév!");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/settings/company?name=${encodeURIComponent(
          companyName
        )}&email=${encodeURIComponent(companyEmail)}&phone=${encodeURIComponent(companyPhone)}`,
        {
          method: "PUT",
          headers: authHeaders,
        }
      );

      if (handleAuthError(res)) return;

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error || "Cégadatok mentése sikertelen.");
        return;
      }

      setCompanyName(data.company_name || "");
      setCompanyEmail(data.company_email || "");
      setCompanyPhone(data.company_phone || "");

      alert("Cégadatok mentve!");
    } catch (err) {
      console.error("Cégadatok mentési hiba:", err);
      alert("Cégadatok mentése sikertelen.");
    }
  };

  return (
    <div>
      <div className="top-bar">
        <h1 className="main-title">Ajánlat készítő rendszer</h1>
        <button onClick={handleLogout}>Kijelentkezés</button>
      </div>

      <div className="grid">
        <div>
          <div className="card">
            <h2>Cégadatok beállítása</h2>

            <div className="inline-row">
              <input
                type="text"
                placeholder="Cég neve"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="medium-input"
              />

              <input
                type="email"
                placeholder="Email cím"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="medium-input"
              />

              <input
                type="text"
                placeholder="Telefonszám"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                className="medium-input"
              />

              <button onClick={saveCompanyName}>Mentés</button>
            </div>
          </div>

          <div className="card section-space">
            <h2>Ügyfél létrehozása</h2>

            <div className="inline-row">
              <input
                type="text"
                placeholder="Ügyfél neve"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="medium-input"
              />

              <input
                type="email"
                placeholder="Ügyfél email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="medium-input"
              />

              <input
                type="text"
                placeholder="Ügyfél telefon"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="medium-input"
              />

              <input
                type="text"
                placeholder="Ügyfél cím"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="medium-input"
              />

              <button onClick={createCustomer}>Ügyfél mentése</button>
            </div>
          </div>

          <div className="card section-space">
            <h2>Ügyfél lista</h2>

            {customers.length === 0 && <p className="muted">Még nincs ügyfél.</p>}

            <ul>
              {customers.map((customer) => (
                <li key={customer.id}>
                  <strong>{customer.name}</strong>
                  {customer.email && <span className="muted"> - {customer.email}</span>}
                  {customer.phone && <span className="muted"> - {customer.phone}</span>}
                  {customer.address && <span className="muted"> - {customer.address}</span>}

                  <button onClick={() => deleteCustomer(customer.id)}>Törlés</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card section-space">
            <h2>{editingProjectId ? "Projekt szerkesztése" : "Projekt létrehozása"}</h2>

            <div className="inline-row">
              <input
                type="text"
                placeholder="Projekt neve"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="medium-input"
              />

              <div style={{ display: "flex", flexDirection: "column" }}>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="medium-input"
                />
                <span style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                  az árajánlat érvényességi ideje
                </span>
              </div>

              {editingProjectId ? (
                <div className="inline-row">
                  <button onClick={updateProject}>Projekt frissítése</button>
                  <button onClick={cancelEditProject}>Mégse</button>
                </div>
              ) : (
                <button onClick={createProject}>Létrehozás</button>
              )}
            </div>

            {projectId && <p className="muted">Aktív projekt: {activeProjectName}</p>}
          </div>

          <div className="card section-space">
            <h2>Ügyfél hozzárendelése aktív projekthez</h2>

            {!projectId && <p className="muted">Először válassz vagy hozz létre projektet.</p>}

            {projectId && (
              <div className="inline-row">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="medium-input"
                >
                  <option value="">-- válassz ügyfelet --</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>

                <button onClick={assignCustomerToProject}>
                  Ügyfél hozzárendelése
                </button>
              </div>
            )}
          </div>

          <div className="card section-space">
            <h2>Projekt lista</h2>

            {projects.length === 0 && <p className="muted">Még nincs projekted.</p>}

            <ul>
              {projects.map((project) => (
                <li key={project.id}>
                  <strong>{project.name}</strong>
                  {project.valid_until && (
                    <span className="muted"> - érvényes: {project.valid_until}</span>
                  )}
                  {project.customer_id && (
                    <span className="muted"> - ügyfél ID: {project.customer_id}</span>
                  )}

                  <button onClick={() => selectProject(project)}>Megnyitás</button>
                  <button onClick={() => startEditProject(project)}>Szerkesztés</button>
                  <button onClick={() => deleteProject(project.id)}>Törlés</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card section-space">
            <h2>Sablon kezelése</h2>

            <div className="inline-row">
              <input
                type="text"
                placeholder="Új sablon neve"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="medium-input"
              />
              <button onClick={createTemplate}>Sablon létrehozása</button>
            </div>

            <div className="inline-row">
              <select
                value={selectedTemplateId}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedTemplateId(value);
                  loadTemplateItems(value);
                }}
                className="medium-input"
              >
                <option value="">-- válassz sablont --</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>

              <button onClick={addTemplateToProject}>Sablon projekthez adása</button>
            </div>

            <div className="inline-row">
              <select
                value={templateItemId}
                onChange={(e) => setTemplateItemId(e.target.value)}
                className="medium-input"
              >
                <option value="">-- item kiválasztása --</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.unit} - {item.price} Ft
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Alap mennyiség"
                value={templateQuantity}
                onChange={(e) => setTemplateQuantity(e.target.value)}
                className="small-input"
              />

              <button onClick={addItemToTemplate}>Item hozzáadása a sablonhoz</button>
            </div>

            {selectedTemplateId && (
              <div>
                <h3>Sablon tételei</h3>
                {templateItems.length === 0 && (
                  <p className="muted">Nincs még tétel a sablonban.</p>
                )}

                <ul>
                  {templateItems.map((item) => (
                    <li key={item.template_item_id}>
                      {item.name} - {item.default_quantity} {item.unit} - {item.price} Ft
                      <button onClick={() => deleteTemplateItem(item.template_item_id)}>
                        Törlés
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="card section-space">
            <h2>{editingItemId ? "Item szerkesztése" : "Új item"}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Név"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="full-width"
                />
              </div>

              <div className="form-row">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="full-width"
                >
                  <option value="work">work</option>
                  <option value="material">material</option>
                </select>
              </div>

              <div className="form-row">
                <input
                  type="text"
                  placeholder="Egység"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="full-width"
                />
              </div>

              <div className="form-row">
                <input
                  type="number"
                  placeholder="Ár"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="full-width"
                />
              </div>

              <div className="form-row">
                <input
                  type="text"
                  placeholder="Leírás"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="full-width"
                />
              </div>

              {editingItemId ? (
                <div className="inline-row">
                  <button type="button" onClick={updateItem}>
                    Item frissítése
                  </button>

                  <button type="button" onClick={cancelEditItem}>
                    Mégse
                  </button>
                </div>
              ) : (
                <button type="submit">Mentés</button>
              )}
            </form>
          </div>
        </div>

        <div>
          <div className="card">
            <h2>Item lista</h2>
            {items.length === 0 && <p className="muted">Nincs adat</p>}

            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  {item.name} - {item.price} Ft - {item.unit}
                  <input
                    type="number"
                    min="1"
                    value={quantities[item.id] || 1}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    className="small-input"
                  />
                  <button onClick={() => addToProject(item.id)}>Projekthez adás</button>
                  <button onClick={() => startEditItem(item)}>Szerkesztés</button>
                  <button onClick={() => handleDelete(item.id)}>Törlés</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card section-space">
            <h2>Projekt tételek</h2>

            {!projectId && <p className="muted">Először válassz vagy hozz létre projektet.</p>}

            {projectId && projectItems.length === 0 && (
              <p className="muted">Még nincs tétel a projektben.</p>
            )}

            <ul>
              {projectItems.map((item) => (
                <li key={item.project_item_id}>
                  {item.name} - {item.quantity} {item.unit} - {item.price} Ft
                  <button onClick={() => deleteProjectItem(item.project_item_id)}>
                    Törlés
                  </button>
                </li>
              ))}
            </ul>

            {projectId && (
              <>
                <h3>Végösszeg: {projectTotal} Ft</h3>
                <button onClick={exportPdf}>PDF letöltés</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;