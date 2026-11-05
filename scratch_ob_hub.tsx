import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Edit2, CheckSquare, Square, Download, Copy, RefreshCw, 
  ExternalLink, FolderArchive, Users, Layers, CheckCircle2, 
  MessageSquare, Save, X, Check, Shield, FileText, Share2,
  ChevronDown, ChevronRight, Filter, Link as LinkIcon, Upload, Sparkles,
  Cloud, RotateCcw, Settings, AlertTriangle, HelpCircle
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- REALTIME CLOUD SYNC INITIALISATIE (ONDERSTEUNT OOK EXTERNE GOOGLE SITES!) ---
// Als je de code exporteert naar Google Sites, kun je ofwel via de knop "Cloud Koppelen" in de app,
// ofwel hieronder bij PASTE_EXTERNAL_FIREBASE_CONFIG_HERE eenmalig je eigen gratis Firebase config plakken.
const PASTE_EXTERNAL_FIREBASE_CONFIG_HERE = null; // Bijv: { apiKey: "...", projectId: "...", ... }

const getResolvedFirebaseConfig = () => {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    try { return JSON.parse(__firebase_config); } catch (e) {}
  }
  if (PASTE_EXTERNAL_FIREBASE_CONFIG_HERE && PASTE_EXTERNAL_FIREBASE_CONFIG_HERE.projectId) {
    return PASTE_EXTERNAL_FIREBASE_CONFIG_HERE;
  }
  try {
    const savedCfg = window.name && window.name.startsWith('SCRATCH_FB_CFG:')
      ? JSON.parse(window.name.replace('SCRATCH_FB_CFG:', ''))
      : null;
    if (savedCfg && savedCfg.projectId) return savedCfg;
  } catch (e) {}
  return null;
};

const initialConfig = getResolvedFirebaseConfig();
let fbApp = null;
let auth = null;
let db = null;
try {
  if (initialConfig) {
    fbApp = initializeApp(initialConfig);
    auth = getAuth(fbApp);
    db = getFirestore(fbApp);
  }
} catch (e) {}

const appId = typeof __app_id !== 'undefined' ? __app_id : 'scratch-ob-hub';

// --- EXACT SCRATCH! LOGO UIT BIJLAGE ---
const SCRATCH_LOGO = "data:image/jpeg;base64,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";

// --- ORGANISATIES & KLEURCODES ---
const ORG_CONFIG = {
  "Battle Droids": {
    name: "Battle Droids",
    short: "BD",
    solid: "bg-blue-600 text-white border-blue-400 hover:bg-blue-500",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/50 hover:bg-blue-500/30",
    dot: "bg-blue-500",
    ring: "ring-blue-500/50"
  },
  "Kras": {
    name: "Kras",
    short: "KRAS",
    solid: "bg-red-600 text-white border-red-400 hover:bg-red-500",
    badge: "bg-red-500/20 text-red-300 border-red-500/50 hover:bg-red-500/30",
    dot: "bg-red-500",
    ring: "ring-red-500/50"
  },
  "Habbekrats": {
    name: "Habbekrats",
    short: "HAB",
    solid: "bg-emerald-600 text-white border-emerald-400 hover:bg-emerald-500",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/50"
  },
  "Allemaal": {
    name: "Allemaal",
    short: "ALLEMAAL",
    solid: "bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300",
    badge: "bg-yellow-400/20 text-yellow-300 border-yellow-400/50 hover:bg-yellow-400/30",
    dot: "bg-yellow-400",
    ring: "ring-yellow-400/50"
  }
};

const ORGANIZATIONS = Object.keys(ORG_CONFIG);

const INITIAL_THEMES = [
  "First Things First",
  "Aanbod",
  "Team",
  "Werkgroepen",
  "Infrastructuur & Veiligheid",
  "Samenwerkingen & Verhuur",
  "Juridisch & Financieel"
];

const INITIAL_PERSONS = [
  "Camine", "Kaat", "Berten", "Jolien", "Frank", 
  "Servaes", "Bernard", "Kobe", "Hamza", "Zakaria", "Inäs", "Lars"
];

// --- ALLE 33 ECHTE AGENDAPUNTEN UIT HET OB-DOCUMENT (28/10 & 03/11) ---
const INITIAL_ITEMS = [
  // 1. FIRST THINGS FIRST
  {
    id: "ftf-1",
    theme: "First Things First",
    project: "OB (vernieuwd document)",
    info: "Voorstel om het document dat we hier gebruiken een update te geven en codes (M/B/D) toe te kennen, graag feedback.",
    type: "D",
    date: "28/10/2026",
    links: [{ label: "OB Sjabloon Drive", url: "https://docs.google.com/spreadsheets" }],
    status: "Eerste aanzet gedaan met kleine aanpassingen. Vraag: hoe updates schrijven bij puntjes die van vorige OB komen? Eventueel werken met datum + update.",
    statusUpdates: [
      { id: "su-1", date: "03/11", text: "Structuur goedgekeurd, we werken voortaan met directe status-updates onder elk punt." }
    ],
    todos: [
      { id: "t-1", text: "Op basis van feedback verder aanpassen/evalueren", done: false, org: "Battle Droids", person: "Camine" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "ftf-2",
    theme: "First Things First",
    project: "Team UP abonnement",
    info: "Mailtje van TeamUp dat abonnementskost niet is betaald? Context: account zit op breder abonnement van HAB.",
    type: "B",
    date: "28/10/2026",
    links: [{ label: "TeamUp Beheer", url: "https://teamup.com" }],
    status: "Berten heeft dit doorgegeven aan verantwoordelijke binnen HAB.",
    statusUpdates: [
      { id: "su-2", date: "03/11", text: "Update: opgelost! Overzetten op Kras via de website van TeamUp." }
    ],
    todos: [
      { id: "t-2a", text: "Account overzetten op Kras via TeamUp website", done: false, org: "Kras", person: "Kobe" },
      { id: "t-2b", text: "Overdracht opvolgen met Berten & Hamza", done: true, org: "Habbekrats", person: "Berten" }
    ],
    teamUpdate: "Intern"
  },
  {
    id: "ftf-3",
    theme: "First Things First",
    project: "3/11 online vervolg OB",
    info: "Agendapuntjes hieronder + oppikken vanaf 'Infrastructuur & Veiligheid'.",
    type: "M",
    date: "03/11/2026",
    links: [],
    status: "Online vervolg ingepland op 3/11 om openstaande punten af te ronden.",
    statusUpdates: [],
    todos: [
      { id: "t-3", text: "Punten vanaf Infrastructuur & Veiligheid overlopen", done: true, org: "Allemaal", person: "Camine" }
    ],
    teamUpdate: "Intern"
  },
  {
    id: "ftf-4",
    theme: "First Things First",
    project: "Team Up Herfstvakantie",
    info: "Herfstvakantie aanpassingen staan er niet echt in. Opgelet voor overlap in gebruik ruimtes!",
    type: "M",
    date: "03/11/2026",
    links: [],
    status: "Belangrijk aandachtspunt voor de komende vakantiedagen zodat groepen niet dubbel boeken.",
    statusUpdates: [],
    todos: [
      { id: "t-4", text: "Kijkje nemen voor volgende dagen qua overlap planning", done: false, org: "Allemaal", person: "Kaat" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "ftf-5",
    theme: "First Things First",
    project: "Whatsapp berichtje weekend & poets",
    info: "Wat gaat er mis? Zelfs als iedereen zijn best doet is het weekend druk bezet en stapelen vuil en rommel zich op.",
    type: "D",
    date: "03/11/2026",
    links: [],
    status: "We weten niet goed waar de problemen zich precies opstapelen. Bespreken wat haalbaar is in het weekend.",
    statusUpdates: [],
    todos: [
      { id: "t-5", text: "Oppikken met team & poetsschema herbekijken", done: false, org: "Allemaal", person: "Jolien" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "ftf-6",
    theme: "First Things First",
    project: "OB follow up (AI systeem Lars)",
    info: "Voorstellen AI systeem Lars: indien oké vanaf volgende OB testen?",
    type: "B",
    date: "03/11/2026",
    links: [],
    status: "Voorstel positief onthaald tijdens OB 3/11.",
    statusUpdates: [],
    todos: [
      { id: "t-6", text: "Lars zet het in WhatsApp met korte tutorial voor het team", done: false, org: "Battle Droids", person: "Lars" }
    ],
    teamUpdate: "Ja"
  },

  // 2. AANBOD
  {
    id: "aan-1",
    theme: "Aanbod",
    project: "TOKJO",
    info: "Hoe loopt het? Uitbreiding zondagavond meisjesgroep & gebruik ruimte MC Lyte (gordijnen/inkijk en startuur boks).",
    type: "D",
    date: "28/10/2026",
    links: [],
    status: "Woensdag en zaterdag lopen goed, vrijdag nog niet gestart. Zondag willen ze uitbreiden naar eigen groep meisjes 's avonds. BD heeft werking in MC Lyte tot 18u30 (ruimte ten vroegste 19u vrij). Vraag Malinka: kan boks om 18u30 starten?",
    statusUpdates: [],
    todos: [
      { id: "t-7", text: "Sambo bevragen wat mogelijk is qua uren en terugkoppelen aan Kaat", done: false, org: "Battle Droids", person: "Camine" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "aan-2",
    theme: "Aanbod",
    project: "SCRATCH weekplanning structureel aanbod",
    info: "Overzicht van totaal structureel aanbod in Scratch: hoe loopt het op de drukke dagen?",
    type: "M",
    date: "28/10/2026",
    links: [],
    status: "Kras: uitdaging op vrijdag, dan is er veel aanbod samen. Eventueel bieden Basquiat & studio nog extra mogelijkheden.",
    statusUpdates: [
      { id: "su-3", date: "28/10", text: "Mag uit volgende OB, enkel opvolgen als er iets naar boven komt." }
    ],
    todos: [
      { id: "t-8", text: "Ruimtegebruik vrijdag monitoren (Basquiat & studio als back-up)", done: true, org: "Kras", person: "Kaat" }
    ],
    teamUpdate: "Intern"
  },
  {
    id: "aan-3",
    theme: "Aanbod",
    project: "Herfstvakantie flyer",
    info: "Flyer delen op Instagram met aanbod? Template staat klaar om in te vullen.",
    type: "M",
    date: "28/10/2026",
    links: [{ label: "Canva Flyer Template", url: "https://canva.com" }],
    status: "Als het lukt om de template tegen vrijdag aan te vullen, kan hij direct online op Instagram en Kiel Connect.",
    statusUpdates: [],
    todos: [
      { id: "t-9", text: "Template aanvullen tegen vrijdag en posten op Instagram & Kiel Connect", done: false, org: "Battle Droids", person: "Camine" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "aan-4",
    theme: "Aanbod",
    project: "Warmste Wijk (NOVA + Spektakeldag Kras)",
    info: "Warmste Wijk op 16/12: wie sluit aan en wat zijn de uren?",
    type: "D",
    date: "16/12/2026",
    links: [],
    status: "Battle Droids sluit graag aan met Street Art aanbod & bekijkt nog iets extra met buurtsport.",
    statusUpdates: [],
    todos: [
      { id: "t-10a", text: "Draaiboek doorsturen naar partners", done: false, org: "Kras", person: "Kaat" },
      { id: "t-10b", text: "Draaiboek invullen voor Street Art & buurtsport", done: false, org: "Battle Droids", person: "Camine" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "aan-5",
    theme: "Aanbod",
    project: "Spektakeldag 25/11",
    info: "Spektakeldag op 25 november: wie kan aansluiten?",
    type: "M",
    date: "25/11/2026",
    links: [],
    status: "Heel welkom allemaal! BD kan hier niet op aansluiten. HAB houdt Open Huis open maar komt mogelijks langs met een groepje jongeren.",
    statusUpdates: [],
    todos: [
      { id: "t-11", text: "Langskomen met groepje jongeren afstemmen", done: false, org: "Habbekrats", person: "Berten" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "aan-6",
    theme: "Aanbod",
    project: "Kerstvakantie Break Kamp",
    info: "BD organiseert een break kamp (staat in TeamUp). Middagpauze eten in straat & spelen in village.",
    type: "D",
    date: "28/10/2026",
    links: [],
    status: "Heel de kerstvakantie is er geen Open Huis, dus daar geen overlap. Groepsaanbod nog even bekijken.",
    statusUpdates: [],
    todos: [
      { id: "t-12", text: "Groepsaanbod tijdens kerstvakantie afstemmen op overlap", done: false, org: "Battle Droids", person: "Camine" }
    ],
    teamUpdate: "Ja"
  },

  // 3. TEAM
  {
    id: "tem-1",
    theme: "Team",
    project: "Moment & structuur Team Scratch",
    info: "Zoekende naar het juiste moment & structuur voor Team Scratch (1x per kwartaal + AI overlegdocumentje).",
    type: "B",
    date: "28/10/2026",
    links: [],
    status: "Nieuw voorstel: Team Scratch 1x per kwartaal als verbindend moment (ook vrijwilligers/coaches welkom). Praktische info vanuit OB via AI in een kort overlegdocumentje gieten dat elke coördinator binnen de week op het eigen teamoverleg overloopt.",
    statusUpdates: [],
    todos: [
      { id: "t-13", text: "Kwartaalmoment inplannen & OB-update doorstroom gebruiken op teamoverleg", done: false, org: "Allemaal", person: "Camine" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "tem-2",
    theme: "Team",
    project: "Afwezigheid / ziekte team & vacature",
    info: "Overzicht zieken en afwezigheden binnen het team + openstaande vacature.",
    type: "M",
    date: "28/10/2026",
    links: [],
    status: "Ahmed: ziekte maand verlengd. Hamza: start rustig terug op. Abdel: 2 weken uit. Sam, Betül, Sanae, Zakaria en Marouane deze week ziek.",
    statusUpdates: [],
    todos: [
      { id: "t-14", text: "Vacature jeugdwerk is uitgezet -> breed doorsturen in netwerk!", done: false, org: "Kras", person: "Jolien" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "tem-3",
    theme: "Team",
    project: "BD team naar buitenlandse competities",
    info: "BD team veel naar buitenlandse competities tussen nu en eind november (o.a. Japan).",
    type: "M",
    date: "28/10/2026",
    links: [],
    status: "Aanbod loopt door en wordt opgevangen door coaches. We blijven bereikbaar maar hou rekening met uurverschil.",
    statusUpdates: [],
    todos: [
      { id: "t-15", text: "OB 11/11 verzetten naar 10/11 online & OB 25/11 (Camine in Japan) verplaatsen", done: false, org: "Battle Droids", person: "Camine" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "tem-4",
    theme: "Team",
    project: "Scratch basis informatiepakket",
    info: "Pakketje van documentjes voor beginnende collega's en stagiairs (Presentatie missie/visie, Huisregels, Draaiboek, Adreslijst).",
    type: "D",
    date: "28/10/2026",
    links: [],
    status: "Bestaande documenten verzamelen zodat elke nieuwe starter of stagiair direct mee is.",
    statusUpdates: [],
    todos: [
      { id: "t-16a", text: "Bestaande documentjes op mail zetten naar het OB", done: false, org: "Battle Droids", person: "Camine" },
      { id: "t-16b", text: "Documenten nakijken en aanvullen tegen volgende OB", done: false, org: "Allemaal", person: "Kaat" }
    ],
    teamUpdate: "Intern"
  },
  {
    id: "tem-5",
    theme: "Team",
    project: "AFN District HAB",
    info: "Jobstudent zomervakantie + budget voor jongeren.",
    type: "M",
    date: "28/10/2026",
    links: [],
    status: "Ter info meegegeven vanuit Habbekrats.",
    statusUpdates: [],
    todos: [
      { id: "t-17", text: "Intern verder opvolgen voor komende zomer", done: false, org: "Habbekrats", person: "Berten" }
    ],
    teamUpdate: "Intern"
  },

  // 4. WERKGROEPEN
  {
    id: "wg-1",
    theme: "Werkgroepen",
    project: "Werkgroep Communicatie",
    info: "Voorstel flyer bekijken (80 euro = 2000 flyers), website aanpassingen en verschoven to-do's uit WG 20/10.",
    type: "B",
    date: "20/10/2026",
    links: [],
    status: "Flyervoorstel en website-aanpassingen besproken in de werkgroep.",
    statusUpdates: [],
    todos: [
      { id: "t-18", text: "Voorstel flyer & website bekijken met team en aanpassingen doorgeven", done: false, org: "Battle Droids", person: "Camine" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "wg-2",
    theme: "Werkgroepen",
    project: "Werkgroep Infrastructuur (Panna/netten)",
    info: "Voldoende offertes binnen voor panna/netten. Budget uit project HAB is onvoldoende: hoe financieel dragen?",
    type: "B",
    date: "04/09/2026",
    links: [],
    status: "Vorige OB al overlopen; alle offertes zijn nu binnen.",
    statusUpdates: [],
    todos: [
      { id: "t-19", text: "Volgend OB alle offertes naast elkaar leggen en kostenverdeling beslissen", done: false, org: "Habbekrats", person: "Berten" }
    ],
    teamUpdate: "Intern"
  },
  {
    id: "wg-3",
    theme: "Werkgroepen",
    project: "Werkgroep Keuken",
    info: "Wie zit er in deze WG (Bart, Roeland, Sanae, Inäs)? Lage diepvries staat open door aangevroren ijs!",
    type: "D",
    date: "28/10/2026",
    links: [],
    status: "Dringend terug op te pikken, zeker voor het onderhoud van de diepvries.",
    statusUpdates: [],
    todos: [
      { id: "t-20", text: "Lage diepvries ontdooien & WG Keuken terug samenroepen", done: false, org: "Kras", person: "Inäs" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "wg-4",
    theme: "Werkgroepen",
    project: "Werkgroep Drugspreventie",
    info: "Verder werken op gezette stappen: Kras-beleid toepassen op Scratch obv casussen & preventieve acties (posters).",
    type: "D",
    date: "22/10/2026",
    links: [],
    status: "Goede zitting gehad op 22 oktober. Posters en casusgericht beleid worden uitgewerkt.",
    statusUpdates: [],
    todos: [
      { id: "t-21", text: "Camine mee uitnodigen voor volgende WG & preventieposters ophangen", done: false, org: "Kras", person: "Jolien" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "wg-5",
    theme: "Werkgroepen",
    project: "Evaluatie Werkgroepen algemeen",
    info: "Zijn er nog andere WG die doorgaan? Moeten we aanwezigheid, opvolging en uitvoering to-do's herevalueren?",
    type: "D",
    date: "28/10/2026",
    links: [],
    status: "Wordt geagendeerd voor grondige evaluatie op het volgende OB.",
    statusUpdates: [],
    todos: [
      { id: "t-22", text: "Werking en opvolging van alle werkgroepen evalueren op volgend OB", done: false, org: "Allemaal", person: "Jolien" }
    ],
    teamUpdate: "Intern"
  },

  // 5. INFRASTRUCTUUR & VEILIGHEID
  {
    id: "inf-1",
    theme: "Infrastructuur & Veiligheid",
    project: "Meldingen infrastructuur & gebouwbeheer",
    info: "Frank werkt aan nieuw meldingssysteem en is woensdag & vrijdag vaste aanspreekpersoon in huis voor gebouwbeheer.",
    type: "M",
    date: "28/10/2026",
    links: [],
    status: "Kras heeft hierover samengezeten. Alles rond gebouwbeheer en procesoptimalisatie (keuken, rommel) zit in Frank zijn takenpakket.",
    statusUpdates: [],
    todos: [
      { id: "t-23", text: "Nieuw meldingssysteem over 2 weken evalueren", done: false, org: "Kras", person: "Frank" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "inf-2",
    theme: "Infrastructuur & Veiligheid",
    project: "Openstaande klusjes (MC Lyte lichten & traphal)",
    info: "Lichten MC Lyte (lastig om 's avonds les te geven) en opgestapeld materiaal bij de traphal.",
    type: "B",
    date: "28/10/2026",
    links: [],
    status: "Staan al sinds augustus op de to-do lijst; prioriteit om dit snel opgelost te krijgen.",
    statusUpdates: [],
    todos: [
      { id: "t-24", text: "Verlichting MC Lyte herstellen & materiaal traphal opruimen", done: false, org: "Kras", person: "Frank" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "inf-3",
    theme: "Infrastructuur & Veiligheid",
    project: "Steps & fietsen in de bureau",
    info: "Kunnen we een aparte veilige plek voorzien voor steps en fietsen zodat ze niet in de bureau staan?",
    type: "D",
    date: "28/10/2026",
    links: [],
    status: "Besproken in rommel brainstorm. Frank kijkt na of er een fietskot kan worden aangevraagd bij de stad. Eventueel kelder naast gebouw als fietsenstalling medewerkers?",
    statusUpdates: [],
    todos: [
      { id: "t-25", text: "Jongeren vragen fietsen buiten te zetten & aanvraag fietskot opvolgen", done: false, org: "Kras", person: "Frank" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "inf-4",
    theme: "Infrastructuur & Veiligheid",
    project: "Rommel Brainstorm opvolging",
    info: "Online overleg rondom materiaal en rommel in Scratch gehad op 22/10: wat zijn de volgende stappen?",
    type: "D",
    date: "22/10/2026",
    links: [],
    status: "Verslag van de brainstorm wordt omgezet in concrete actiepunten.",
    statusUpdates: [],
    todos: [
      { id: "t-26", text: "Nachecken bij Frank & Jolien wat de vervolgstappen zijn uit het verslag", done: false, org: "Kras", person: "Jolien" }
    ],
    teamUpdate: "Intern"
  },
  {
    id: "inf-5",
    theme: "Infrastructuur & Veiligheid",
    project: "Poets & weekend-opruimronde",
    info: "Tegen einde weekend stapelt vuilnis op aan bar/wc's en ligt er stof in de danszalen boven.",
    type: "D",
    date: "28/10/2026",
    links: [],
    status: "Battle Droids heeft een verantwoordelijke aangesteld om zondag na het aanbod een vaste opruimronde te doen. Poetsschema wordt bekeken met Kadija.",
    statusUpdates: [],
    todos: [
      { id: "t-27a", text: "Zondagavond opruimronde na BD-aanbod opvolgen", done: true, org: "Battle Droids", person: "Camine" },
      { id: "t-27b", text: "Poetsschema met Kadija afstemmen & promocampagne opruimen opzetten", done: false, org: "Kras", person: "Jolien" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "inf-6",
    theme: "Infrastructuur & Veiligheid",
    project: "Vuilbakken sorteren & signalisatie",
    info: "Containers buiten afsluiten en binnen beter sorteren met duidelijke stickers.",
    type: "M",
    date: "28/10/2026",
    links: [],
    status: "Stickers zijn reeds aangekocht, moeten enkel nog geplakt worden op de juiste vuilbak, deksel en locatie.",
    statusUpdates: [],
    todos: [
      { id: "t-28", text: "Aangekochte sorteerstickers op vuilbakken en deksels kleven", done: false, org: "Kras", person: "Frank" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "inf-7",
    theme: "Infrastructuur & Veiligheid",
    project: "Meubels aankopen & kostenverdeling",
    info: "Hoe regelen we de kosten bij aankoop van meubels, rekken en opbergbakken?",
    type: "B",
    date: "28/10/2026",
    links: [],
    status: "Besluit: binnen projecten opnemen in projectbegroting; anders overkoepelend bespreken en via solidair potje delen door 3.",
    statusUpdates: [],
    todos: [
      { id: "t-29", text: "Afspraak toepassen bij nieuwe materiaalaankopen", done: true, org: "Allemaal", person: "Kaat" }
    ],
    teamUpdate: "Intern"
  },
  {
    id: "inf-8",
    theme: "Infrastructuur & Veiligheid",
    project: "Noodprocedure/bellijst & Friteuses -> Airfryers",
    info: "Kras stelt noodprocedure/bellijst op. Daarnaast: friteuses zijn vettig -> vervangen door airfryers? En glas wegdoen (HAB).",
    type: "D",
    date: "28/10/2026",
    links: [],
    status: "BD gebruikt de friteuses nooit. Kras & HAB bevragen bij hun team of airfryers een goed alternatief zijn.",
    statusUpdates: [],
    todos: [
      { id: "t-30a", text: "Noodprocedure & bellijst voorstellen op volgend OB", done: false, org: "Kras", person: "Kaat" },
      { id: "t-30b", text: "Team bevragen over airfryers + leeg glas wegbrengen", done: false, org: "Habbekrats", person: "Berten" }
    ],
    teamUpdate: "Ja"
  },

  // 6. SAMENWERKINGEN & VERHUUR
  {
    id: "sam-1",
    theme: "Samenwerkingen & Verhuur",
    project: "Top Notch / LeBlanco muziekstudio",
    info: "Samenwerking met Battle Droids voor investering/inrichting muziekstudio in 'Last Poets' en rap/muziek aanbod.",
    type: "M",
    date: "28/10/2026",
    links: [],
    status: "Fijn 2de gesprek gehad. Ligt nu bij LeBlanco om een concreet voorstel te formuleren (inhoud, timing & financieel). Vraag voor Freedom Friday doorgestuurd naar Open Huis.",
    statusUpdates: [],
    todos: [
      { id: "t-31", text: "Voorstel van LeBlanco afwachten en terugkoppelen op OB", done: false, org: "Battle Droids", person: "Camine" }
    ],
    teamUpdate: "Ja"
  },
  {
    id: "sam-2",
    theme: "Samenwerkingen & Verhuur",
    project: "Give a Day (26/11) & Verhuur La Strada / Kader",
    info: "Give a Day geannuleerd -> eigen klus/poetsdag doen? En ijskast/diepvries La Strada proper maken + verhuurkader.",
    type: "D",
    date: "28/10/2026",
    links: [],
    status: "Kras bekijkt of ze op 26/11 een interne klus/poetsdag doen. Verhuurkader ligt even stil tot nieuwe concessie Kras.",
    statusUpdates: [],
    todos: [
      { id: "t-32", text: "IJskast & diepvries La Strada proper maken + knoop doorhakken over klusdag 26/11", done: false, org: "Kras", person: "Kaat" }
    ],
    teamUpdate: "Ja"
  },

  // 7. JURIDISCH & FINANCIEEL
  {
    id: "jur-1",
    theme: "Juridisch & Financieel",
    project: "Gezamenlijke kosten, Stuurgroep & Missie/Visie",
    info: "Opvolging gezamenlijke kosten (flyers, fotokaders), verzetten Stuurgroep december (valt op Warmste Wijk) en document Mats.",
    type: "B",
    date: "28/10/2026",
    links: [{ label: "Financieel Overzicht Drive", url: "https://docs.google.com/spreadsheets" }],
    status: "Financieel plan en gezamenlijke kosten bijhouden in overzicht. Samenwerkingsovereenkomst voorbereiden tegen volgende stuurgroep.",
    statusUpdates: [],
    todos: [
      { id: "t-33a", text: "Kosten flyers en fotokaders aanvullen in financieel overzicht", done: false, org: "Battle Droids", person: "Camine" },
      { id: "t-33b", text: "Stuurgroep december verzetten & document Mats (missie/visie) invullen", done: false, org: "Allemaal", person: "Kaat" }
    ],
    teamUpdate: "Intern"
  }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState(initialConfig ? "connecting" : "external_unconfigured"); // 'connecting', 'synced', 'saving', 'offline', 'external_unconfigured'
  const [lastUpdatedBy, setLastUpdatedBy] = useState("");
  const [showCloudSetupModal, setShowCloudSetupModal] = useState(false);
  const [customConfigInput, setCustomConfigInput] = useState("");
  const [customRestUrlInput, setCustomRestUrlInput] = useState("");
  const [activeRestUrl, setActiveRestUrl] = useState("");

  const [themes, setThemes] = useState(INITIAL_THEMES);
  // Alle thema's staan standaard OPEN onder elkaar!
  const [openThemes, setOpenThemes] = useState(
    INITIAL_THEMES.reduce((acc, t) => ({ ...acc, [t]: true }), {})
  );
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [persons, setPersons] = useState(INITIAL_PERSONS);

  // Filters voor Operationeel Bestuur overzicht
  const [selectedOrgFilter, setSelectedOrgFilter] = useState("ALL"); // 'ALL', 'Battle Droids', 'Kras', 'Habbekrats', 'Allemaal'
  const [selectedPersonFilter, setSelectedPersonFilter] = useState("ALL");
  const [onlyShowMatchingRows, setOnlyShowMatchingRows] = useState(false);

  // Beheer states
  const [newPersonName, setNewPersonName] = useState("");
  const [showTeamManager, setShowTeamManager] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [showAddThemeModal, setShowAddThemeModal] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'teamup', 'archive'
  const [toastMessage, setToastMessage] = useState(null);

  // Archief & Snapshots
  const [archives, setArchives] = useState([
    {
      id: "arch-init-1",
      date: "28/10/2026 14:00",
      title: "OB 28/10/2026 Volledig Verslag",
      itemsCount: 28
    },
    {
      id: "arch-init-2",
      date: "03/11/2026 11:30",
      title: "OB 03/11/2026 Online Vervolg",
      itemsCount: 33
    }
  ]);

  // Ref om laatste lokale state bij te houden voor directe cloud-opslag
  const stateRef = useRef({
    themes: INITIAL_THEMES,
    items: INITIAL_ITEMS,
    persons: INITIAL_PERSONS,
    archives: []
  });

  useEffect(() => {
    stateRef.current = { themes, items, persons, archives };
  }, [themes, items, persons, archives]);

  // 1. Eénmalige Authenticatie voor Realtime Samenwerking
  useEffect(() => {
    if (!auth) {
      setSyncStatus(activeRestUrl ? "synced" : "external_unconfigured");
      return;
    }
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        setSyncStatus("offline");
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, [activeRestUrl]);

  // 1b. Polling / Sync voor Externe Realtime Database URL (indien gebruikt op Google Sites)
  useEffect(() => {
    if (!activeRestUrl) return;
    let isMounted = true;
    const fetchExternalState = async () => {
      try {
        const cleanUrl = activeRestUrl.replace(/\/$/, "");
        const res = await fetch(`${cleanUrl}/scratch_ob_workspace.json`);
        if (!res.ok) return;
        const data = await res.json();
        if (data && isMounted) {
          if (data.themes) setThemes(data.themes);
          if (data.items) {
            setItems(data.items);
            setSelectedForTeamUpdate(
              data.items.reduce((acc, item) => ({ ...acc, [item.id]: item.teamUpdate === "Ja" }), {})
            );
          }
          if (data.persons) setPersons(data.persons);
          if (data.archives) setArchives(data.archives);
          setSyncStatus("synced");
        } else if (data === null && isMounted) {
          // Eerste keer op deze externe database: schrijf de 33 standaard OB-punten weg
          await fetch(`${cleanUrl}/scratch_ob_workspace.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              themes: stateRef.current.themes,
              items: stateRef.current.items,
              persons: stateRef.current.persons,
              archives: stateRef.current.archives,
              updatedAt: new Date().toISOString()
            })
          });
          setSyncStatus("synced");
        }
      } catch (e) {
        if (isMounted) setSyncStatus("offline");
      }
    };
    fetchExternalState();
    const interval = setInterval(fetchExternalState, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeRestUrl]);

  // 2. Realtime Cloud Listener (luistert live naar aanpassingen van alle OB-deelnemers)
  useEffect(() => {
    if (!user || !db) return;
    const stateDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'ob_workspace', 'main_state');

    const unsubscribe = onSnapshot(
      stateDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.themes) {
            setThemes(data.themes);
            setOpenThemes(prev => {
              const next = { ...prev };
              data.themes.forEach(t => {
                if (next[t] === undefined) next[t] = true;
              });
              return next;
            });
          }
          if (data.items) {
            setItems(data.items);
            setSelectedForTeamUpdate(
              data.items.reduce((acc, item) => ({ ...acc, [item.id]: item.teamUpdate === "Ja" }), {})
            );
          }
          if (data.persons) setPersons(data.persons);
          if (data.archives) setArchives(data.archives);
          if (data.updatedBy) setLastUpdatedBy(data.updatedBy);
          setSyncStatus("synced");
        } else {
          // Eerste keer opstarten: sla direct de standaard OB-data op in de gedeelde cloud
          setDoc(stateDocRef, {
            themes: INITIAL_THEMES,
            items: INITIAL_ITEMS,
            persons: INITIAL_PERSONS,
            archives: stateRef.current.archives,
            updatedAt: new Date().toISOString(),
            updatedBy: user.uid
          }).then(() => setSyncStatus("synced")).catch(() => setSyncStatus("offline"));
        }
      },
      () => {
        setSyncStatus("offline");
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Hulpfunctie om elke wijziging direct te pushen naar alle verbonden apparaten
  const persistWorkspace = async (overrides = {}) => {
    const nextThemes = overrides.themes !== undefined ? overrides.themes : stateRef.current.themes;
    const nextItems = overrides.items !== undefined ? overrides.items : stateRef.current.items;
    const nextPersons = overrides.persons !== undefined ? overrides.persons : stateRef.current.persons;
    const nextArchives = overrides.archives !== undefined ? overrides.archives : stateRef.current.archives;

    if (overrides.themes !== undefined) setThemes(nextThemes);
    if (overrides.items !== undefined) setItems(nextItems);
    if (overrides.persons !== undefined) setPersons(nextPersons);
    if (overrides.archives !== undefined) setArchives(nextArchives);

    // Optie A: Externe Realtime Database URL (voor Google Sites)
    if (activeRestUrl) {
      setSyncStatus("saving");
      try {
        const cleanUrl = activeRestUrl.replace(/\/$/, "");
        await fetch(`${cleanUrl}/scratch_ob_workspace.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            themes: nextThemes,
            items: nextItems,
            persons: nextPersons,
            archives: nextArchives,
            updatedAt: new Date().toISOString()
          })
        });
        setSyncStatus("synced");
      } catch (e) {
        setSyncStatus("offline");
      }
      return;
    }

    // Optie B: Ingebouwde Cloud Firestore
    if (!user || !db) return;
    setSyncStatus("saving");
    try {
      const stateDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'ob_workspace', 'main_state');
      await setDoc(stateDocRef, {
        themes: nextThemes,
        items: nextItems,
        persons: nextPersons,
        archives: nextArchives,
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid
      });
      setSyncStatus("synced");
    } catch (e) {
      setSyncStatus("offline");
    }
  };

  // JSON Backup Export & Import voor handmatige overdracht
  const exportFullBackupJson = () => {
    const dataStr = JSON.stringify({
      themes,
      items,
      persons,
      archives,
      exportedAt: new Date().toISOString()
    }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SCRATCH_OB_SysteemBackup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Volledige systeem-backup (.json) gedownload!");
  };

  const importFullBackupJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed.items && parsed.themes) {
          persistWorkspace({
            themes: parsed.themes,
            items: parsed.items,
            persons: parsed.persons || persons,
            archives: parsed.archives || archives
          });
          showToast("Systeem-backup succesvol ingeladen en gesynchroniseerd!");
        }
      } catch (err) {
        showToast("Ongeldig backup-bestand.");
      }
    };
    reader.readAsText(file);
  };

  // Modal voor bewerken / toevoegen agendapunt
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formProject, setFormProject] = useState("");
  const [formTheme, setFormTheme] = useState(INITIAL_THEMES[0]);
  const [formInfo, setFormInfo] = useState("");
  const [formType, setFormType] = useState("D");
  const [formDate, setFormDate] = useState("03/11/2026");
  const [formLinkLabel, setFormLinkLabel] = useState("");
  const [formLinkUrl, setFormLinkUrl] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [formTeamUpdate, setFormTeamUpdate] = useState("Ja");

  // Team Update Generator State
  const [selectedForTeamUpdate, setSelectedForTeamUpdate] = useState(
    INITIAL_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: item.teamUpdate === "Ja" }), {})
  );
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isAiRewriting, setIsAiRewriting] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Genereer standaard team update tekst
  useEffect(() => {
    const activeItems = items.filter(i => selectedForTeamUpdate[i.id]);
    let text = "🚀 *SCRATCH! TEAM-UPDATE VANUIT HET OB* 🔥\n";
    text += "Hey allemaal! Hierbij de belangrijkste updates, beslissingen en actiepunten vanuit ons Operationeel Bestuur om binnen elk team (Kras, Battle Droids & Habbekrats) mee te nemen:\n\n";
    
    themes.forEach(theme => {
      const themeItems = activeItems.filter(i => i.theme === theme);
      if (themeItems.length > 0) {
        text += `📌 *${theme.toUpperCase()}*\n`;
        themeItems.forEach(item => {
          text += `• *${item.project}*: ${item.info}\n`;
          if (item.status) {
            text += `  ↳ _Status:_ ${item.status}\n`;
          }
          if (item.statusUpdates?.length > 0) {
            const latest = item.statusUpdates[item.statusUpdates.length - 1];
            text += `  ↳ _Laatste update (${latest.date}):_ ${latest.text}\n`;
          }
          const openTodos = item.todos.filter(t => !t.done);
          if (openTodos.length > 0) {
            text += `  ↳ _Actie:_ ${openTodos.map(t => `[${t.org} - ${t.person}] ${t.text}`).join(" | ")}\n`;
          }
        });
        text += `\n`;
      }
    });

    text += "Samen houden we SCRATCH! scherp, warm en bruisend! 💛🖤 Vragen of aanvullingen? Laat het weten aan je coördinator!";
    setGeneratedMessage(text);
  }, [items, selectedForTeamUpdate, themes]);

  const handleAiRewrite = () => {
    setIsAiRewriting(true);
    setTimeout(() => {
      const activeItems = items.filter(i => selectedForTeamUpdate[i.id]);
      let energized = "⚡ *POSITIEVE BOOST & TEAM-UPDATE — SCRATCH! ANTWERPEN* 💛🖤\n\n";
      energized += "Topteam! Wat zetten we samen weer straffe dingen neer in huis voor onze jongeren. Hier zijn de highlights en afspraken vanuit het Operationeel Bestuur zodat iedereen helemaal mee is:\n\n";
      
      themes.forEach(theme => {
        const themeItems = activeItems.filter(i => i.theme === theme);
        if (themeItems.length > 0) {
          energized += `🔥 *${theme}*\n`;
          themeItems.forEach(item => {
            const latestUpdate = item.statusUpdates?.length > 0 
              ? ` (Update: ${item.statusUpdates[item.statusUpdates.length - 1].text})` 
              : "";
            energized += `✅ *${item.project}*: ${item.status || item.info}${latestUpdate}\n`;
          });
          energized += "\n";
        }
      });

      energized += "🙌 *Kras x Battle Droids x Habbekrats* — Bedankt voor jullie dagelijkse inzet en energie! Let's make it happen!";
      setGeneratedMessage(energized);
      setIsAiRewriting(false);
      showToast("Bericht herschreven in positieve & motiverende stijl!");
    }, 450);
  };

  // --- STATUS UPDATES LOGICA ---
  const addStatusUpdate = (itemId, updateText) => {
    if (!updateText.trim()) return;
    const todayStr = new Date().toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' });
    const nextItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          statusUpdates: [
            ...(item.statusUpdates || []),
            { id: 'su-' + Date.now(), date: todayStr, text: updateText.trim() }
          ]
        };
      }
      return item;
    });
    persistWorkspace({ items: nextItems });
    showToast("Status-update toegevoegd & gesynchroniseerd!");
  };

  const deleteStatusUpdate = (itemId, updateId) => {
    const nextItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          statusUpdates: (item.statusUpdates || []).filter(u => u.id !== updateId)
        };
      }
      return item;
    });
    persistWorkspace({ items: nextItems });
  };

  const updateBaseStatus = (itemId, newBaseStatus) => {
    const nextItems = items.map(item => item.id === itemId ? { ...item, status: newBaseStatus } : item);
    persistWorkspace({ items: nextItems });
    showToast("Basisstatus opgeslagen!");
  };

  // --- TO-DO LOGICA (MET LOSSE ORGANISATIE + TEAMLID) ---
  const addTodo = (itemId, text, org, person) => {
    if (!text.trim()) return;
    const nextItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          todos: [
            ...item.todos,
            {
              id: 't-' + Date.now(),
              text: text.trim(),
              done: false,
              org: org || "Allemaal",
              person: person || "Geen"
            }
          ]
        };
      }
      return item;
    });
    persistWorkspace({ items: nextItems });
  };

  const toggleTodo = (itemId, todoId) => {
    const nextItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          todos: item.todos.map(t => t.id === todoId ? { ...t, done: !t.done } : t)
        };
      }
      return item;
    });
    persistWorkspace({ items: nextItems });
  };

  const updateTodoOrg = (itemId, todoId, newOrg) => {
    const nextItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          todos: item.todos.map(t => t.id === todoId ? { ...t, org: newOrg } : t)
        };
      }
      return item;
    });
    persistWorkspace({ items: nextItems });
  };

  const updateTodoPerson = (itemId, todoId, newPerson) => {
    const nextItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          todos: item.todos.map(t => t.id === todoId ? { ...t, person: newPerson } : t)
        };
      }
      return item;
    });
    persistWorkspace({ items: nextItems });
  };

  const deleteTodo = (itemId, todoId) => {
    const nextItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          todos: item.todos.filter(t => t.id !== todoId)
        };
      }
      return item;
    });
    persistWorkspace({ items: nextItems });
  };

  // --- LINKS LOGICA ---
  const addQuickLink = (itemId, label, url) => {
    if (!url.trim()) return;
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    const nextItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          links: [...(item.links || []), { label: label.trim() || "Drive / Link", url: formattedUrl }]
        };
      }
      return item;
    });
    persistWorkspace({ items: nextItems });
  };

  const removeQuickLink = (itemId, index) => {
    const nextItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          links: (item.links || []).filter((_, i) => i !== index)
        };
      }
      return item;
    });
    persistWorkspace({ items: nextItems });
  };

  const toggleItemTeamUpdate = (itemId) => {
    const nextItems = items.map(item => {
      if (item.id === itemId) {
        const nextVal = item.teamUpdate === "Ja" ? "Intern" : "Ja";
        setSelectedForTeamUpdate(prev => ({ ...prev, [itemId]: nextVal === "Ja" }));
        return { ...item, teamUpdate: nextVal };
      }
      return item;
    });
    persistWorkspace({ items: nextItems });
  };

  // --- TEAMLEDEN BEHEER ---
  const addPerson = (e) => {
    e?.preventDefault();
    const trimmed = newPersonName.trim();
    if (trimmed && !persons.includes(trimmed)) {
      const nextPersons = [...persons, trimmed];
      persistWorkspace({ persons: nextPersons });
      setNewPersonName("");
      showToast(`Teamlid "${trimmed}" toegevoegd!`);
    }
  };

  const removePerson = (p) => {
    const nextPersons = persons.filter(item => item !== p);
    persistWorkspace({ persons: nextPersons });
    if (selectedPersonFilter === p) setSelectedPersonFilter("ALL");
    showToast(`Teamlid "${p}" verwijderd.`);
  };

  // --- THEMA BEHEER & DROPDOWNS ---
  const toggleThemeOpen = (theme) => {
    setOpenThemes(prev => ({ ...prev, [theme]: !prev[theme] }));
  };

  const setAllThemesOpen = (isOpen) => {
    const nextState = {};
    themes.forEach(t => { nextState[t] = isOpen; });
    setOpenThemes(nextState);
  };

  const addTheme = (e) => {
    e?.preventDefault();
    const trimmed = newThemeName.trim();
    if (trimmed && !themes.includes(trimmed)) {
      const nextThemes = [...themes, trimmed];
      persistWorkspace({ themes: nextThemes });
      setOpenThemes(prev => ({ ...prev, [trimmed]: true }));
      setNewThemeName("");
      setShowAddThemeModal(false);
      showToast(`Thema "${trimmed}" toegevoegd!`);
    }
  };

  const removeTheme = (themeToRemove) => {
    if (themes.length <= 1) return;
    const nextThemes = themes.filter(t => t !== themeToRemove);
    const nextItems = items.filter(i => i.theme !== themeToRemove);
    persistWorkspace({ themes: nextThemes, items: nextItems });
    showToast(`Thema "${themeToRemove}" verwijderd.`);
  };

  // --- ITEM MODAL LOGICA ---
  const openItemModal = (item = null, defaultTheme = themes[0]) => {
    if (item) {
      setEditingItem(item);
      setFormProject(item.project);
      setFormTheme(item.theme);
      setFormInfo(item.info);
      setFormType(item.type);
      setFormDate(item.date);
      setFormLinkLabel(item.links?.[0]?.label || "");
      setFormLinkUrl(item.links?.[0]?.url || "");
      setFormStatus(item.status);
      setFormTeamUpdate(item.teamUpdate);
    } else {
      setEditingItem(null);
      setFormProject("");
      setFormTheme(defaultTheme || themes[0]);
      setFormInfo("");
      setFormType("D");
      setFormDate(new Date().toLocaleDateString('nl-BE'));
      setFormLinkLabel("");
      setFormLinkUrl("");
      setFormStatus("");
      setFormTeamUpdate("Ja");
    }
    setShowItemModal(true);
  };

  const saveItem = (e) => {
    e.preventDefault();
    if (!formProject.trim()) return;

    const builtLinks = formLinkUrl.trim() 
      ? [{ label: formLinkLabel.trim() || "Link", url: formLinkUrl.trim() }] 
      : (editingItem?.links || []);

    if (editingItem) {
      const nextItems = items.map(i => i.id === editingItem.id ? {
        ...i,
        project: formProject,
        theme: formTheme,
        info: formInfo,
        type: formType,
        date: formDate,
        links: builtLinks,
        status: formStatus,
        teamUpdate: formTeamUpdate
      } : i);
      persistWorkspace({ items: nextItems });
      showToast("Agendapunt bijgewerkt & gesynchroniseerd!");
    } else {
      const newItem = {
        id: 'item-' + Date.now(),
        theme: formTheme,
        project: formProject,
        info: formInfo,
        type: formType,
        date: formDate,
        links: builtLinks,
        status: formStatus,
        statusUpdates: [],
        todos: [],
        teamUpdate: formTeamUpdate
      };
      const nextItems = [...items, newItem];
      persistWorkspace({ items: nextItems });
      setSelectedForTeamUpdate(prev => ({ ...prev, [newItem.id]: formTeamUpdate === "Ja" }));
      setOpenThemes(prev => ({ ...prev, [formTheme]: true }));
      showToast("Nieuw agendapunt toegevoegd & gesynchroniseerd!");
    }
    setShowItemModal(false);
  };

  const deleteItem = (id) => {
    const nextItems = items.filter(i => i.id !== id);
    persistWorkspace({ items: nextItems });
    showToast("Agendapunt verwijderd.");
  };

  // --- EXCEL / CSV EXPORT ---
  const escapeHtml = (str = "") =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const downloadSpreadsheet = () => {
    const todayFormatted = new Date().toLocaleDateString('nl-BE');

    let tableRowsHtml = `
      <!-- TITEL & LEGENDE BOVENAAN ZOALS ORIGINEEL SJABLOON -->
      <tr>
        <td colspan="6" style="background-color:#111111; color:#FACC15; font-family:Calibri, Arial, sans-serif; font-size:16pt; font-weight:bold; padding:12px 14px; border:1px solid #333333;">
          SCRATCH! — OPERATIONEEL BESTUUR OVERZICHT (Export ${escapeHtml(todayFormatted)})
        </td>
      </tr>
      <tr>
        <td style="background-color:#FCE5CD; color:#000000; font-family:Calibri, Arial, sans-serif; font-size:10pt; font-weight:bold; padding:6px 10px; border:1px solid #CCCCCC;">
          Mededelen = M
        </td>
        <td style="background-color:#FCE5CD; color:#000000; font-family:Calibri, Arial, sans-serif; font-size:10pt; font-weight:bold; padding:6px 10px; border:1px solid #CCCCCC;">
          Beslissen = B
        </td>
        <td style="background-color:#FCE5CD; color:#000000; font-family:Calibri, Arial, sans-serif; font-size:10pt; font-weight:bold; padding:6px 10px; border:1px solid #CCCCCC;">
          Dialoog = D
        </td>
        <td colspan="3" style="background-color:#FFF2CC; color:#333333; font-family:Calibri, Arial, sans-serif; font-size:9.5pt; padding:6px 10px; border:1px solid #CCCCCC;">
          <strong>Organisatie-kleuren:</strong>
          <span style="color:#1D4ED8; font-weight:bold;">[Battle Droids = Blauw]</span> &nbsp;|&nbsp;
          <span style="color:#DC2626; font-weight:bold;">[Kras = Rood]</span> &nbsp;|&nbsp;
          <span style="color:#047857; font-weight:bold;">[Habbekrats = Groen]</span> &nbsp;|&nbsp;
          <span style="color:#B45309; font-weight:bold;">[Allemaal = Geel/Oranje]</span>
        </td>
      </tr>
      <!-- KOLOM HEADERS EXACT ZOALS ORIGINELE OB SPREADSHEET -->
      <tr>
        <th style="background-color:#F4CCCC; color:#000000; font-family:Calibri, Arial, sans-serif; font-size:11pt; font-weight:bold; padding:10px; border:1px solid #999999; text-align:left; width:210px;">
          Project / Onderwerp
        </th>
        <th style="background-color:#F4CCCC; color:#000000; font-family:Calibri, Arial, sans-serif; font-size:11pt; font-weight:bold; padding:10px; border:1px solid #999999; text-align:left; width:340px;">
          Info / vraag (kort in 1 zin!) + link naar map/bestand met meer info
        </th>
        <th style="background-color:#F4CCCC; color:#000000; font-family:Calibri, Arial, sans-serif; font-size:11pt; font-weight:bold; padding:10px; border:1px solid #999999; text-align:center; width:95px;">
          M / B / D
        </th>
        <th style="background-color:#F4CCCC; color:#000000; font-family:Calibri, Arial, sans-serif; font-size:11pt; font-weight:bold; padding:10px; border:1px solid #999999; text-align:left; width:400px;">
          Verdere uitleg / bespreking op OB
        </th>
        <th style="background-color:#F4CCCC; color:#000000; font-family:Calibri, Arial, sans-serif; font-size:11pt; font-weight:bold; padding:10px; border:1px solid #999999; text-align:left; width:340px;">
          To do
        </th>
        <th style="background-color:#F4CCCC; color:#000000; font-family:Calibri, Arial, sans-serif; font-size:11pt; font-weight:bold; padding:10px; border:1px solid #999999; text-align:center; width:150px;">
          Meenemen naar team?
        </th>
      </tr>
    `;

    themes.forEach((theme, themeIdx) => {
      const themeItems = items.filter(i => i.theme === theme);

      // RODE THEMABALK OVER ALLE KOLOMMEN (Exact zoals in het originele Excel/Sheets bestand)
      tableRowsHtml += `
        <tr>
          <td colspan="6" style="background-color:#CC0000; color:#FFFFFF; font-family:Calibri, Arial, sans-serif; font-size:11pt; font-weight:bold; text-align:center; padding:8px 12px; border:1px solid #990000; letter-spacing:0.5px;">
            ${escapeHtml(theme)}
          </td>
        </tr>
      `;

      if (themeItems.length === 0) {
        tableRowsHtml += `
          <tr>
            <td colspan="6" style="background-color:#FFFFFF; color:#888888; font-family:Calibri, Arial, sans-serif; font-size:10pt; font-style:italic; padding:8px 10px; border:1px solid #D9D9D9;">
              Geen agendapunten onder ${escapeHtml(theme)}.
            </td>
          </tr>
        `;
      } else {
        themeItems.forEach((item, idx) => {
          const rowBg = idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB";

          // Info + klikbare links
          const linksHtml = (item.links || [])
            .map(l => `<br/><a href="${escapeHtml(l.url)}" style="color:#1155CC; text-decoration:underline; font-size:9.5pt;">🔗 ${escapeHtml(l.label)}</a>`)
            .join("");

          // Type badge kleur in Excel
          const typeBg = item.type === "D" ? "#EDE9FE" : item.type === "B" ? "#FEF3C7" : "#E0F2FE";
          const typeColor = item.type === "D" ? "#5B21B6" : item.type === "B" ? "#92400E" : "#075985";

          // Basisstatus + chronologische status-updates eronder
          const statusUpdatesHtml = (item.statusUpdates || [])
            .map(u => `<div style="margin-top:4px; color:#1F2937;"><strong>• Update (${escapeHtml(u.date)}):</strong> ${escapeHtml(u.text)}</div>`)
            .join("");

          // To-do's met organisatie-kleur en teamlid
          const todosHtml = item.todos.length === 0
            ? `<span style="color:#9CA3AF; font-style:italic;">-</span>`
            : item.todos.map(t => {
                const orgColor =
                  t.org === "Battle Droids" ? "#1D4ED8" :
                  t.org === "Kras" ? "#DC2626" :
                  t.org === "Habbekrats" ? "#047857" : "#B45309";
                const checkIcon = t.done ? "☑" : "☐";
                const strikeStyle = t.done ? "text-decoration:line-through; color:#9CA3AF;" : "color:#111827;";
                const personLabel = t.person && t.person !== "Geen" ? ` (${escapeHtml(t.person)})` : "";
                return `<div style="margin-bottom:4px; ${strikeStyle}">
                  <strong>${checkIcon}</strong>
                  <span style="color:${orgColor}; font-weight:bold;">[${escapeHtml(t.org)}${personLabel}]</span>
                  ${escapeHtml(t.text)}
                </div>`;
              }).join("");

          const teamBg = item.teamUpdate === "Ja" ? "#D9EAD3" : "#F3F4F6";
          const teamColor = item.teamUpdate === "Ja" ? "#274E13" : "#6B7280";

          tableRowsHtml += `
            <tr>
              <td style="background-color:${rowBg}; color:#000000; font-family:Calibri, Arial, sans-serif; font-size:10.5pt; font-weight:bold; padding:8px 10px; border:1px solid #CCCCCC; vertical-align:top;">
                ${escapeHtml(item.project)}
                <div style="font-size:8.5pt; color:#666666; font-weight:normal; margin-top:3px;">${escapeHtml(item.date)}</div>
              </td>
              <td style="background-color:${rowBg}; color:#111111; font-family:Calibri, Arial, sans-serif; font-size:10pt; padding:8px 10px; border:1px solid #CCCCCC; vertical-align:top; mso-number-format:'\\@';">
                ${escapeHtml(item.info)}
                ${linksHtml}
              </td>
              <td style="background-color:${typeBg}; color:${typeColor}; font-family:Calibri, Arial, sans-serif; font-size:10.5pt; font-weight:bold; padding:8px 10px; border:1px solid #CCCCCC; text-align:center; vertical-align:top;">
                ${escapeHtml(item.type)}
              </td>
              <td style="background-color:${rowBg}; color:#111111; font-family:Calibri, Arial, sans-serif; font-size:10pt; padding:8px 10px; border:1px solid #CCCCCC; vertical-align:top;">
                <div>${escapeHtml(item.status || "-")}</div>
                ${statusUpdatesHtml}
              </td>
              <td style="background-color:${rowBg}; font-family:Calibri, Arial, sans-serif; font-size:10pt; padding:8px 10px; border:1px solid #CCCCCC; vertical-align:top;">
                ${todosHtml}
              </td>
              <td style="background-color:${teamBg}; color:${teamColor}; font-family:Calibri, Arial, sans-serif; font-size:10pt; font-weight:bold; padding:8px 10px; border:1px solid #CCCCCC; text-align:center; vertical-align:top;">
                ${escapeHtml(item.teamUpdate)}
              </td>
            </tr>
          `;
        });
      }
    });

    const excelHtmlDocument = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>OB Overzicht</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; table-layout: fixed; }
          td, th { word-wrap: break-word; overflow-wrap: break-word; }
          br { mso-data-placement: same-cell; }
        </style>
      </head>
      <body>
        <table>
          ${tableRowsHtml}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', excelHtmlDocument], {
      type: 'application/vnd.ms-excel;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `OB_SCRATCH_Overzicht_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Opgemaakte OB Spreadsheet (.xls) gedownload in originele layout!");
  };

  const finishAndDownloadOB = () => {
    const snapshot = {
      id: 'arch-' + Date.now(),
      date: new Date().toLocaleString('nl-BE'),
      title: `Afgerond OB (${new Date().toLocaleDateString('nl-BE')})`,
      itemsCount: items.length,
      savedItems: JSON.parse(JSON.stringify(items)),
      savedThemes: [...themes]
    };
    const nextArchives = [snapshot, ...archives];
    persistWorkspace({ archives: nextArchives });
    downloadSpreadsheet();
  };

  const createArchiveSnapshot = () => {
    const snapshot = {
      id: 'arch-' + Date.now(),
      date: new Date().toLocaleString('nl-BE'),
      title: `OB Snapshot (${items.length} punten)`,
      itemsCount: items.length,
      savedItems: JSON.parse(JSON.stringify(items)),
      savedThemes: [...themes]
    };
    const nextArchives = [snapshot, ...archives];
    persistWorkspace({ archives: nextArchives });
    showToast("Snapshot opgeslagen en gesynchroniseerd in het archief!");
  };

  const deleteArchiveSnapshot = (snapshotId) => {
    const nextArchives = archives.filter(a => a.id !== snapshotId);
    persistWorkspace({ archives: nextArchives });
    showToast("OB Snapshot verwijderd uit het systeem.");
  };

  const restoreArchiveSnapshot = (snapshot) => {
    if (snapshot.savedItems && snapshot.savedItems.length > 0) {
      persistWorkspace({
        items: snapshot.savedItems,
        themes: snapshot.savedThemes || themes
      });
      setActiveTab("dashboard");
      showToast(`Snapshot "${snapshot.title}" hersteld naar het actieve overzicht!`);
    } else {
      setActiveTab("dashboard");
      showToast(`Overzicht geopend voor "${snapshot.title}"!`);
    }
  };

  // Tel open to-do's per organisatie
  const getOrgOpenTodoCount = (orgName) => {
    let count = 0;
    items.forEach(item => {
      item.todos.forEach(t => {
        if (!t.done && (orgName === "ALL" || t.org === orgName)) count++;
      });
    });
    return count;
  };

  // Check of een to-do matcht met de actieve organisatie- en persoonsfilter
  const todoMatchesFilter = (todo) => {
    const orgMatch = selectedOrgFilter === "ALL" || todo.org === selectedOrgFilter;
    const personMatch = selectedPersonFilter === "ALL" || todo.person === selectedPersonFilter;
    return orgMatch && personMatch;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-yellow-400 selection:text-black">
      
      {/* TOAST MELDING */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-yellow-400 text-black font-black px-4 py-3 rounded-xl shadow-2xl border-2 border-black flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs">{toastMessage}</span>
        </div>
      )}

      {/* HEADER MET EXACT SCRATCH! LOGO */}
      <header className="bg-neutral-900/95 backdrop-blur-md border-b border-yellow-500/30 px-4 lg:px-8 py-3.5 flex flex-col xl:flex-row items-center justify-between gap-4 sticky top-0 z-40 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-black flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/10 border border-neutral-800 overflow-hidden">
            <img src={SCRATCH_LOGO} alt="SCRATCH! Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-yellow-400">SCRATCH!</h1>
              <span className="bg-yellow-400 text-black text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Operationeel Bestuur
              </span>
              {/* Live Cloud Sync Badge + Instellingen knop voor Google Sites */}
              <button 
                onClick={() => setShowCloudSetupModal(true)}
                className={`text-[11px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-all cursor-pointer ${
                  syncStatus === 'synced' 
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25' 
                    : syncStatus === 'saving'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : 'bg-red-500/20 text-red-300 border-red-500/50 hover:bg-red-500/30 animate-pulse'
                }`}
                title="Klik voor Cloud Synchronisatie & Google Sites Instellingen"
              >
                <span className={`w-2 h-2 rounded-full ${
                  syncStatus === 'synced' ? 'bg-emerald-400' : 
                  syncStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-red-400'
                }`} />
                <Cloud className="w-3.5 h-3.5" />
                {syncStatus === 'synced' 
                  ? 'Live Cloud Sync Actief' 
                  : syncStatus === 'saving' 
                  ? 'Opslaan...' 
                  : '⚠️ Google Sites Cloud Koppelen (Klik hier)'}
              </button>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Realtime Samenwerking tussen apparaten & profielen • Kras, Battle Droids & Habbekrats
              {user && <span className="text-[10px] text-neutral-500 ml-2 font-mono">(ID: {user.uid})</span>}
            </p>
          </div>
        </div>

        {/* Hoofdnavigatie */}
        <div className="flex flex-wrap items-center gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === 'dashboard' 
                ? 'bg-yellow-400 text-black shadow-md' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Operationeel Bestuur overzicht
          </button>
          <button 
            onClick={() => setActiveTab("teamup")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === 'teamup' 
                ? 'bg-yellow-400 text-black shadow-md' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Share2 className="w-4 h-4" /> Team-Update Generator
          </button>
          <button 
            onClick={() => setActiveTab("archive")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === 'archive' 
                ? 'bg-yellow-400 text-black shadow-md' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FolderArchive className="w-4 h-4" /> Drive & Archief
          </button>
        </div>

        {/* Actieknoppen rechts */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setShowTeamManager(!showTeamManager)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              showTeamManager 
                ? 'bg-neutral-800 text-yellow-400 border-yellow-400' 
                : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <Users className="w-4 h-4 text-yellow-400" /> Teamleden ({persons.length})
          </button>
          <button
            onClick={() => setShowAddThemeModal(true)}
            className="bg-neutral-950 hover:bg-neutral-800 text-yellow-400 border border-yellow-500/30 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nieuw Thema
          </button>
          <button 
            onClick={() => openItemModal()}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-transform active:scale-95 text-xs md:text-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Nieuw Punt
          </button>
          <button 
            onClick={finishAndDownloadOB}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-transform active:scale-95 text-xs md:text-sm"
            title="Sla een snapshot op en download direct als opgemaakte OB Excel-spreadsheet (.xls)"
          >
            <Download className="w-4 h-4 stroke-[3]" /> OB Afronden & Download (.xls)
          </button>
        </div>
      </header>

      {/* UITKLAPBAAR TEAMLEDEN BEHEER PANEEL */}
      {showTeamManager && (
        <div className="bg-neutral-900 border-b border-neutral-800 px-4 lg:px-8 py-4 shadow-inner">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Teamleden Beheer (los te koppelen aan To-do's):
                </span>
                <span className="text-[11px] text-neutral-400">Klik op een naam om te filteren of op × om te verwijderen.</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {persons.map(p => (
                  <span 
                    key={p} 
                    className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                      selectedPersonFilter === p 
                        ? 'bg-yellow-400 text-black border-yellow-300 font-black' 
                        : 'bg-neutral-950 text-neutral-200 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <button onClick={() => setSelectedPersonFilter(selectedPersonFilter === p ? "ALL" : p)}>
                      {p}
                    </button>
                    <button 
                      onClick={() => removePerson(p)} 
                      className="text-neutral-500 hover:text-red-400 ml-0.5"
                      title={`Verwijder ${p}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={addPerson} className="flex items-center gap-2 shrink-0">
              <input 
                type="text"
                placeholder="Nieuw teamlid naam..."
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
              />
              <button 
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-300 text-black px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Teamlid Toevoegen
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HOOFDINHOUD */}
      <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto">

        {/* TAB 1: OPERATIONEEL BESTUUR OVERZICHT */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* ORGANISATIE TO-DO FILTER BALK (BLAUW = BD, ROOD = KRAS, GROEN = HAB, GEEL = ALLEMAAL) */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Organisatie knoppen */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mr-1">
                    <Filter className="w-4 h-4 text-yellow-400" /> Filter To-do's per Organisatie:
                  </span>

                  <button
                    onClick={() => setSelectedOrgFilter("ALL")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all flex items-center gap-2 ${
                      selectedOrgFilter === "ALL"
                        ? "bg-white text-black border-white shadow-md scale-105"
                        : "bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700"
                    }`}
                  >
                    Alle Organisaties
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-white">
                      {getOrgOpenTodoCount("ALL")} open
                    </span>
                  </button>

                  {ORGANIZATIONS.map(orgKey => {
                    const cfg = ORG_CONFIG[orgKey];
                    const isSelected = selectedOrgFilter === orgKey;
                    const openCount = getOrgOpenTodoCount(orgKey);
                    return (
                      <button
                        key={orgKey}
                        onClick={() => setSelectedOrgFilter(isSelected ? "ALL" : orgKey)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all flex items-center gap-2 ${
                          isSelected
                            ? `${cfg.solid} shadow-lg scale-105 ring-2 ${cfg.ring}`
                            : `${cfg.badge}`
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} border border-white/40`} />
                        {cfg.name}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                          isSelected ? "bg-black/30 text-white" : "bg-neutral-950/80 text-neutral-200"
                        }`}>
                          {openCount} open
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Filter op Teamlid + Rij-filter toggle + Alles open/dicht */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800">
                    <Users className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-xs text-neutral-400 font-bold">Teamlid:</span>
                    <select
                      value={selectedPersonFilter}
                      onChange={(e) => setSelectedPersonFilter(e.target.value)}
                      className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer"
                    >
                      <option value="ALL" className="bg-neutral-900">Iedereen</option>
                      {persons.map(p => (
                        <option key={p} value={p} className="bg-neutral-900">{p}</option>
                      ))}
                    </select>
                  </div>

                  {(selectedOrgFilter !== "ALL" || selectedPersonFilter !== "ALL") && (
                    <label className="flex items-center gap-2 text-xs text-neutral-300 bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-800 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={onlyShowMatchingRows}
                        onChange={(e) => setOnlyShowMatchingRows(e.target.checked)}
                        className="accent-yellow-400 rounded"
                      />
                      Verberg punten zonder to-do voor deze selectie
                    </label>
                  )}

                  {(selectedOrgFilter !== "ALL" || selectedPersonFilter !== "ALL") && (
                    <button
                      onClick={() => {
                        setSelectedOrgFilter("ALL");
                        setSelectedPersonFilter("ALL");
                        setOnlyShowMatchingRows(false);
                      }}
                      className="text-xs text-yellow-400 hover:underline font-bold px-2"
                    >
                      Reset filter
                    </button>
                  )}

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={() => setAllThemesOpen(true)}
                      className="text-[11px] font-bold text-neutral-300 hover:text-yellow-400 bg-neutral-950 px-2.5 py-1.5 rounded-lg border border-neutral-800"
                    >
                      Alles open
                    </button>
                    <button
                      onClick={() => setAllThemesOpen(false)}
                      className="text-[11px] font-bold text-neutral-300 hover:text-yellow-400 bg-neutral-950 px-2.5 py-1.5 rounded-lg border border-neutral-800"
                    >
                      Alles dicht
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ALLE THEMA'S ONDER ELKAAR ALS OPEN DROPDOWN-SECTIES */}
            <div className="space-y-8">
              {themes.map(theme => {
                const isOpen = !!openThemes[theme];
                const allThemeItems = items.filter(i => i.theme === theme);
                
                // Pas eventueel de rij-filter toe
                const visibleThemeItems = allThemeItems.filter(item => {
                  if (!onlyShowMatchingRows && selectedOrgFilter === "ALL" && selectedPersonFilter === "ALL") {
                    return true;
                  }
                  if (!onlyShowMatchingRows) return true;
                  return item.todos.some(todoMatchesFilter);
                });

                const matchingTodoCount = allThemeItems.reduce((acc, item) => {
                  return acc + item.todos.filter(t => !t.done && todoMatchesFilter(t)).length;
                }, 0);

                return (
                  <div key={theme} className="bg-neutral-950/90 rounded-3xl border-2 border-neutral-800 overflow-hidden shadow-2xl">
                    
                    {/* DROPDOWN HEADER BALK PER THEMA */}
                    <div 
                      onClick={() => toggleThemeOpen(theme)}
                      className="bg-neutral-900 hover:bg-neutral-800/90 cursor-pointer px-6 py-4 border-b-2 border-neutral-800 flex flex-wrap items-center justify-between gap-4 select-none transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black shadow-md">
                          {isOpen ? <ChevronDown className="w-5 h-5 stroke-[3]" /> : <ChevronRight className="w-5 h-5 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h2 className="text-lg md:text-xl font-black text-yellow-400 tracking-wide uppercase">
                              {theme}
                            </h2>
                            <span className="text-xs font-bold bg-neutral-950 text-neutral-300 px-3 py-0.5 rounded-full border border-neutral-700">
                              {visibleThemeItems.length} {visibleThemeItems.length === 1 ? 'punt' : 'punten'}
                            </span>
                            {matchingTodoCount > 0 && (
                              <span className="text-xs font-black bg-yellow-400/20 text-yellow-300 px-3 py-0.5 rounded-full border border-yellow-400/40">
                                {matchingTodoCount} open to-do{matchingTodoCount === 1 ? '' : "'s"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openItemModal(null, theme)}
                          className="bg-yellow-400 hover:bg-yellow-300 text-black px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors flex items-center gap-1 shadow"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" /> Punt in {theme}
                        </button>
                        {themes.length > 1 && (
                          <button
                            onClick={() => removeTheme(theme)}
                            className="p-2 text-neutral-400 hover:text-red-400 rounded-xl hover:bg-neutral-950 border border-transparent hover:border-neutral-800 transition-colors"
                            title={`Verwijder thema ${theme}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* DROPDOWN CONTENT (STANDAARD OPEN MET DUIDELIJKE KAARTEN PER PUNT) */}
                    {isOpen && (
                      <div className="p-4 lg:p-6 bg-neutral-950">
                        {visibleThemeItems.length === 0 ? (
                          <div className="text-center py-10 text-neutral-500 text-xs bg-neutral-900/50 rounded-2xl border border-neutral-800">
                            Geen agendapunten voor deze filter in <strong>{theme}</strong>.
                          </div>
                        ) : (
                          <div className="space-y-5">
                            {/* 4-Koloms Header boven de kaarten */}
                            <div className="hidden lg:grid grid-cols-12 bg-neutral-900 text-xs font-black text-yellow-400 uppercase tracking-wider px-5 py-3 rounded-xl border border-neutral-800 gap-6 shadow">
                              <div className="col-span-3">1. Project / Onderwerp & Info</div>
                              <div className="col-span-4">2. Huidige Status & Nieuwe Update</div>
                              <div className="col-span-4">3. To-Do's (Organisatie + Teamlid)</div>
                              <div className="col-span-1 text-center">4. Team</div>
                            </div>

                            {/* Losse, visueel duidelijk gescheiden Kaarten per Agendapunt */}
                            {visibleThemeItems.map((item, idx) => (
                              <AgendaRow 
                                key={item.id}
                                index={idx + 1}
                                item={item}
                                persons={persons}
                                selectedOrgFilter={selectedOrgFilter}
                                selectedPersonFilter={selectedPersonFilter}
                                todoMatchesFilter={todoMatchesFilter}
                                onEdit={() => openItemModal(item)}
                                onDelete={() => deleteItem(item.id)}
                                onAddStatusUpdate={(text) => addStatusUpdate(item.id, text)}
                                onDeleteStatusUpdate={(uId) => deleteStatusUpdate(item.id, uId)}
                                onUpdateBaseStatus={(val) => updateBaseStatus(item.id, val)}
                                onAddTodo={(text, org, person) => addTodo(item.id, text, org, person)}
                                onToggleTodo={(tId) => toggleTodo(item.id, tId)}
                                onUpdateTodoOrg={(tId, org) => updateTodoOrg(item.id, tId, org)}
                                onUpdateTodoPerson={(tId, p) => updateTodoPerson(item.id, tId, p)}
                                onDeleteTodo={(tId) => deleteTodo(item.id, tId)}
                                onAddLink={(lbl, url) => addQuickLink(item.id, lbl, url)}
                                onRemoveLink={(linkIdx) => removeQuickLink(item.id, linkIdx)}
                                onToggleTeamUpdate={() => toggleItemTeamUpdate(item.id)}
                              />
                            ))}
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

        {/* TAB 2: TEAM-UPDATE GENERATOR */}
        {activeTab === 'teamup' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h2 className="text-lg font-black text-yellow-400">1. Selecteer OB-Punten</h2>
                  <p className="text-xs text-neutral-400">Vink aan wat mee mag naar het bredere teamoverleg.</p>
                </div>
                <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-500/30 text-xs font-bold px-3 py-1 rounded-lg">
                  {Object.values(selectedForTeamUpdate).filter(Boolean).length} geselecteerd
                </span>
              </div>

              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
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
                        <span className="text-[11px] font-bold text-yellow-400">{item.theme}</span>
                        <span className="text-[10px] text-neutral-500">{item.date}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm truncate">{item.project}</h4>
                      <p className="text-xs text-neutral-300 line-clamp-2 mt-0.5">{item.status || item.info}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-6 shadow-xl flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                <div>
                  <h2 className="text-lg font-black text-yellow-400">2. Gegenereerd Team-Bericht</h2>
                  <p className="text-xs text-neutral-400">Klaar voor WhatsApp, mail of jullie wekelijks teamoverleg.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleAiRewrite}
                    disabled={isAiRewriting}
                    className="bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border border-yellow-500/30 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAiRewriting ? 'animate-spin' : ''}`} /> Maak Positief & Motiverend
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedMessage);
                      showToast("Team-Update gekopieerd naar je klembord!");
                    }}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5" /> Kopieer Bericht
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <textarea 
                  rows={18}
                  value={generatedMessage}
                  onChange={(e) => setGeneratedMessage(e.target.value)}
                  className="w-full flex-1 bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm text-neutral-200 focus:outline-none focus:border-yellow-400 font-mono resize-none leading-relaxed shadow-inner"
                />
              </div>

              <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 
                  Elke coördinator kan dit verslagje binnen de week op het eigen teamoverleg overlopen.
                </span>
                <span className="font-bold text-yellow-400 shrink-0">SCRATCH! Flow</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GOOGLE DRIVE & ARCHIEF */}
        {activeTab === 'archive' && (
          <div className="space-y-6 max-w-[1400px] mx-auto">
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 lg:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
                <div>
                  <h2 className="text-xl font-black text-yellow-400 flex items-center gap-2">
                    <Download className="w-6 h-6" /> Operationeel Bestuur — Spreadsheet Export & Archief
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Rond het OB af, download direct de opgemaakte OB-spreadsheet (.xls) met rode themabalken of beheer jullie opgeslagen snapshots.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button 
                    onClick={finishAndDownloadOB}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 text-xs md:text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" /> OB Afronden & Download (.xls)
                  </button>
                  <button 
                    onClick={downloadSpreadsheet}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 text-xs md:text-sm"
                  >
                    <Download className="w-4 h-4 stroke-[3]" /> Enkel Spreadsheet (.xls)
                  </button>
                </div>
              </div>

              {/* LIVE VISUELE PREVIEW VAN DE OFFICIËLE OB SPREADSHEET LAYOUT */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-yellow-400" /> Live Voorbeeld van je Excel-bestand (.xls)
                  </h3>
                  <span className="text-[11px] text-neutral-400">
                    Exact dezelfde kolommen, rode themabalken en kleuren worden geëxporteerd naar Excel & Google Sheets
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden border-2 border-neutral-700 shadow-2xl bg-white text-black max-h-[480px] overflow-y-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-[#FCE5CD] text-black font-bold border-b border-neutral-400 text-[11px]">
                        <td className="p-2 border border-neutral-300">Mededelen = M</td>
                        <td className="p-2 border border-neutral-300">Beslissen = B</td>
                        <td className="p-2 border border-neutral-300 text-center">Dialoog = D</td>
                        <td colSpan={3} className="p-2 border border-neutral-300 bg-[#FFF2CC]">
                          Organisaties: <span className="text-blue-700 font-extrabold">[Battle Droids]</span> • <span className="text-red-600 font-extrabold">[Kras]</span> • <span className="text-emerald-700 font-extrabold">[Habbekrats]</span> • <span className="text-amber-700 font-extrabold">[Allemaal]</span>
                        </td>
                      </tr>
                      <tr className="bg-[#F4CCCC] text-black font-black text-xs sticky top-0 z-10 shadow-sm">
                        <th className="p-2.5 border border-neutral-400 w-[16%]">Project / Onderwerp</th>
                        <th className="p-2.5 border border-neutral-400 w-[24%]">Info / vraag (kort in 1 zin!) + link</th>
                        <th className="p-2.5 border border-neutral-400 w-[7%] text-center">M / B / D</th>
                        <th className="p-2.5 border border-neutral-400 w-[25%]">Verdere uitleg / bespreking op OB</th>
                        <th className="p-2.5 border border-neutral-400 w-[20%]">To do</th>
                        <th className="p-2.5 border border-neutral-400 w-[8%] text-center">Meenemen naar team?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {themes.map(theme => {
                        const themeItems = items.filter(i => i.theme === theme);
                        return (
                          <React.Fragment key={theme}>
                            <tr>
                              <td colSpan={6} className="bg-[#CC0000] text-white font-black text-center py-2 px-3 border border-red-900 uppercase tracking-wider text-xs">
                                {theme}
                              </td>
                            </tr>
                            {themeItems.map((item, idx) => (
                              <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50"}>
                                <td className="p-2.5 border border-neutral-300 align-top font-bold text-black">
                                  {item.project}
                                  <div className="text-[10px] font-normal text-neutral-500 mt-0.5">{item.date}</div>
                                </td>
                                <td className="p-2.5 border border-neutral-300 align-top text-neutral-800">
                                  {item.info}
                                </td>
                                <td className="p-2.5 border border-neutral-300 align-top text-center font-black">
                                  {item.type}
                                </td>
                                <td className="p-2.5 border border-neutral-300 align-top text-neutral-800">
                                  <div>{item.status || "-"}</div>
                                  {(item.statusUpdates || []).map(u => (
                                    <div key={u.id} className="mt-1 text-[11px] font-semibold text-neutral-900">
                                      • Update ({u.date}): {u.text}
                                    </div>
                                  ))}
                                </td>
                                <td className="p-2.5 border border-neutral-300 align-top space-y-1">
                                  {item.todos.map(t => (
                                    <div key={t.id} className={t.done ? "line-through text-neutral-400" : "text-neutral-900"}>
                                      <span className="font-bold mr-1">{t.done ? "☑" : "☐"}</span>
                                      <span className={`font-extrabold mr-1 ${
                                        t.org === "Battle Droids" ? "text-blue-700" :
                                        t.org === "Kras" ? "text-red-600" :
                                        t.org === "Habbekrats" ? "text-emerald-700" : "text-amber-700"
                                      }`}>
                                        [{t.org}{t.person && t.person !== "Geen" ? ` - ${t.person}` : ""}]
                                      </span>
                                      {t.text}
                                    </div>
                                  ))}
                                </td>
                                <td className={`p-2.5 border border-neutral-300 align-top text-center font-bold ${
                                  item.teamUpdate === "Ja" ? "bg-[#D9EAD3] text-[#274E13]" : "bg-neutral-100 text-neutral-500"
                                }`}>
                                  {item.teamUpdate}
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <FolderArchive className="w-5 h-5 text-yellow-400" /> OB Snapshot Archief
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Sla na elk Operationeel Bestuur een snapshot op zodat je altijd kunt terugkijken naar de status van vorige vergaderingen.
                  </p>
                  <button 
                    onClick={createArchiveSnapshot}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-yellow-400 border border-yellow-500/30 font-bold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    + Snapshot Opslaan van Huidig OB
                  </button>
                </div>

                <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Shield className="w-5 h-5 text-yellow-400" /> Gedeelde SCRATCH! Google Drive
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Open snel jullie gedeelde Google Drive map met alle draaiboeken, missie/visie documenten en werkgroepverslagen.
                  </p>
                  <a 
                    href="https://drive.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border border-yellow-500/30 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    Open Google Drive Map <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-neutral-300">Opgeslagen OB Snapshots ({archives.length})</h4>
                  <span className="text-[11px] text-neutral-500">Snapshots worden automatisch gesynchroniseerd en kunnen altijd worden verwijderd</span>
                </div>
                {archives.length === 0 ? (
                  <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 text-center text-xs text-neutral-500">
                    Er zijn momenteel geen snapshots opgeslagen. Klik hierboven op <strong>+ Snapshot Opslaan van Huidig OB</strong> om een momentopname te bewaren.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {archives.map(arch => (
                      <div key={arch.id} className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="font-bold text-white text-sm">{arch.title}</span>
                          <p className="text-[11px] text-neutral-500">{arch.date} • {arch.itemsCount} agendapunten</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => restoreArchiveSnapshot(arch)}
                            className="text-xs bg-neutral-800 hover:bg-yellow-400 hover:text-black text-yellow-400 px-3.5 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5"
                            title="Laad deze snapshot in het overzicht"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Openen / Herstellen
                          </button>
                          <button 
                            onClick={() => deleteArchiveSnapshot(arch.id)}
                            className="text-xs bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1"
                            title="Verwijder deze snapshot definitief uit het systeem"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Verwijderen
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
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
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
                  placeholder="Bijv. TOKJO, Team Up, Werkgroep Keuken..."
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
                  <label className="block text-xs font-bold text-neutral-400 mb-1">Link Label (optioneel)</label>
                  <input 
                    type="text"
                    placeholder="Bijv. Drive Map"
                    value={formLinkLabel}
                    onChange={(e) => setFormLinkLabel(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">Google Drive / Weblink URL</label>
                <input 
                  type="url"
                  placeholder="https://..."
                  value={formLinkUrl}
                  onChange={(e) => setFormLinkUrl(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-400"
                />
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
            <form onSubmit={addTheme} className="space-y-4">
              <input 
                type="text"
                placeholder="Themanaam..."
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-400"
              />
              <div className="flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddThemeModal(false)} 
                  className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white"
                >
                  Annuleren
                </button>
                <button 
                  type="submit" 
                  className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-5 py-2 rounded-xl text-xs"
                >
                  Thema Toevoegen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VOOR GOOGLE SITES CLOUD SYNCHRONISATIE & GEHEUGEN */}
      {showCloudSetupModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border-2 border-yellow-400/60 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Cloud className="w-6 h-6 text-yellow-400" />
                <div>
                  <h3 className="text-lg font-black text-yellow-400">
                    Waarom behoudt Google Sites zijn geheugen niet vanzelf?
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Uitleg & directe oplossing voor Published Viewers op Google Sites
                  </p>
                </div>
              </div>
              <button onClick={() => setShowCloudSetupModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-2 text-xs text-neutral-300 leading-relaxed">
              <p className="font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                Wat gebeurt er bij exporteren naar Google Sites?
              </p>
              <p>
                Hier in deze werkomgeving is de app verbonden met onze ingebouwde cloud-database. Zodra je de code kopieert naar <strong>Google Sites</strong> (via een HTML-embed blok), draait die code in een beveiligde sandbox van Google Sites zelf en mag hij niet meer met de database van deze chat praten. Daardoor ziet elke bezoeker (*Published Viewer*) telkens enkel de start-code en verdwijnen aanpassingen bij het verversen.
              </p>
            </div>

            {/* OPLOSSING 1: EIGEN DATABASE URL PLAKKEN */}
            <div className="bg-neutral-950 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Oplossing voor Google Sites: Gratis eigen Firebase Realtime Database URL koppelen (2 min)
              </h4>
              <ol className="text-xs text-neutral-300 space-y-1.5 list-decimal list-inside">
                <li>Ga naar <strong>console.firebase.google.com</strong> (met het Google-account van SCRATCH!) en klik op <em>Add project</em>.</li>
                <li>Klik links in het menu op <strong>Build &rarr; Realtime Database &rarr; Create Database</strong> (kies <em>Start in Test Mode</em>).</li>
                <li>Kopieer de URL die bovenaan staat (bijv. <code className="text-yellow-400">https://scratch-ob-default-rtdb.europe-west1.firebasedatabase.app</code>) en plak die hieronder:</li>
              </ol>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <input
                  type="url"
                  placeholder="https://jouw-project-default-rtdb.europe-west1.firebasedatabase.app"
                  value={customRestUrlInput}
                  onChange={(e) => setCustomRestUrlInput(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!customRestUrlInput.trim()) return;
                    setActiveRestUrl(customRestUrlInput.trim());
                    setShowCloudSetupModal(false);
                    showToast("Externe Cloud Database gekoppeld! Alle kijkers zitten nu op dezelfde live data.");
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-4 py-2 rounded-xl text-xs shrink-0"
                >
                  Koppel Live Database
                </button>
              </div>
              <p className="text-[11px] text-neutral-400">
                💡 <strong>Tip:</strong> Als je mij hier in de chat jouw Firebase Database URL geeft, bak ik hem rechtstreeks vast in de broncode zodat niemand op de Google Site ooit nog iets hoeft in te vullen!
              </p>
            </div>

            {/* OPLOSSING 2: SNELLE JSON BACKUP DELEN */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black text-yellow-400 uppercase">Handmatige Systeem-Backup (.json)</h4>
                <p className="text-[11px] text-neutral-400">
                  Wil je zonder database een volledige OB-sessie opslaan en later weer inladen? Gebruik dan dit systeembestand.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={exportFullBackupJson}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-3 py-2 rounded-xl text-xs border border-neutral-700"
                >
                  Download .json
                </button>
                <label className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-3 py-2 rounded-xl text-xs cursor-pointer">
                  Laad .json in
                  <input type="file" accept=".json" onChange={importFullBackupJson} className="hidden" />
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowCloudSetupModal(false)}
                className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-5 py-2 rounded-xl text-xs"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- SUBCOMPONENT: INDIVIDUELE AGENDAPUNT KAART (4 DUIDELIJK GESCHEIDEN KOLOMMEN) ---
function AgendaRow({
  index,
  item,
  persons,
  selectedOrgFilter,
  selectedPersonFilter,
  todoMatchesFilter,
  onEdit,
  onDelete,
  onAddStatusUpdate,
  onDeleteStatusUpdate,
  onUpdateBaseStatus,
  onAddTodo,
  onToggleTodo,
  onUpdateTodoOrg,
  onUpdateTodoPerson,
  onDeleteTodo,
  onAddLink,
  onRemoveLink,
  onToggleTeamUpdate
}) {
  const [statusUpdateInput, setStatusUpdateInput] = useState("");
  const [isEditingBaseStatus, setIsEditingBaseStatus] = useState(false);
  const [baseStatusDraft, setBaseStatusDraft] = useState(item.status);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const typeBadgeStyle = item.type === 'D' 
    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
    : item.type === 'B' 
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
  const typeLabel = item.type === 'D' ? 'Dialoog' : item.type === 'B' ? 'Beslissen' : 'Mededelen';

  const leftBorderAccent = item.type === 'D'
    ? 'border-l-purple-500'
    : item.type === 'B'
    ? 'border-l-amber-400'
    : 'border-l-yellow-400';

  const cardBg = index % 2 === 1 ? 'bg-neutral-900' : 'bg-neutral-900/65';

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    if (!statusUpdateInput.trim()) return;
    onAddStatusUpdate(statusUpdateInput);
    setStatusUpdateInput("");
  };

  const handleSaveBaseStatus = () => {
    onUpdateBaseStatus(baseStatusDraft);
    setIsEditingBaseStatus(false);
  };

  const handleAddLinkSubmit = (e) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    onAddLink(linkLabel, linkUrl);
    setLinkLabel("");
    setLinkUrl("");
    setShowLinkInput(false);
  };

  // Filter de getoonde to-do's indien er een organisatie- of persoonsfilter actief is
  const displayedTodos = (selectedOrgFilter === "ALL" && selectedPersonFilter === "ALL")
    ? item.todos
    : item.todos.filter(todoMatchesFilter);

  const hiddenTodosCount = item.todos.length - displayedTodos.length;

  return (
    <div className={`${cardBg} border-2 border-neutral-700/80 border-l-4 ${leftBorderAccent} rounded-2xl shadow-xl p-5 hover:border-yellow-500/60 transition-all grid grid-cols-1 lg:grid-cols-12 gap-6 items-start`}>
      
      {/* KOLOM 1 (span-3): Project / Onderwerp, 1-zin info, Type badge, datum, links */}
      <div className="lg:col-span-3 space-y-3 lg:border-r lg:border-neutral-800 lg:pr-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <span className="bg-yellow-400 text-black font-black text-xs px-2 py-0.5 rounded-lg shrink-0 mt-0.5 shadow">
              #{index}
            </span>
            <h3 className="font-black text-white text-base leading-snug">
              {item.project}
            </h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button 
              onClick={onEdit}
              className="p-1.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-yellow-400 rounded-lg border border-neutral-800 transition-colors"
              title="Bewerk onderwerp"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={onDelete}
              className="p-1.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 rounded-lg border border-neutral-800 transition-colors"
              title="Verwijder onderwerp"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-xs text-neutral-200 leading-relaxed bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/90">
          {item.info}
        </p>

        {/* Badges: Type, Datum, Links */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border ${typeBadgeStyle}`}>
            {item.type} = {typeLabel}
          </span>
          <span className="text-[10px] font-bold bg-neutral-950 text-neutral-300 px-2.5 py-1 rounded-md border border-neutral-800">
            📅 {item.date}
          </span>

          {(item.links || []).map((lnk, idx) => (
            <span key={idx} className="inline-flex items-center bg-yellow-400/10 text-yellow-400 border border-yellow-500/30 rounded-md text-[10px] font-bold overflow-hidden">
              <a 
                href={lnk.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-2 py-1 hover:bg-yellow-400/20 flex items-center gap-1"
              >
                <ExternalLink className="w-2.5 h-2.5" /> {lnk.label}
              </a>
              <button 
                onClick={() => onRemoveLink(idx)}
                className="px-1.5 py-1 hover:bg-red-500/30 hover:text-red-300 border-l border-yellow-500/20"
                title="Verwijder link"
              >
                ×
              </button>
            </span>
          ))}

          <button
            onClick={() => setShowLinkInput(!showLinkInput)}
            className="text-[10px] font-bold bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-yellow-400 px-2.5 py-1 rounded-md border border-neutral-800 flex items-center gap-1 transition-colors"
          >
            <LinkIcon className="w-2.5 h-2.5" /> + Link
          </button>
        </div>

        {showLinkInput && (
          <form onSubmit={handleAddLinkSubmit} className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 space-y-2 mt-2">
            <input 
              type="text"
              placeholder="Naam (bijv. Drive Map)"
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-yellow-400"
            />
            <div className="flex gap-1.5">
              <input 
                type="text"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-yellow-400"
              />
              <button type="submit" className="bg-yellow-400 text-black font-black px-2.5 py-1 rounded-lg text-xs">
                OK
              </button>
            </div>
          </form>
        )}
      </div>

      {/* KOLOM 2 (span-4): Status per punt weergegeven + vakje eronder voor een status-update */}
      <div className="lg:col-span-4 space-y-2.5 lg:border-r lg:border-neutral-800 lg:pr-5">
        {/* Weergave van de huidige status */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-2 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Huidige Status & Bespreking
            </span>
            <button 
              onClick={() => {
                setBaseStatusDraft(item.status);
                setIsEditingBaseStatus(!isEditingBaseStatus);
              }}
              className="text-[10px] text-neutral-400 hover:text-yellow-400 font-bold underline"
            >
              {isEditingBaseStatus ? "Annuleren" : "Wijzig tekst"}
            </button>
          </div>

          {isEditingBaseStatus ? (
            <div className="space-y-2">
              <textarea
                rows={3}
                value={baseStatusDraft}
                onChange={(e) => setBaseStatusDraft(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-yellow-400"
              />
              <button
                onClick={handleSaveBaseStatus}
                className="bg-yellow-400 text-black font-black px-3 py-1 rounded-lg text-xs"
              >
                Status Opslaan
              </button>
            </div>
          ) : (
            <p className="text-xs text-neutral-100 leading-relaxed whitespace-pre-line">
              {item.status || <span className="italic text-neutral-500">Nog geen basisstatus ingevuld.</span>}
            </p>
          )}

          {/* Lijst van toegevoegde status-updates */}
          {(item.statusUpdates || []).length > 0 && (
            <div className="pt-2 border-t border-neutral-800 space-y-1.5">
              {item.statusUpdates.map(upd => (
                <div key={upd.id} className="bg-neutral-900 border-l-2 border-yellow-400 pl-2.5 pr-2 py-1.5 rounded-r-lg flex items-start justify-between gap-2 group/upd">
                  <div className="text-xs text-neutral-200">
                    <span className="font-black text-yellow-400 mr-1.5">[{upd.date}]</span>
                    {upd.text}
                  </div>
                  <button
                    onClick={() => onDeleteStatusUpdate(upd.id)}
                    className="text-neutral-500 hover:text-red-400 opacity-0 group-hover/upd:opacity-100 transition-opacity"
                    title="Verwijder update"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vakje eronder om de status een nieuwe update te geven */}
        <form onSubmit={handleStatusSubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Geef de status een update..."
            value={statusUpdateInput}
            onChange={(e) => setStatusUpdateInput(e.target.value)}
            className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-yellow-400"
          />
          <button
            type="submit"
            className="bg-neutral-800 hover:bg-yellow-400 hover:text-black text-yellow-400 border border-yellow-500/40 font-black px-3.5 py-2 rounded-xl text-xs transition-all shrink-0 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" /> Update
          </button>
        </form>
      </div>

      {/* KOLOM 3 (span-4): To-do's met gekleurde Organisatie + los gekoppeld Teamlid */}
      <div className="lg:col-span-4 space-y-2.5 lg:border-r lg:border-neutral-800 lg:pr-5">
        <div className="space-y-2">
          {displayedTodos.length === 0 ? (
            <div className="text-xs text-neutral-500 italic bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5">
              {item.todos.length === 0 
                ? "Nog geen actiepunten voor dit onderwerp." 
                : "Geen actiepunten voor de geselecteerde filter."}
            </div>
          ) : (
            displayedTodos.map(todo => {
              const orgStyle = ORG_CONFIG[todo.org] || ORG_CONFIG["Allemaal"];
              return (
                <div 
                  key={todo.id} 
                  className={`p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                    todo.done 
                      ? 'bg-neutral-950/40 border-neutral-800 opacity-60' 
                      : 'bg-neutral-950 border-neutral-700/80 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button 
                      onClick={() => onToggleTodo(todo.id)} 
                      className="flex items-start gap-2.5 text-left flex-1"
                    >
                      {todo.done ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-xs leading-snug ${todo.done ? 'line-through text-neutral-500' : 'text-white font-semibold'}`}>
                        {todo.text}
                      </span>
                    </button>

                    <button 
                      onClick={() => onDeleteTodo(todo.id)} 
                      className="text-neutral-500 hover:text-red-400 p-0.5 shrink-0"
                      title="Verwijder to-do"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Organisatie (Met kleurcode) + Teamlid (Los van organisatie) */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pl-6">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Organisatie Keuze met kleurcode */}
                      <select
                        value={todo.org || "Allemaal"}
                        onChange={(e) => onUpdateTodoOrg(todo.id, e.target.value)}
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border cursor-pointer focus:outline-none ${orgStyle.solid}`}
                        title="Wijzig gekoppelde organisatie"
                      >
                        {ORGANIZATIONS.map(o => (
                          <option key={o} value={o} className="bg-neutral-900 text-white font-bold">
                            Org: {o}
                          </option>
                        ))}
                      </select>

                      {/* Los gekoppeld Teamlid */}
                      <select
                        value={todo.person || "Geen"}
                        onChange={(e) => onUpdateTodoPerson(todo.id, e.target.value)}
                        className="text-[10px] font-bold bg-neutral-900 text-neutral-200 border border-neutral-700 hover:border-yellow-400 px-2.5 py-0.5 rounded-md cursor-pointer focus:outline-none"
                        title="Wijzig gekoppeld teamlid"
                      >
                        <option value="Geen" className="bg-neutral-900">👤 Geen specifiek lid</option>
                        {persons.map(p => (
                          <option key={p} value={p} className="bg-neutral-900">
                            👤 {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {hiddenTodosCount > 0 && (
            <div className="text-[11px] text-neutral-400 pl-1">
              + {hiddenTodosCount} andere to-do{hiddenTodosCount === 1 ? '' : "'s"} (verborgen door actieve filter)
            </div>
          )}
        </div>

        {/* Nieuwe To-Do Toevoegen Formulier (met Organisatie én Teamlid selectie) */}
        <ToDoCreator 
          persons={persons} 
          defaultOrg={selectedOrgFilter !== "ALL" ? selectedOrgFilter : "Battle Droids"}
          onAdd={onAddTodo} 
        />
      </div>

      {/* KOLOM 4 (span-1): Meenemen naar Team-Update */}
      <div className="lg:col-span-1 flex lg:flex-col items-center justify-center h-full">
        <button 
          onClick={onToggleTeamUpdate}
          className={`w-full py-3 px-2 rounded-xl text-xs font-black transition-all border-2 flex flex-col items-center gap-1 ${
            item.teamUpdate === 'Ja' 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-lg' 
              : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
          }`}
          title="Klik om te wisselen tussen Ja (Meenemen naar Team-Update) en Intern"
        >
          <span className="text-[9px] tracking-wider uppercase opacity-80">Team-Update</span>
          <span className="text-sm font-black">{item.teamUpdate}</span>
        </button>
      </div>

    </div>
  );
}

// --- SUBCOMPONENT: NIEUWE TO-DO TOEVOEGEN MET ORGANISATIE (KLEUR) & TEAMLID ---
function ToDoCreator({ persons, defaultOrg, onAdd }) {
  const [text, setText] = useState("");
  const [org, setOrg] = useState(defaultOrg || "Battle Droids");
  const [person, setPerson] = useState(persons[0] || "Camine");

  useEffect(() => {
    if (defaultOrg && ORGANIZATIONS.includes(defaultOrg)) {
      setOrg(defaultOrg);
    }
  }, [defaultOrg]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text, org, person);
    setText("");
  };

  const activeOrgStyle = ORG_CONFIG[org] || ORG_CONFIG["Allemaal"];

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-950/90 border border-neutral-800 rounded-xl p-2.5 space-y-2">
      <div className="flex items-center gap-1.5">
        <input 
          type="text"
          placeholder="Nieuw actiepunt toevoegen..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-yellow-400"
        />
        <button 
          type="submit"
          className="bg-yellow-400 hover:bg-yellow-300 text-black px-2.5 py-1.5 rounded-lg font-black text-xs shrink-0 flex items-center gap-1"
          title="To-do toevoegen"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>

      {/* Koppeling aan Organisatie (met kleur) + los gekoppeld Teamlid */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex flex-wrap items-center gap-1">
          {ORGANIZATIONS.map(oKey => {
            const cfg = ORG_CONFIG[oKey];
            const selected = org === oKey;
            return (
              <button
                key={oKey}
                type="button"
                onClick={() => setOrg(oKey)}
                className={`text-[10px] font-black px-2 py-0.5 rounded border transition-all ${
                  selected ? cfg.solid : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                {cfg.short}
              </button>
            );
          })}
        </div>

        <select
          value={person}
          onChange={(e) => setPerson(e.target.value)}
          className="bg-neutral-900 text-neutral-200 border border-neutral-800 rounded px-2 py-0.5 text-[10px] font-bold focus:outline-none focus:border-yellow-400"
          title="Koppel een teamlid (los van organisatie)"
        >
          <option value="Geen">👤 Geen lid</option>
          {persons.map(p => (
            <option key={p} value={p}>👤 {p}</option>
          ))}
        </select>
      </div>
    </form>
  );
}