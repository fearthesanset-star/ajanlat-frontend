import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AppMain.css";

function App() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("token");

  const [items, setItems] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templateItems, setTemplateItems] = useState([]);

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

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  const loadItems = async () => {
    if (!userId) return;

    try {
      const res = await fetch(`https://ajanlat-app.onrender.com/items/${userId}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
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

  const loadTemplates = async () => {
    if (!userId) return;

    try {
      const res = await fetch(`https://ajanlat-app.onrender.com/templates/${userId}`);
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Template betöltési hiba:", err);
      setTemplates([]);
    }
  };

  const loadTemplateItems = async (templateId) => {
    if (!templateId) {
      setTemplateItems([]);
      return;
    }

    try {
      const res = await fetch(`https://ajanlat-app.onrender.com/templates/${templateId}/items`);
      const data = await res.json();
      setTemplateItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Template item betöltési hiba:", err);
      setTemplateItems([]);
    }
  };

  const loadCompanyName = async () => {
    try {
      const res = await fetch(`https://ajanlat-app.onrender.com/settings/company/${userId}`);
      const data = await res.json();

      setCompanyName(data.company_name || "");
      setCompanyEmail(data.company_email || "");
      setCompanyPhone(data.company_phone || "");
    } catch (err) {
      console.error("Cégadatok betöltési hiba:", err);
    }
  };

  const loadProjectItems = async (currentProjectId) => {
    if (!currentProjectId) return;

    try {
      const res = await fetch(`https://ajanlat-app.onrender.com/projects/${currentProjectId}/items`);
      const data = await res.json();
      setProjectItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Projekt tételek betöltési hiba:", err);
      setProjectItems([]);
    }
  };

  const loadProjectTotal = async (currentProjectId) => {
    if (!currentProjectId) return;

    try {
      const res = await fetch(`https://ajanlat-app.onrender.com/projects/${currentProjectId}/total`);
      const data = await res.json();
      setProjectTotal(Number(data.total) || 0);
    } catch (err) {
      console.error("Projekt végösszeg betöltési hiba:", err);
      setProjectTotal(0);
    }
  };

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    loadItems();
    loadTemplates();
    loadCompanyName();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      navigate("/login");
      return;
    }

    try {
      await fetch("https://ajanlat-app.onrender.com/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          unit,
          price: Number(price),
          description,
          user_id: Number(userId),
        }),
      });

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

  const handleDelete = async (itemId) => {
    try {
      await fetch(`https://ajanlat-app.onrender.com/items/${itemId}?user_id=${userId}`, {
        method: "DELETE",
      });
      loadItems();
    } catch (err) {
      console.error("Item törlési hiba:", err);
    }
  };

  const createProject = async () => {
    if (!projectName.trim()) {
      alert("Adj meg projektnevet!");
      return;
    }

    try {
      const res = await fetch(
        `https://ajanlat-app.onrender.com/projects?name=${encodeURIComponent(
          projectName
        )}&user_id=${userId}&valid_until=${encodeURIComponent(validUntil)}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setProjectId(data.id);
      setActiveProjectName(data.name);
      setProjectName("");
      setValidUntil("");
      setProjectItems([]);
      setProjectTotal(0);
    } catch (err) {
      console.error("Projekt létrehozási hiba:", err);
    }
  };

  const createTemplate = async () => {
    if (!templateName.trim()) {
      alert("Adj meg sablon nevet!");
      return;
    }

    try {
      const res = await fetch(
        `https://ajanlat-app.onrender.com/templates?name=${encodeURIComponent(
          templateName
        )}&user_id=${userId}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (data.error) {
        alert(data.error);
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
      await fetch(
        `https://ajanlat-app.onrender.com/templates/${selectedTemplateId}/items?item_id=${templateItemId}&default_quantity=${qty}`,
        { method: "POST" }
      );

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
      await fetch(
        `https://ajanlat-app.onrender.com/templates/${selectedTemplateId}/items/${templateItemIdToDelete}`,
        { method: "DELETE" }
      );

      loadTemplateItems(selectedTemplateId);
    } catch (err) {
      console.error("Sablon item törlési hiba:", err);
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
      alert("Először hozz létre projektet!");
      return;
    }

    const quantity = Number(quantities[itemId]);
    if (!quantity || quantity <= 0) {
      alert("Adj meg érvényes mennyiséget!");
      return;
    }

    try {
      await fetch(
        `https://ajanlat-app.onrender.com/projects/${projectId}/add-item/${itemId}?quantity=${quantity}`,
        { method: "POST" }
      );

      loadProjectItems(projectId);
      loadProjectTotal(projectId);
    } catch (err) {
      console.error("Projekthez adási hiba:", err);
    }
  };

  const addTemplateToProject = async () => {
    if (!projectId) {
      alert("Először hozz létre projektet!");
      return;
    }

    if (!selectedTemplateId) {
      alert("Válassz sablont!");
      return;
    }

    try {
      await fetch(
        `https://ajanlat-app.onrender.com/projects/${projectId}/add-template/${selectedTemplateId}`,
        { method: "POST" }
      );

      loadProjectItems(projectId);
      loadProjectTotal(projectId);
    } catch (err) {
      console.error("Sablon projekthez adási hiba:", err);
    }
  };

  const deleteProjectItem = async (projectItemId) => {
    if (!projectId) return;

    try {
      await fetch(
        `https://ajanlat-app.onrender.com/projects/${projectId}/items/${projectItemId}`,
        { method: "DELETE" }
      );

      loadProjectItems(projectId);
      loadProjectTotal(projectId);
    } catch (err) {
      console.error("Projekt tétel törlési hiba:", err);
    }
  };

  const exportPdf = () => {
    if (!projectId) {
      alert("Először hozz létre projektet!");
      return;
    }

    window.open(`https://ajanlat-app.onrender.com/projects/${projectId}/export-pdf`, "_blank");
  };

 const saveCompanyName = async () => {
  if (!companyName.trim()) {
    alert("Adj meg cégnév!");
    return;
  }

  try {
    const res = await fetch(
      `https://ajanlat-app.onrender.com/settings/company?user_id=${userId}&name=${encodeURIComponent(
        companyName
      )}&email=${encodeURIComponent(companyEmail)}&phone=${encodeURIComponent(companyPhone)}`,
      {
        method: "PUT",
      }
    );

    const data = await res.json();

    console.log("Cégadat mentés válasz:", data);

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
            <h2>Projekt létrehozása</h2>

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

              <button onClick={createProject}>Létrehozás</button>
            </div>

            {projectId && <p className="muted">Aktív projekt: {activeProjectName}</p>}
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
            <h2>Új item</h2>

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
                <select value={type} onChange={(e) => setType(e.target.value)} className="full-width">
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

              <button type="submit">Mentés</button>
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
                  <button onClick={() => handleDelete(item.id)}>Törlés</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card section-space">
            <h2>Projekt tételek</h2>

            {!projectId && <p className="muted">Először hozz létre projektet.</p>}

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