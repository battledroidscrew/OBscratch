import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, CheckSquare, Square, Download, Copy, RefreshCw, 
  ExternalLink, FolderArchive, Users, Layers, CheckCircle2, 
  MessageSquare, Save, X, Check, Shield, FileText, Share2, ChevronDown, ChevronUp, Database
} from 'lucide-react';

// --- SUPABASE CONFIG (Optioneel vast te zetten of via UI in te stellen) ---
const DEFAULT_SUPABASE_URL = "https://mlhumugyhzknkyyildcy.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_ph_PdxSivq9YEXKA6RFeqw_D_swDICZ
";

// --- INITIAL DATA & CONSTANTS ---
const INITIAL_THEMES = [
  "First Things First",
  "Aanbod",
  "Team",
  "Werkgroepen",
  "Infrastructuur & Veiligheid",
  "Samenwerkingen & Verhuur",
  "Joridisch & Financieel"
];

const ORGANIZATIONS = ["Kras", "Battle Droids", "Habbekrats", "Allemaal"];
const ORG_COLORS = {
  "Battle Droids": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Kras": "bg-red-500/20 text-red-400 border-red-500/30",
  "Habbekrats": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Allemaal": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
};

const INITIAL_PERSONS = ["Camine", "Kaat", "Berten", "Jolien", "Frank", "Servaes", "Bernard", "Kobe", "Hamza", "Zakaria", "Inäs", "Lars"];

const INITIAL_ITEMS = [
  // First Things First
  {
    id: "ftf-1",
    theme: "First Things First",
    project: "OB (vernieuwd document)",
    info: "Voorstel om het document dat we hier gebruiken een update te geven, graag feedback.",
    type: "D", 
    date: "28/10/2026",
    link: "",
    status: "Op basis van feedback verder aanpassen/evalueren.",
    statusUpdates: ["28/10: Eerste aanzet gemaakt voor vernieuwd document."],
    todos: [
      { id: "t1", text: "Verder aanpassen obv feedback", done: false, org: "Kras", assignedTo: "Camine" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "ftf-2",
    theme: "First Things First",
    project: "Team Up",
    info: "Mailtje van TeamUp dat abonnementskost niet is betaald? Context: account zit op breder hab-abonnement.",
    type: "B",
    date: "28/10/2026",
    link: "",
    status: "Opgelost! Overzetten op Kras.",
    statusUpdates: ["3/11: Succesvol overgezet via website."],
    todos: [
      { id: "t2", text: "Opvolgen overzetting naar Kras", done: true, org: "Habbekrats", assignedTo: "Berten" }
    ],
    teamUpdate: "Intern"
  },
  {
    id: "ftf-3",
    theme: "First Things First",
    project: "Herfstvakantie planning",
    info: "Herfstvakantie aanpassingen staan er niet echt in. Opgelet voor overlap in gebruik ruimtes.",
    type: "M",
    date: "03/11/2026",
    link: "",
    status: "Kijkje nemen voor volgende dagen qua overlap planning.",
    statusUpdates: [],
    todos: [
      { id: "t3", text: "Whatsapp berichtje sturen over weekend", done: false, org: "Allemaal", assignedTo: "Allemaal" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "ftf-4",
    theme: "First Things First",
    project: "Poetsschema & Vuilnis",
    info: "Wat gaat er mis? Oppikken met team & poetsschema. Weekend druk bezet, rommel stapelt op.",
    type: "D",
    date: "03/11/2026",
    link: "",
    status: "Bespreken met team wat haalbaar is qua opkuis.",
    statusUpdates: [],
    todos: [
      { id: "t4", text: "OB follow up inplannen", done: false, org: "Kras", assignedTo: "Allemaal" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "ftf-5",
    theme: "First Things First",
    project: "AI systeem Lars",
    info: "Voorstellen AI systeem Lars, indien oké vanaf volgende OB testen?",
    type: "B",
    date: "03/11/2026",
    link: "",
    status: "Lars zet het in whatsapp met tutorial.",
    statusUpdates: [],
    todos: [
      { id: "t5", text: "Tutorial bekijken en testen", done: false, org: "Battle Droids", assignedTo: "Lars" }
    ],
    teamUpdate: "Ja"
  },

  // Aanbod
  {
    id: "aan-1",
    theme: "Aanbod",
    project: "TOKJO",
    info: "Hoe loopt het met taekwondo, meisjesgroep, en ruimtegebruik MC Lyte tot 18u30/19u?",
    type: "D",
    date: "28/10/2026",
    link: "",
    status: "Camine bevraagd Sambo wat mogelijk is en koppelt terug aan Kaat.",
    statusUpdates: [],
    todos: [
      { id: "t6", text: "Terugkoppeling Sambo & Kaat", done: false, org: "Battle Droids", assignedTo: "Camine" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "aan-2",
    theme: "Aanbod",
    project: "September evaluatie",
    info: "Uitdaging op vrijdag met veel aanbod samen. Eventueel Basquat & studio inzetten.",
    type: "M",
    date: "28/10/2026",
    link: "",
    status: "Mag uit volgende OB, enkel opvolgen als er iets naar boven komt.",
    statusUpdates: [],
    todos: [],
    teamUpdate: "Intern"
  },
  {
    id: "aan-3",
    theme: "Aanbod",
    project: "Warmste Wijk (NOVA + spektakeldag Kras)",
    info: "Wie sluit aan? Wat zijn de uren? BD sluit graag aan met Street Art.",
    type: "B",
    date: "16/12/2026",
    link: "",
    status: "Draaikboek invullen zodra Kaat het doorstuurt.",
    statusUpdates: [],
    todos: [
      { id: "t7", text: "Draaikboek invullen", done: false, org: "Kras", assignedTo: "Kaat" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "aan-4",
    theme: "Aanbod",
    project: "Kerstvakantie",
    info: "BD organiseert break kamp. Middagpauze eten in straat & spelen in village.",
    type: "D",
    date: "28/10/2026",
    link: "",
    status: "Geen Open Huis hele kerstvakantie, groepsaanbod nog te bekijken.",
    statusUpdates: [],
    todos: [
      { id: "t8", text: "Groepsaanbod kerstvakantie afstemmen", done: false, org: "Battle Droids", assignedTo: "Camine" }
    ],
    teamUpdate: "Ja"
  },

  // Team
  {
    id: "tem-1",
    theme: "Team",
    project: "Team Scratch Structuur",
    info: "Zoekende naar juist moment & structuur voor Team Scratch (1x per maand of kwartaal?).",
    type: "D",
    date: "28/10/2026",
    link: "",
    status: "Voorstel: Team Scratch 1x per kwartaal als verbindend moment, praktische info via AI overlegdocumentjes.",
    statusUpdates: [],
    todos: [
      { id: "t9", text: "Flyer/info verspreiden naar team", done: false, org: "Allemaal", assignedTo: "Camine" }
    ],
    teamUpdate: "Ja"
  }
];

export default function ScratchOBApp() {
  const [themes, setThemes] = useState(INITIAL_THEMES);
  const [collapsedThemes, setCollapsedThemes] = useState({});
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [persons, setPersons] = useState(INITIAL_PERSONS);
  const [newPersonName, setNewPersonName] = useState("");
  const [newThemeName, setNewThemeName] = useState("");
  const [showAddThemeModal, setShowAddThemeModal] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'teamup', 'archive'
  const [selectedOrgFilter, setSelectedOrgFilter] = useState("Alle");

  // Supabase state
  const [supabaseUrl, setSupabaseUrl] = useState(DEFAULT_SUPABASE_URL);
  const [supabaseKey, setSupabaseKey] = useState(DEFAULT_SUPABASE_ANON_KEY);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Archief & Snapshots
  const [archives, setArchives] = useState([]);

  // Modal voor bewerken / toevoegen item
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formProject, setFormProject] = useState("");
  const [formTheme, setFormTheme] = useState(INITIAL_THEMES[0]);
  const [formInfo, setFormInfo] = useState("");
  const [formType, setFormType] = useState("D");
  const [formDate, setFormDate] = useState(new Date().toLocaleDateString('nl-BE'));
  const [formLink, setFormLink] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [formTeamUpdate, setFormTeamUpdate] = useState("Ja");

  // Status update input per item
  const [newStatusInput, setNewStatusInput] = useState({});

  // Team Update Generator State
  const [selectedForTeamUpdate, setSelectedForTeamUpdate] = useState(
    INITIAL_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: item.teamUpdate === "Ja" }), {})
  );
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isAiRewriting, setIsAiRewriting] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('scratch_ob_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.themes) setThemes(parsed.themes);
        if (parsed.items) setItems(parsed.items);
        if (parsed.persons) setPersons(parsed.persons);
        if (parsed.archives) setArchives(parsed.archives);
      } catch (e) {
        console.error("Fout bij laden lokale opslag", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    const dataToSave = { themes, items, persons, archives };
    localStorage.setItem('scratch_ob_data', JSON.stringify(dataToSave));
  }, [themes, items, persons, archives]);

  // Genereer standaard team update tekst
  useEffect(() => {
    updateTeamMessageText();
  }, [items, selectedForTeamUpdate]);

  const updateTeamMessageText = () => {
    const activeItems = items.filter(i => selectedForTeamUpdate[i.id]);
    let text = "🚀 **SCRATCH! Team Update & Highlights** 🔥\n\nHey superhelden! Hier is een frisse en energieke update vanuit ons Operationeel Bestuur:\n\n";
    
    themes.forEach(theme => {
      const themeItems = activeItems.filter(i => i.theme === theme);
      if (themeItems.length > 0) {
        text += `📌 **${theme}**\n`;
        themeItems.forEach(item => {
          text += `• **${item.project}**: ${item.info}\n`;
          if (item.status) text += `  -> Stand van zaken: ${item.status}\n`;
        });
        text += `\n`;
      }
    });

    text += "Samen maken we er een knallende periode van! 💛🖤 Vragen of opmerkingen? Spreek ons gerust aan!";
    setGeneratedMessage(text);
  };

  const handleAiRewrite = () => {
    setIsAiRewriting(true);
    setTimeout(() => {
      setGeneratedMessage(
        "⚡ **BOOST UPDATE VANUIT SCRATCH! OB** ⚡\n\n" +
        "Briljante energie in huis! Team, we gaan als een speer. Check hieronder de belangrijkste energieboosters en acties van deze week:\n\n" +
        items.filter(i => selectedForTeamUpdate[i.id]).map(i => `💥 **${i.project}**: ${i.info} (Actie loopt!)`).join("\n") +
        "\n\nJullie zijn stuk voor stuk toppers! Let's keep rolling! 💛🖤"
      );
      setIsAiRewriting(false);
    }, 600);
  };

  // To Do management
  const addTodo = (itemId, text, org, assignedTo) => {
    if (!text.trim()) return;
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          todos: [...item.todos, { id: 't-' + Date.now(), text, done: false, org: org || "Allemaal", assignedTo: assignedTo || "Allemaal" }]
        };
      }
      return item;
    }));
  };

  const toggleTodo = (itemId, todoId) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          todos: item.todos.map(t => t.id === todoId ? { ...t, done: !t.done } : t)
        };
      }
      return item;
    }));
  };

  const deleteTodo = (itemId, todoId) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          todos: item.todos.filter(t => t.id !== todoId)
        };
      }
      return item;
    }));
  };

  const addStatusUpdate = (itemId) => {
    const updateText = newStatusInput[itemId];
    if (!updateText || !updateText.trim()) return;
    const timestamp = new Date().toLocaleDateString('nl-BE');
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newUpdates = [...(item.statusUpdates || []), `${timestamp}: ${updateText.trim()}`];
        return {
          ...item,
          status: updateText.trim(),
          statusUpdates: newUpdates
        };
      }
      return item;
    }));
    setNewStatusInput({ ...newStatusInput, [itemId]: "" });
  };

  const toggleItemTeamUpdate = (itemId) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const nextVal = item.teamUpdate === "Ja" ? "Intern" : "Ja";
        setSelectedForTeamUpdate(prev => ({ ...prev, [itemId]: nextVal === "Ja" }));
        return { ...item, teamUpdate: nextVal };
      }
      return item;
    }));
  };

  // Person management
  const addPerson = () => {
    if (newPersonName.trim() && !persons.includes(newPersonName.trim())) {
      setPersons([...persons, newPersonName.trim()]);
      setNewPersonName("");
    }
  };

  const removePerson = (p) => {
    setPersons(persons.filter(item => item !== p));
  };

  // Theme management
  const addTheme = () => {
    if (newThemeName.trim() && !themes.includes(newThemeName.trim())) {
      setThemes([...themes, newThemeName.trim()]);
      setNewThemeName("");
      setShowAddThemeModal(false);
    }
  };

  const removeTheme = (themeToRemove) => {
    if (themes.length <= 1) {
      alert("Je moet minstens 1 thema overhouden.");
      return;
    }
    if (confirm(`Wil je thema "${themeToRemove}" en alle bijbehorende agendapunten verwijderen?`)) {
      setThemes(themes.filter(t => t !== themeToRemove));
      setItems(items.filter(i => i.theme !== themeToRemove));
    }
  };

  const toggleCollapse = (theme) => {
    setCollapsedThemes(prev => ({ ...prev, [theme]: !prev[theme] }));
  };

  // Item save/edit modal
  const openItemModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormProject(item.project);
      setFormTheme(item.theme);
      setFormInfo(item.info);
      setFormType(item.type);
      setFormDate(item.date);
      setFormLink(item.link || "");
      setFormStatus(item.status);
      setFormTeamUpdate(item.teamUpdate);
    } else {
      setEditingItem(null);
      setFormProject("");
      setFormTheme(themes[0]);
      setFormInfo("");
      setFormType("D");
      setFormDate(new Date().toLocaleDateString('nl-BE'));
      setFormLink("");
      setFormStatus("");
      setFormTeamUpdate("Ja");
    }
    setShowItemModal(true);
  };

  const saveItem = (e) => {
    e.preventDefault();
    if (!formProject.trim()) return;

    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? {
        ...i,
        project: formProject,
        theme: formTheme,
        info: formInfo,
        type: formType,
        date: formDate,
        link: formLink,
        status: formStatus,
        teamUpdate: formTeamUpdate
      } : i));
    } else {
      const newItem = {
        id: 'item-' + Date.now(),
        theme: formTheme,
        project: formProject,
        info: formInfo,
        type: formType,
        date: formDate,
        link: formLink,
        status: formStatus,
        statusUpdates: formStatus ? [`${new Date().toLocaleDateString('nl-BE')}: ${formStatus}`] : [],
        todos: [],
        teamUpdate: formTeamUpdate
      };
      setItems([...items, newItem]);
      setSelectedForTeamUpdate(prev => ({ ...prev, [newItem.id]: formTeamUpdate === "Ja" }));
    }
    setShowItemModal(false);
  };

  const deleteItem = (id) => {
    if (confirm("Ben je zeker dat je dit agendapunt wilt verwijderen?")) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  // Export Excel / CSV in originele OB layout
  const downloadSpreadsheet = () => {
    let csvContent = "\ufeff"; // BOM voor Excel UTF-8
    csvContent += "M,Mededelen;B,Beslissen;D,Dialoog\n\n";
    csvContent += "Project / Onderwerp,Info / vraag (kort in 1 zin!) + link,M / B / D,Verdere uitleg / bespreking op OB,To do,Meenemen naar team?\n";

    themes.forEach(theme => {
      csvContent += `"${theme.toUpperCase()}","","","","",""\n`;
      const themeItems = items.filter(i => i.theme === theme);
      themeItems.forEach(item => {
        const todosStr = item.todos.map(t => `[${t.org} - ${t.assignedTo}] ${t.text} (${t.done ? 'Klaar' : 'Open'})`).join(" | ");
        const row = [
          `"${item.project.replace(/"/g, '""')}"`,
          `"${item.info.replace(/"/g, '""')} ${item.link ? '(' + item.link + ')' : ''}"`,
          `"${item.type}"`,
          `"${item.status.replace(/"/g, '""')}"`,
          `"${todosStr.replace(/"/g, '""')}"`,
          `"${item.teamUpdate}"`
        ].join(",");
        csvContent += row + "\n";
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Operationeel_Bestuur_Overzicht_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const finishOBAndDownload = () => {
    createArchiveSnapshot();
    downloadSpreadsheet();
    alert("OB succesvol afgerond! Snapshot opgeslagen in archief en spreadsheet gedownload.");
  };

  // Archive Snapshot
  const createArchiveSnapshot = () => {
    const snapshot = {
      id: 'arch-' + Date.now(),
      date: new Date().toLocaleString('nl-BE'),
      title: `OB Snapshot (${items.length} punten)`,
      itemsCount: items.length,
      data: { themes, items, persons }
    };
    setArchives([snapshot, ...archives]);
  };

  const deleteSnapshot = (archId) => {
    if (confirm("Wil je deze OB snapshot definitief verwijderen uit het archief?")) {
      setArchives(archives.filter(a => a.id !== archId));
    }
  };

  const restoreSnapshot = (arch) => {
    if (confirm(`Wil je snapshot "${arch.title}" (${arch.date}) herstellen? Huidige wijzigingen worden overschreven.`)) {
      setThemes(arch.data.themes);
      setItems(arch.data.items);
      setPersons(arch.data.persons);
      alert("Snapshot succesvol hersteld!");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-yellow-400 selection:text-black">
      
      {/* HEADER MET EXACT SCRATCH! LOGO */}
      <header className="bg-neutral-900 border-b border-yellow-500/30 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-4">
          {/* Exact SCRATCH Logo uit bijlage */}
          <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center p-0.5 shadow-inner border-2 border-yellow-400 relative overflow-hidden group shrink-0">
            <svg viewBox="0 0 500 500" className="w-full h-full object-cover rounded-full">
              <circle cx="250" cy="250" r="240" fill="#FFD700" />
              <path d="M120 120 h260 v260 h-260 z" fill="none" />
              <path d="M180 200 c-30 0 -50 20 -50 50 s20 50 50 50 h140" fill="none" stroke="#000" strokeWidth="35" strokeLinecap="round" />
              <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="#FFF" stroke="#000" strokeWidth="12" paintOrder="stroke fill" fontSize="110" fontWeight="900" fontStyle="italic" letterSpacing="-5">SCR</text>
              <text x="50%" y="78%" dominantBaseline="middle" textAnchor="middle" fill="#FFF" stroke="#000" strokeWidth="10" paintOrder="stroke fill" fontSize="90" fontWeight="900" fontStyle="italic">ACH!</text>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-wider text-yellow-400">SCRATCH!</h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live Sync Actief
              </span>
            </div>
            <p className="text-xs text-neutral-400">Operationeel Bestuur overzicht • Antwerpen (Kras, Battle Droids, Habbekrats)</p>
          </div>
        </div>

        {/* Navigatie Tabs */}
        <div className="flex items-center gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-yellow-400 text-black shadow-md' : 'text-neutral-400 hover:text-white'}`}
          >
            <Layers className="w-4 h-4" /> Operationeel Bestuur Overzicht
          </button>
          <button 
            onClick={() => setActiveTab("teamup")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'teamup' ? 'bg-yellow-400 text-black shadow-md' : 'text-neutral-400 hover:text-white'}`}
          >
            <Share2 className="w-4 h-4" /> Team-Update Generator
          </button>
          <button 
            onClick={() => setActiveTab("archive")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'archive' ? 'bg-yellow-400 text-black shadow-md' : 'text-neutral-400 hover:text-white'}`}
          >
            <FolderArchive className="w-4 h-4" /> Drive & Archief
          </button>
        </div>

        {/* Snelle actie knop */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSupabaseModal(true)}
            className="bg-neutral-800 hover:bg-neutral-700 text-yellow-400 border border-yellow-500/30 font-bold px-3 py-2.5 rounded-xl flex items-center gap-2 text-xs transition-colors"
            title="Koppel Supabase Cloud database"
          >
            <Database className="w-4 h-4" /> Supabase Koppelen
          </button>
          <button 
            onClick={finishOBAndDownload}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 text-xs"
            title="Sla snapshot op en download officiële OB spreadsheet"
          >
            <Download className="w-4 h-4 stroke-[3]" /> OB Afronden & Download (.xls)
          </button>
          <button 
            onClick={() => openItemModal()}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 text-sm"
          >
            <Plus className="w-5 h-5 stroke-[3]" /> Nieuw Agendapunt
          </button>
        </div>
      </header>

      {/* HOOFDINHOUD */}
      <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* ACTIE & FILTER BAR: Organisatie filter + Thema toevoegen */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800">
              
              {/* Organisatie Filter voor To-Do's */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-yellow-400" /> Filter To-Do's per Organisatie:
                </span>
                {["Alle", ...ORGANIZATIONS].map(org => {
                  const count = org === "Alle" 
                    ? items.reduce((acc, i) => acc + i.todos.length, 0)
                    : items.reduce((acc, i) => acc + i.todos.filter(t => t.org === org).length, 0);
                  
                  return (
                    <button
                      key={org}
                      onClick={() => setSelectedOrgFilter(org)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        selectedOrgFilter === org 
                          ? 'bg-yellow-400 text-black border-yellow-400 shadow-md font-black' 
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                      }`}
                    >
                      {org}
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedOrgFilter === org ? 'bg-black text-yellow-400' : 'bg-neutral-900 text-neutral-400'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddThemeModal(true)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-yellow-400 border border-yellow-500/30 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Thema Toevoegen
                </button>
              </div>
            </div>

            {/* PERSONEN BEHEER BAR */}
            <div className="bg-neutral-900/40 border border-neutral-800/80 p-3 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-yellow-400" /> OB Teamleden (Beheer):
                </span>
                {persons.map(p => (
                  <span key={p} className="bg-neutral-800 text-neutral-200 text-xs px-2.5 py-1 rounded-lg border border-neutral-700 flex items-center gap-1.5 group">
                    {p}
                    <button onClick={() => removePerson(p)} className="text-neutral-500 hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  placeholder="Nieuw teamlid..."
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-400"
                />
                <button 
                  onClick={addPerson}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                >
                  Toevoegen
                </button>
              </div>
            </div>

            {/* ALLE THEMA'S ONDER ELKAAR ALS INKLAPBARE SECTIES */}
            <div className="space-y-6">
              {themes.map(theme => {
                const themeItems = items.filter(i => i.theme === theme);
                const isCollapsed = !!collapsedThemes[theme];

                return (
                  <div key={theme} className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl">
                    
                    {/* Rode Themabalk (zoals in originele OB spreadsheet) */}
                    <div 
                      onClick={() => toggleCollapse(theme)}
                      className="bg-[#CC0000] hover:bg-[#B30000] text-white px-6 py-3.5 flex items-center justify-between cursor-pointer transition-colors shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <h2 className="text-base font-black tracking-wider uppercase">{theme}</h2>
                        <span className="bg-black/30 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                          {themeItems.length} {themeItems.length === 1 ? 'punt' : 'punten'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {themes.length > 1 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeTheme(theme); }}
                            className="text-white/70 hover:text-white p-1 rounded hover:bg-black/20"
                            title="Verwijder thema"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                      </div>
                    </div>

                    {!isCollapsed && (
                      <div>
                        {themeItems.length === 0 ? (
                          <div className="text-center py-12 text-neutral-500">
                            <p className="text-xs italic">Geen agendapunten in dit thema.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-neutral-800">
                            {/* Tabel Header */}
                            <div className="grid grid-cols-12 bg-neutral-950/80 text-xs font-black text-neutral-400 uppercase tracking-wider px-6 py-3 gap-4 border-b border-neutral-800">
                              <div className="col-span-3">1. Project & Info</div>
                              <div className="col-span-4">2. Status & OB Bespreking (+ Update)</div>
                              <div className="col-span-4">3. To-Do's & Organisatie / Team</div>
                              <div className="col-span-1 text-center">4. Team</div>
                            </div>

                            {/* Tabel Rijen */}
                            {themeItems.map((item, idx) => {
                              const typeColor = item.type === 'D' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                                item.type === 'B' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
                                                'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                              const typeLabel = item.type === 'D' ? 'Dialoog' : item.type === 'B' ? 'Beslissen' : 'Mededelen';

                              // Filter to-do's obv organisatie filter bovenin
                              const displayedTodos = selectedOrgFilter === "Alle" 
                                ? item.todos 
                                : item.todos.filter(t => t.org === selectedOrgFilter);

                              return (
                                <div key={item.id} className="grid grid-cols-12 px-6 py-5 gap-4 items-start hover:bg-neutral-800/20 transition-colors group border-b border-neutral-800/60 last:border-b-0">
                                  
                                  {/* KOLOM 1: Project / Onderwerp */}
                                  <div className="col-span-3 space-y-2 border-r border-neutral-800/60 pr-3">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-mono">#{idx + 1}</span>
                                        <h3 className="font-bold text-white text-sm leading-snug">{item.project}</h3>
                                      </div>
                                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button 
                                          onClick={() => openItemModal(item)}
                                          className="p-1 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded"
                                          title="Bewerken"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={() => deleteItem(item.id)}
                                          className="p-1 hover:bg-neutral-700 text-neutral-400 hover:text-red-400 rounded"
                                          title="Verwijderen"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    <p className="text-xs text-neutral-300 leading-relaxed">{item.info}</p>

                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${typeColor}`} title={typeLabel}>
                                        {item.type} = {typeLabel}
                                      </span>
                                      <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded border border-neutral-700">
                                        {item.date}
                                      </span>
                                      {item.link && (
                                        <a 
                                          href={item.link} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-[10px] bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 px-2 py-0.5 rounded border border-yellow-500/30 flex items-center gap-1 font-bold"
                                        >
                                          <ExternalLink className="w-3 h-3" /> Link
                                        </a>
                                      )}
                                    </div>
                                  </div>

                                  {/* KOLOM 2: Status & OB Bespreking (+ Update vakje eronder) */}
                                  <div className="col-span-4 space-y-3 border-r border-neutral-800/60 pr-3">
                                    <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800 space-y-2">
                                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Huidige Status / Bespreking:</div>
                                      <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">{item.status || "Nog geen status ingevuld."}</p>
                                    </div>

                                    {/* Vakje om status te updaten */}
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2">
                                        <input 
                                          type="text"
                                          placeholder="+ Voeg nieuwe status-update toe..."
                                          value={newStatusInput[item.id] || ""}
                                          onChange={(e) => setNewStatusInput({ ...newStatusInput, [item.id]: e.target.value })}
                                          onKeyDown={(e) => { if (e.key === 'Enter') addStatusUpdate(item.id); }}
                                          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-400"
                                        />
                                        <button 
                                          onClick={() => addStatusUpdate(item.id)}
                                          className="bg-neutral-800 hover:bg-yellow-400 hover:text-black text-yellow-400 px-3 py-1.5 rounded-lg text-xs font-black transition-colors"
                                        >
                                          Update
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* KOLOM 3: To-Do's & Organisatie / Team */}
                                  <div className="col-span-4 space-y-3 border-r border-neutral-800/60 pr-3">
                                    <div className="space-y-2">
                                      {displayedTodos.length === 0 ? (
                                        <p className="text-[11px] text-neutral-500 italic">Geen actiepunten {selectedOrgFilter !== "Alle" ? `voor ${selectedOrgFilter}` : ''}.</p>
                                      ) : (
                                        displayedTodos.map(todo => {
                                          const orgColorClass = ORG_COLORS[todo.org] || "bg-neutral-800 text-neutral-300 border-neutral-700";
                                          return (
                                            <div key={todo.id} className="flex items-center justify-between gap-2 bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800 group/todo">
                                              <div className="flex items-center gap-2.5 overflow-hidden">
                                                <button onClick={() => toggleTodo(item.id, todo.id)} className="text-yellow-400 hover:scale-110 transition-transform shrink-0">
                                                  {todo.done ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-neutral-500" />}
                                                </button>
                                                <span className={`text-xs truncate ${todo.done ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                                                  {todo.text}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-1.5 shrink-0">
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${orgColorClass}`}>
                                                  {todo.org}
                                                </span>
                                                <span className="text-[10px] bg-neutral-800 text-yellow-400 px-2 py-0.5 rounded font-bold border border-neutral-700">
                                                  {todo.assignedTo}
                                                </span>
                                                <button onClick={() => deleteTodo(item.id, todo.id)} className="text-neutral-500 hover:text-red-400 opacity-0 group-hover/todo:opacity-100 transition-opacity">
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        })
                                      )}
                                    </div>

                                    {/* Toevoegen To-Do Formulier */}
                                    <ToDoInputForm onAdd={(text, org, assignedTo) => addTodo(item.id, text, org, assignedTo)} persons={persons} />
                                  </div>

                                  {/* KOLOM 4: Meenemen naar Team-Update */}
                                  <div className="col-span-1 flex flex-col items-center justify-center pt-2">
                                    <button 
                                      onClick={() => toggleItemTeamUpdate(item.id)}
                                      className={`w-full py-2.5 px-2 rounded-xl text-xs font-black transition-all border flex flex-col items-center gap-1 ${
                                        item.teamUpdate === 'Ja' 
                                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-md' 
                                          : 'bg-neutral-800/40 text-neutral-500 border-neutral-800'
                                      }`}
                                      title="Klik om te wisselen tussen Ja / Intern"
                                    >
                                      <span className="text-[10px] tracking-wider uppercase">Update</span>
                                      <span className="text-sm font-black">{item.teamUpdate}</span>
                                    </button>
                                  </div>

                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TEAM-UPDATE GENERATOR TABBLAD */}
        {activeTab === 'teamup' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Links: Selectie van OB punten */}
            <div className="lg:col-span-5 bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h2 className="text-lg font-black text-yellow-400">1. Selecteer OB Punten</h2>
                  <p className="text-xs text-neutral-400">Vink aan wat mee mag naar het bredere team.</p>
                </div>
                <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-500/30 text-xs font-bold px-3 py-1 rounded-lg">
                  {Object.values(selectedForTeamUpdate).filter(Boolean).length} geselecteerd
                </span>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {items.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedForTeamUpdate(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      selectedForTeamUpdate[item.id] 
                        ? 'bg-neutral-800/80 border-yellow-400/50 shadow-md' 
                        : 'bg-neutral-950/40 border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={!!selectedForTeamUpdate[item.id]} 
                      onChange={() => {}} 
                      className="mt-1 w-4 h-4 accent-yellow-400 rounded cursor-pointer"
                    />
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-yellow-400">{item.theme}</span>
                        <span className="text-[10px] text-neutral-500">{item.date}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm truncate">{item.project}</h4>
                      <p className="text-xs text-neutral-300 line-clamp-1">{item.info}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rechts: Gegenereerd Bericht & AI Rewrite */}
            <div className="lg:col-span-7 bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-6 shadow-xl flex flex-col">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h2 className="text-lg font-black text-yellow-400">2. Gegenereerd Team-Bericht</h2>
                  <p className="text-xs text-neutral-400">Volledig handmatig aanpasbaar voor Whatsapp, Mail of Slack.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleAiRewrite}
                    disabled={isAiRewriting}
                    className="bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border border-yellow-500/30 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAiRewriting ? 'animate-spin' : ''}`} /> Maak Positief & Motiverend
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedMessage);
                      alert("Bericht gekopieerd naar klembord!");
                    }}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5" /> Kopieer Bericht
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <textarea 
                  rows={15}
                  value={generatedMessage}
                  onChange={(e) => setGeneratedMessage(e.target.value)}
                  className="w-full flex-1 bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm text-neutral-200 focus:outline-none focus:border-yellow-400 font-mono resize-none leading-relaxed shadow-inner"
                />
              </div>

              <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Klaar om direct te delen met alle medewerkers van Kras, Battle Droids en Habbekrats!
                </span>
                <span className="font-bold text-yellow-400">SCRATCH! Communicatie</span>
              </div>
            </div>

          </div>
        )}

        {/* GOOGLE DRIVE & ARCHIEF TABBLAD */}
        {activeTab === 'archive' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-yellow-400 flex items-center gap-2">
                    <Download className="w-6 h-6" /> Spreadsheet & Archief Hub
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">Download de officiële spreadsheet of beheer opgeslagen OB-snapshots.</p>
                </div>
                <button 
                  onClick={downloadSpreadsheet}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 text-sm"
                >
                  <Download className="w-4 h-4 stroke-[3]" /> Download OB Spreadsheet (.xls)
                </button>
              </div>

              {/* Archief Lijst met Verwijder- en Herstelknop */}
              <div className="space-y-4 pt-4">
                <h4 className="font-bold text-sm text-neutral-300 flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-yellow-400" /> Opgeslagen Snapshots ({archives.length})
                </h4>
                {archives.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">Nog geen snapshots opgeslagen. Klik bovenaan op 'OB Afronden & Download' om automatisch een snapshot te bewaren.</p>
                ) : (
                  <div className="space-y-3">
                    {archives.map(arch => (
                      <div key={arch.id} className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex items-center justify-between gap-4">
                        <div>
                          <span className="font-bold text-white text-sm">{arch.title}</span>
                          <p className="text-[10px] text-neutral-500">{arch.date} • {arch.itemsCount} agendapunten</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => restoreSnapshot(arch)}
                            className="text-xs bg-neutral-800 hover:bg-neutral-700 text-yellow-400 px-3 py-1.5 rounded-lg font-bold border border-neutral-700"
                          >
                            Herstellen
                          </button>
                          <button 
                            onClick={() => deleteSnapshot(arch.id)}
                            className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg font-bold border border-red-500/30"
                          >
                            Verwijderen
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      {/* MODAL VOOR NIEUW / BEWERK AGENDAPUNT */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="text-lg font-black text-yellow-400">
                {editingItem ? 'Agendapunt Bewerken' : 'Nieuw OB Agendapunt'}
              </h3>
              <button onClick={() => setShowItemModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-1">Thema</label>
                  <select 
                    value={formTheme}
                    onChange={(e) => setFormTheme(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-400"
                  >
                    {themes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-1">Type</label>
                  <select 
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-400"
                  >
                    <option value="D">D = Dialoog</option>
                    <option value="B">B = Beslissen</option>
                    <option value="M">M = Mededelen</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">Project / Onderwerp</label>
                <input 
                  type="text"
                  required
                  placeholder="Bijv. Tokjo, Team Up, Herfstvakantie..."
                  value={formProject}
                  onChange={(e) => setFormProject(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">Korte Info / Vraag (1 zin)</label>
                <input 
                  type="text"
                  placeholder="Korte duidelijke beschrijving..."
                  value={formInfo}
                  onChange={(e) => setFormInfo(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-1">Datum</label>
                  <input 
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-1">Google Drive / Weblink (optioneel)</label>
                  <input 
                    type="url"
                    placeholder="https://..."
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">Status & Bespreking op OB</label>
                <textarea 
                  rows={2}
                  placeholder="Notities van verdere uitleg of bespreking..."
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">Meenemen naar Team-Update</label>
                <select 
                  value={formTeamUpdate}
                  onChange={(e) => setFormTeamUpdate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="Ja">Ja</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button 
                  type="button" 
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-400 hover:text-white"
                >
                  Annuleren
                </button>
                <button 
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-6 py-2.5 rounded-xl shadow-lg text-xs"
                >
                  {editingItem ? 'Opslaan' : 'Toevoegen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VOOR NIEUW THEMA */}
      {showAddThemeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <h3 className="text-lg font-black text-yellow-400">Nieuw Thema Toevoegen</h3>
            <input 
              type="text"
              placeholder="Themanaam..."
              value={newThemeName}
              onChange={(e) => setNewThemeName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-400"
            />
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowAddThemeModal(false)} className="px-4 py-2 text-xs font-bold text-neutral-400">Annuleren</button>
              <button onClick={addTheme} className="bg-yellow-400 text-black font-black px-5 py-2 rounded-xl text-xs">Toevoegen</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VOOR SUPABASE KOPPELEN */}
      {showSupabaseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-black text-yellow-400 flex items-center gap-2">
                <Database className="w-5 h-5" /> Supabase Koppelen
              </h3>
              <button onClick={() => setShowSupabaseModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Plak hier je Supabase Project URL en Publishable/Anon Key om live te synchroniseren met je team.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">Project URL</label>
                <input 
                  type="text"
                  placeholder="https://xxxx.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">Publishable / Anon Key</label>
                <input 
                  type="password"
                  placeholder="eyJhbGci..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3">
              <button onClick={() => setShowSupabaseModal(false)} className="px-3 py-2 text-xs font-bold text-neutral-400">Sluiten</button>
              <button 
                onClick={() => {
                  localStorage.setItem('scratch_supabase_url', supabaseUrl);
                  localStorage.setItem('scratch_supabase_key', supabaseKey);
                  setShowSupabaseModal(false);
                  alert("Supabase instellingen opgeslagen!");
                }}
                className="bg-yellow-400 text-black font-black px-4 py-2 rounded-xl text-xs"
              >
                Opslaan & Koppelen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponent voor To-Do input met organisatie-kleuren en persoonskoppeling
function ToDoInputForm({ onAdd, persons }) {
  const [text, setText] = useState("");
  const [org, setOrg] = useState("Kras");
  const [assigned, setAssigned] = useState("Camine");
  const [showMenu, setShowMenu] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text, org, assigned);
    setText("");
  };

  return (
    <form onSubmit={handleAdd} className="flex items-center gap-2 pt-1">
      <input 
        type="text"
        placeholder="Nieuw actiepunt..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-400"
      />
      
      <div className="relative">
        <button 
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className="bg-neutral-800 hover:bg-neutral-700 text-yellow-400 text-[10px] font-bold px-2 py-1.5 rounded-lg border border-neutral-700 truncate max-w-[130px]"
        >
          {org} • {assigned}
        </button>

        {showMenu && (
          <div className="absolute right-0 bottom-full mb-1 w-56 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-3 z-30 space-y-2 max-h-56 overflow-y-auto">
            <div className="text-[10px] font-black text-neutral-500 uppercase">Organisatie (Kleur)</div>
            <div className="grid grid-cols-2 gap-1">
              {ORGANIZATIONS.map(o => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOrg(o)}
                  className={`text-left px-2 py-1 text-[10px] rounded font-bold ${org === o ? 'bg-yellow-400 text-black' : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'}`}
                >
                  {o}
                </button>
              ))}
            </div>

            <div className="text-[10px] font-black text-neutral-500 uppercase pt-2 border-t border-neutral-800">Teamlid</div>
            <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
              {persons.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setAssigned(p); setShowMenu(false); }}
                  className={`text-left px-2 py-1 text-[10px] rounded ${assigned === p ? 'bg-yellow-400 text-black font-bold' : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button 
        type="submit"
        className="bg-yellow-400 hover:bg-yellow-300 text-black p-1.5 rounded-lg font-black shrink-0"
        title="Actiepunt toevoegen"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
      </button>
    </form>
  );
}
