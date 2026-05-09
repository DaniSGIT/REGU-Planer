(function () {
  const STORAGE_KEY = "regu_personal_data_v6";

  const APP_VERSION = "2.4";

  const SUPABASE_URL = "https://feqnxhlhycjqabwrpiqz.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_Fh1zTNMMeOGe5TBqgoAQ9Q_QJdw8qSu";
  const SUPABASE_TABLE = "bueroplan";
  const SUPABASE_ROW_ID = 1;
  const PRICE_LIST_BUCKET = "price-lists";
  const LOCAL_FILES_DB = "regu_local_files";
  const LOCAL_FILES_DB_VERSION = 1;
  const PRICE_LIST_PDF_STORE = "priceListPdfs";

  const DEFAULT_MATERIAL_ALIASES = [
  { name: "Cu Draht MILBERRY", words: ["cu", "draht", "milberry"] },
  { name: "Cu Draht MILBERRY", words: ["milberry"] },

  { name: "Cu-PVC-Kabel, sauber", words: ["cu", "pvc", "kabel", "sauber"] },
  { name: "Cu-PVC-Kabel, sauber", words: ["pvc", "kabel", "sauber"] },

  { name: "Cu Berry Kabel mind. 60 %", words: ["berry", "kabel", "60"] },
  { name: "Cu Berry Kabel mind. 40 %", words: ["berry", "kabel", "40"] },

  { name: "Cu Lackdraht, sauber", words: ["lackdraht", "sauber"] },
  { name: "Cu Rohr blank", words: ["cu", "rohr", "blank"] },
  { name: "Cu Schrott schwer", words: ["cu", "schrott", "schwer"] },
  { name: "Cu Schrott leicht", words: ["cu", "schrott", "leicht"] },

  { name: "MS-58 Schrott", words: ["ms", "58"] },
  { name: "Messing schwer", words: ["messing", "schwer"] },
  { name: "Messing Späne", words: ["messing", "späne"] },

  { name: "Rotguss", words: ["rotguss"] },
  { name: "Rotguss", words: ["rotguß"] },

  { name: "Altblei", words: ["altblei"] },
  { name: "Zink", words: ["zink"] },
  { name: "Zinn", words: ["zinn"] },

  { name: "V2A Schrott", words: ["v2a"] },
  { name: "V4A Schrott", words: ["v4a"] },

  { name: "Hartmetallreste ohne Lot", words: ["hartmetall", "ohne", "lot"] },
  { name: "Hartmetallreste mit Lot", words: ["hartmetall", "mit", "lot"] }
];

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const today = new Date();

  const defaultData = {
    settings: {
      periodAnchor: { year: today.getFullYear(), month: today.getMonth() + 1 },
      officeCounterAnchorDate: dateKey(today),
      dashboardAnchor: { year: today.getFullYear(), month: today.getMonth() + 1 },
      statsAnchor: { year: today.getFullYear(), month: today.getMonth() + 1 },
      vacationPlanYear: today.getFullYear(),
      vacationPlanBossId: "",
      attendanceDay: dateKey(today),
      focusedEmployeeId: "",
      newPricesUntil: "",
      newPricesDate: "",
      newPricesActive: false,
      newPricesConfirmedOfficeSignature: "",
      sundaysEditable: false,
      holidaysEditable: false,
      officeSecondPersonEnabled: false,
      officeSpecialModeEnabled: false,
      hoursBillingDonePeriods: {},
      vacationCarryoverLastProcessedYear: today.getFullYear(),
      events: [],
      wasteCalendar: {
        url: "",
        entries: [],
        lastUpdate: ""
      },
      vehicles: [],
      vehicleTab: "pkw",
      externalBirthdays: [],
      specialOfficeDays: {},
      dashboardYear: today.getFullYear(),
      trashIcalUrl: "",
      trashIcalLastLoaded: ""
    },
    employees: [
      { id: uid(), name: "Yesim Kröll", department: "Buero", phone: "", entryDate: "", birthday: "", active: true, notes: "", vacationAllowance: 24, vacationCarryoverByYear: {} },
      { id: uid(), name: "Daniela Leins", department: "Buero", phone: "", entryDate: "", birthday: "", active: true, notes: "", vacationAllowance: 30, vacationCarryoverByYear: {} },
      { id: uid(), name: "Christian Hansen", department: "Lager", phone: "", entryDate: "", birthday: "", active: true, notes: "", vacationAllowance: 30, vacationCarryoverByYear: {} },
      { id: uid(), name: "Nico Kastelberger", department: "Lager", phone: "", entryDate: "", birthday: "", active: true, notes: "", vacationAllowance: 30, vacationCarryoverByYear: {} },
      { id: uid(), name: "Andreas Rudolph", department: "Lager", phone: "", entryDate: "", birthday: "", active: true, notes: "", vacationAllowance: 30, vacationCarryoverByYear: {} },
      { id: uid(), name: "Timon Guttenberger", department: "Lager", phone: "", entryDate: "", birthday: "", active: true, notes: "", vacationAllowance: 30, vacationCarryoverByYear: {} }
    ],
    attendance: {},
    managementAttendance: {},
    officePlan: {},
    events: [],
    wasteCalendar: {
      url: "",
      entries: [],
      lastUpdate: ""
    },
    priceList: {
      company: "",
      date: "",
      pdfName: "",
      pdfData: "",
      pdfPath: "",
      entries: []
    },
    vehicles: [],
    externalBirthdays: [],
    managementAttendance: {},
    specialOfficeDays: {},
    notes: [],
    trashEvents: [],
    priceLists: [],
    materialAliases: [],
    containers: []
  };

  let state = loadState();
  let selectedContainerNumber = "";
  let containerVisibleRows = [];
  let employeeAdminSearchTerm = "";
  let priceListSearchTerm = "";
  let employeeAdminPointerDrag = null;
  let toastCounter = 0;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    checkForUpdate();

    ensureVacationCarryoversUpToDate();
    bindTabs();
    bindTop();
    bindGlobalUi();
    bindOffice();
    bindContainers();
    bindAttendance();
    bindVacationPlanner();
    bindStats();
    bindDashboard();
    bindExports();
    bindPriceList();
    bindSettings();
    renderAll();
    showNotesStartupPopup();
    bindWasteCalendar();

    await loadOfficePlanFromSupabase();

    renderAll();
    showNotesStartupPopup();
  }

  
  function bindTabs() {
    $$(".tab").forEach((tab) =>
      tab.addEventListener("click", () => activateTab(tab.dataset.tab))
    );
  }

  function activateTab(tabId) {
    $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === tabId));
    $$(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === tabId));
    hideSearchResults();
  }

  function bindTop() {
    $("#backupExportBtn")?.addEventListener("click", exportBackup);
    $("#backupImportInput")?.addEventListener("change", importBackup);
  }

  function checkForUpdate() {
    const savedVersion = localStorage.getItem("regu_app_version");

    if (savedVersion && savedVersion !== APP_VERSION) {
      showUpdateModal(savedVersion, APP_VERSION);
      return;
    }

    localStorage.setItem("regu_app_version", APP_VERSION);
  }

  function showUpdateModal(previousVersion, nextVersion) {
    const modal = $("#updateModal");
    const textEl = $("#updateModalText");
    const versionEl = $("#updateModalVersion");
    const confirmBtn = $("#updateModalConfirm");
    const cancelBtn = $("#updateModalCancel");
    if (!modal || !textEl || !versionEl || !confirmBtn || !cancelBtn) return;

    textEl.textContent = `Eine neue Version ist verfügbar. Vor dem Aktualisieren wird automatisch ein Backup heruntergeladen. ${previousVersion ? `Aktuell gespeichert: Version ${previousVersion}.` : ""}`.trim();
    versionEl.textContent = nextVersion;
    modal.classList.remove("hidden");

    const cleanup = () => {
      modal.classList.add("hidden");
      confirmBtn.onclick = null;
      cancelBtn.onclick = null;
    };

    cancelBtn.onclick = () => {
      localStorage.setItem("regu_app_version", APP_VERSION);
      cleanup();
    };

    confirmBtn.onclick = () => {
      exportBackup();
      setTimeout(() => {
        localStorage.setItem("regu_app_version", APP_VERSION);
        window.location.reload();
      }, 1000);
    };
  }

  function bindGlobalUi() {
    $("#globalSearchInput")?.addEventListener("input", renderGlobalSearchResults);
    $("#globalSearchInput")?.addEventListener("focus", renderGlobalSearchResults);
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".topbar-search-wrap")) hideSearchResults();
    });

    $("#quickActionBtn")?.addEventListener("click", () => {
      openDetailDrawer(`
        <div class="drawer-section">
          <div class="drawer-eyebrow">Schnellaktionen</div>
          <h3>Direkt zu den wichtigsten Aufgaben</h3>
          <div class="drawer-action-grid">
            <button class="ghost" data-quick-tab="buero">Büroplan öffnen</button>
            <button class="ghost" data-quick-tab="anwesenheit">Tageserfassung</button>
            <button class="ghost" data-quick-tab="fahrzeuge">Fahrzeuge</button>
            <button class="ghost" data-quick-tab="notizen">Notizen</button>
          </div>
        </div>
      `);

      $$("#detailDrawer [data-quick-tab]").forEach((button) =>
        button.addEventListener("click", () => {
          activateTab(button.dataset.quickTab || "dashboard");
          closeDetailDrawer();
        })
      );
    });

    $$("[data-action='close-drawer']").forEach((el) =>
      el.addEventListener("click", closeDetailDrawer)
    );
  }

  function bindOffice() {
    $("#prevPeriodBtn")?.addEventListener("click", () => shiftPeriod(-1));
    $("#nextPeriodBtn")?.addEventListener("click", () => shiftPeriod(1));
    $("#prevHoursBillingMonthBtn")?.addEventListener("click", () => shiftPeriod(-1));
    $("#nextHoursBillingMonthBtn")?.addEventListener("click", () => shiftPeriod(1));
    $("#hoursBillingDoneCheckbox")?.addEventListener("change", onHoursBillingDoneChange);
    // "Aktueller Monat"-Button: setzt periodAnchor auf heute,
    // damit die Counter automatisch den aktuellen Abrechnungszeitraum anzeigen
    $("#todayMonthBtn")?.addEventListener("click", () => {
      const now = new Date();
      state.settings.periodAnchor = {
        year: now.getFullYear(),
        month: now.getMonth() + 1
      };
      state.settings.officeCounterAnchorDate = dateKey(now);
      saveState();
      renderOfficeOnly();
    });
    $("#todayHoursBillingBtn")?.addEventListener("click", () => {
      const now = new Date();
      const currentBilling = getPayrollPeriodForDate(now);
      state.settings.periodAnchor = {
        year: currentBilling.end.getFullYear(),
        month: currentBilling.end.getMonth() + 1
      };
      state.settings.officeCounterAnchorDate = dateKey(now);
      saveState();
      renderOfficeOnly();
    });
  }

  function bindDashboard() {
    $("#dashboardYearSelect")?.addEventListener("change", (e) => {
      state.settings.dashboardYear = Number(e.target.value);
      saveState();
      renderDashboard();
    });
  }

  function bindStats() {
    $("#prevStatsMonthBtn")?.addEventListener("click", () => shiftStatsMonth(-1));
    $("#nextStatsMonthBtn")?.addEventListener("click", () => shiftStatsMonth(1));

    $("#yearSelect")?.addEventListener("change", () => {
      renderYearlyStats();
    });
  }

  function bindVacationPlanner() {
    $("#vacationPlanYearSelect")?.addEventListener("change", (e) => {
      state.settings.vacationPlanYear = Number(e.target.value);
      saveState();
      renderVacationPlanner();
    });

    $("#vacationPlanBossSelect")?.addEventListener("change", (e) => {
      state.settings.vacationPlanBossId = e.target.value || "";
      saveState();
      renderVacationPlanner();
    });

    $("#todayVacationPlanBtn")?.addEventListener("click", () => {
      state.settings.vacationPlanYear = new Date().getFullYear();
      saveState();
      renderVacationPlanYearSelect();
      renderVacationPlanner();
    });
  }

  function bindAttendance() {
    const legacyPrevMonthBtn = $("#prevAttendanceMonthBtn");
    const legacyNextMonthBtn = $("#nextAttendanceMonthBtn");
    if (legacyPrevMonthBtn) legacyPrevMonthBtn.style.display = "none";
    if (legacyNextMonthBtn) legacyNextMonthBtn.style.display = "none";

    const prevBtn = $("#prevAttendanceDayBtn");
    const nextBtn = $("#nextAttendanceDayBtn");

    if (prevBtn) {
      prevBtn.textContent = "◀";
      prevBtn.addEventListener("click", () => shiftAttendanceMonth(-1));
    }

    if (nextBtn) {
      nextBtn.textContent = "▶";
      nextBtn.addEventListener("click", () => shiftAttendanceMonth(1));
    }

    $("#todayAttendanceBtn")?.addEventListener("click", () => {
      state.settings.attendanceDay = dateKey(new Date());
      saveState();
      renderAttendanceMonthTitle();
      renderDailyAttendance();
    });

    $("#setBulkRangeBtn")?.addEventListener("click", applyBulkStatusRange);
    $("#removeBulkRangeBtn")?.addEventListener("click", removeBulkStatusRange);
  }

  function bindExports() {
    $("#exportOfficePlanBtn")?.addEventListener("click", exportOfficePlanCsv);
    $("#exportAttendanceBtn")?.addEventListener("click", exportAttendanceCsv);
    $("#exportMonthlyStatsBtn")?.addEventListener("click", exportMonthlyStatsCsv);
    $("#exportYearlyStatsBtn")?.addEventListener("click", exportYearlyStatsCsv);
    $("#exportYesimIcsBtn")?.addEventListener("click", () => exportPersonIcs("Yesim Kröll"));
    $("#exportDanielaIcsBtn")?.addEventListener("click", () => exportPersonIcs("Daniela Leins"));
    $("#exportVehiclesCsvBtn")?.addEventListener("click", exportVehiclesCsv);
  }

  function bindSettings() {
    const addExternalBirthdayBtn = $("#addExternalBirthdayBtn");
    if (addExternalBirthdayBtn) addExternalBirthdayBtn.textContent = "Hinzufügen";

    $("#sundaysEditableToggle")?.addEventListener("change", (e) => {
      state.settings.sundaysEditable = e.target.checked;
      saveState();
      saveOfficePlanToSupabase();
      renderOfficeGrid();
    });

    $("#holidaysEditableToggle")?.addEventListener("change", (e) => {
      state.settings.holidaysEditable = e.target.checked;
      saveState();
      saveOfficePlanToSupabase();
      renderOfficeGrid();
    });

    $("#officeSecondPersonToggle")?.addEventListener("change", (e) => {
      state.settings.officeSecondPersonEnabled = e.target.checked;
      saveState();
      saveOfficePlanToSupabase();
      renderOfficeGrid();
    });

    $("#officeSpecialModeToggle")?.addEventListener("change", (e) => {
      state.settings.officeSpecialModeEnabled = e.target.checked;
      saveState();
      saveOfficePlanToSupabase();
      renderOfficeGrid();
    });

    $("#trashIcalUrl")?.addEventListener("change", (e) => {
      state.settings.trashIcalUrl = e.target.value.trim();
      saveState();
    });

    $("#loadTrashIcalBtn")?.addEventListener("click", () => {
      const url = ($("#trashIcalUrl")?.value || "").trim();
      if (!url) return;
      state.settings.trashIcalUrl = url;
      saveState();
      fetchTrashIcal(url);
    });

    $("#addEmployeeBtn")?.addEventListener("click", addEmployee);
    $("#addEventBtn")?.addEventListener("click", addEvent);
    $("#addVehicleBtn")?.addEventListener("click", addVehicle);
    $("#addExternalBirthdayBtn")?.addEventListener("click", addExternalBirthday);
    $("#addNoteBtn")?.addEventListener("click", addNote);
    $("#employeeSearchInput")?.addEventListener("input", (e) => {
      employeeAdminSearchTerm = e.target.value || "";
      renderEmployeesAdmin();
    });
  }

  function bindPriceList() {
  $("#priceListCompanyInput")?.addEventListener("input", (event) => {
    ensurePriceListDraft();
    state.priceList.company = event.target.value || "";
    saveState();
  });

  $("#priceListDateInput")?.addEventListener("input", (event) => {
    ensurePriceListDraft();
    state.priceList.date = event.target.value || "";
    saveState();
  });

  $("#priceListSearchInput")?.addEventListener("input", (event) => {
    priceListSearchTerm = (event.target.value || "").trim();
    renderPriceListSearch();
  });

  $("#priceListExcelInput")?.addEventListener("change", importPriceListExcel);
$("#priceListPdfInput")?.addEventListener("change", importPriceListPdfLocal);
$("#priceListAddEntryBtn")?.addEventListener("click", addPriceListDraftEntry);
$("#priceListSaveBtn")?.addEventListener("click", savePriceListDraft);
$("#priceListResetBtn")?.addEventListener("click", resetPriceListDraft);
}

  function bindWasteCalendar() {
    const input = document.getElementById("wasteIcalFileInput");
    const info = document.getElementById("wasteLastUpdate");

    if (!input) return;

    input.onchange = importWasteCalendarFile;

    if (state.wasteCalendar?.lastUpdate && info) {
    info.textContent =
      "Zuletzt geladen: " + formatDate(new Date(state.wasteCalendar.lastUpdate));
    }
  }

  function renderAll() {
    renderPeriodInfo();
    renderAttendanceMonthTitle();
    renderStatsMonthTitle();
    renderDashboardYearSelect();
    renderVacationPlanYearSelect();
    renderVacationPlanBossSelect();
    renderDashboard();
    renderHeaderStatusCards();
    renderDashboardCommandCards();
    renderOfficeGrid();
    renderHoursBilling();
    renderHoursBillingTabStatus();
    renderDailyAttendance();
    renderVacationPlanner();
    renderEmployeesAdmin();
    renderEventsAdmin();
    renderVehiclesAdmin();
    renderExternalBirthdays();
    renderPriceList();
    renderYearSelect();
    renderMonthlyStats();
    renderYearlyStats();
    renderSettingsToggles();
    populateBulkEmployeeDropdown();
    renderNotesAdmin();
    renderContainers();
  }

  function renderPriceList() {
  ensurePriceListDraft();

  const companyInput = $("#priceListCompanyInput");
const dateInput = $("#priceListDateInput");
const excelName = $("#priceListExcelName");
const pdfName = $("#priceListPdfName");
const searchInput = $("#priceListSearchInput");

if (companyInput) companyInput.value = state.priceList.company || "";
if (dateInput) dateInput.value = state.priceList.date || "";
if (excelName) excelName.textContent = state.priceList.excelName || "Keine Excel hinterlegt";
if (pdfName) pdfName.textContent = state.priceList.pdfName || "Keine PDF hinterlegt";
  if (searchInput && searchInput.value !== priceListSearchTerm) {
    searchInput.value = priceListSearchTerm;
  }

  renderPriceListDraftEntries();
  renderPriceListsList();
  renderPriceListSearch();
}

  function renderPriceListSearch() {
  const result = $("#priceListSearchResult");
  if (!result) return;

  ensurePriceListDraft();

  const query = priceListSearchTerm.trim().toLocaleLowerCase("de");

  result.classList.remove("match", "empty");

  if (!query) {
    result.textContent = "Noch kein Material gesucht.";
    result.classList.add("empty");
    return;
  }

  const matches = [];

  (state.priceLists || []).forEach((list) => {
    (list.entries || []).forEach((entry) => {
      const material = String(entry.material || "").toLocaleLowerCase("de");
      if (!material.includes(query)) return;

      matches.push({
        list,
        entry
      });
    });
  });

  if (!matches.length) {
    result.textContent = "Kein passendes Material gefunden.";
    result.classList.add("empty");
    return;
  }

  result.classList.add("match");
  result.innerHTML = matches
    .sort((a, b) => Number(b.entry.priceKg || 0) - Number(a.entry.priceKg || 0))
    .map(({ list, entry }) => `
      <div class="price-search-hit">
        <div>
          <strong>${escapeHtml(entry.material || "")}</strong>
          <small>${escapeHtml(list.company || "")} · ${list.date ? formatDate(parseDateKey(list.date)) : "Ohne Datum"}</small>
          ${entry.note ? `<small>${escapeHtml(entry.note)}</small>` : ""}
        </div>
        <div class="price-search-values">
          <strong>${formatEuroPerKg(entry.priceKg)}</strong>
          <small>${formatEuroPerTon(entry.priceTo)}</small>
        </div>
      </div>
    `)
    .join("");
}

function ensurePriceListDraft() {
  if (!state.priceList || typeof state.priceList !== "object") {
    state.priceList = {};
  }

  if (!Array.isArray(state.priceLists)) {
    state.priceLists = [];
  }
  if (!Array.isArray(state.materialAliases)) {
    state.materialAliases = [];
  }

  state.priceList.company = state.priceList.company || "";
state.priceList.date = state.priceList.date || "";
state.priceList.excelName = state.priceList.excelName || "";
state.priceList.pdfName = state.priceList.pdfName || "";
state.priceList.pdfStorageId = state.priceList.pdfStorageId || "";

// Altlasten bleiben leer, damit neue PDFs nicht mehr in localStorage/Supabase landen
state.priceList.pdfPath = state.priceList.pdfPath || "";
state.priceList.pdfData = state.priceList.pdfData || "";

  if (!Array.isArray(state.priceList.entries)) {
    state.priceList.entries = [];
  }
}

function renderPriceListDraftEntries() {
  const target = $("#priceListDraftEntries");
  if (!target) return;

  ensurePriceListDraft();

  if (!state.priceList.entries.length) {
    target.innerHTML = `<div class="price-list-empty">Noch keine Materialposition eingetragen.</div>`;
    return;
  }

  target.innerHTML = state.priceList.entries
    .map((entry) => `
      <div class="price-entry-row editable-price-entry" data-entry-id="${escapeHtmlAttr(entry.id)}">
        <label>
          <span>Material</span>
          <input
            type="text"
            value="${escapeHtmlAttr(entry.material || "")}"
            data-price-entry-field="material"
            data-entry-id="${escapeHtmlAttr(entry.id)}">
        </label>

        <label>
          <span>Preis €/to</span>
          <input
            type="number"
            step="0.01"
            value="${Number(entry.priceTo || 0)}"
            data-price-entry-field="priceTo"
            data-entry-id="${escapeHtmlAttr(entry.id)}">
        </label>

        <label>
          <span>Notiz</span>
          <input
            type="text"
            value="${escapeHtmlAttr(entry.note || "")}"
            data-price-entry-field="note"
            data-entry-id="${escapeHtmlAttr(entry.id)}">
        </label>

        <div class="editable-price-entry-meta">
          <strong>${formatEuroPerKg(entry.priceKg)}</strong>
          <small>automatisch aus €/to</small>
        </div>

        <button class="ghost" type="button" data-delete-draft-entry="${escapeHtmlAttr(entry.id)}">Entfernen</button>
      </div>
    `)
    .join("");

  target.querySelectorAll("[data-price-entry-field]").forEach((input) =>
    input.addEventListener("input", onPriceDraftEntryInput)
  );

  target.querySelectorAll("[data-price-entry-field='material']").forEach((input) =>
    input.addEventListener("blur", onPriceDraftEntryMaterialBlur)
  );

  target.querySelectorAll("[data-delete-draft-entry]").forEach((button) =>
    button.addEventListener("click", () => {
      const id = button.dataset.deleteDraftEntry;
      state.priceList.entries = state.priceList.entries.filter((entry) => entry.id !== id);
      saveState();
      renderPriceListDraftEntries();
      renderPriceListSearch();
    })
  );
}

function onPriceDraftEntryInput(event) {
  const id = event.target.dataset.entryId;
  const field = event.target.dataset.priceEntryField;
  const entry = state.priceList.entries.find((item) => item.id === id);

  if (!entry || !field) return;

  if (field === "material") {
    entry.material = event.target.value;
  }

  if (field === "note") {
    entry.note = event.target.value;
  }

  if (field === "priceTo") {
    const priceTo = parseNumberGerman(event.target.value);
    entry.priceTo = priceTo;
    entry.priceKg = priceTo / 1000;
  }

  saveState();

  if (field === "priceTo") {
    renderPriceListDraftEntries();
  }
}

function onPriceDraftEntryMaterialBlur(event) {
  const id = event.target.dataset.entryId;
  const entry = state.priceList.entries.find((item) => item.id === id);

  if (!entry) return;

  const originalName = entry.rawMaterial || entry.detectedMaterial || "";
  const correctedName = String(entry.material || "").trim();

  if (!originalName || !correctedName) return;

  if (normalizeMaterialText(originalName) !== normalizeMaterialText(correctedName)) {
    learnMaterialAliasFromCorrection(originalName, correctedName);
    entry.detectedMaterial = correctedName;
    saveState();
  }
}

function addPriceListDraftEntry() {
  ensurePriceListDraft();

  const materialInput = $("#priceListMaterialInput");
  const priceInput = $("#priceListPriceToInput");
  const noteInput = $("#priceListNoteInput");

  const material = (materialInput?.value || "").trim();
  const priceTo = parseNumberGerman(priceInput?.value || "");
  const note = (noteInput?.value || "").trim();

  if (!material) {
    showToast("Bitte Material eintragen.", "error");
    return;
  }

  if (!priceTo || priceTo <= 0) {
    showToast("Bitte Preis in €/to eintragen.", "error");
    return;
  }

  state.priceList.entries.push({
    id: uid(),
    material,
    priceTo,
    priceKg: priceTo / 1000,
    unit: "€/to",
    note
  });

  if (materialInput) materialInput.value = "";
  if (priceInput) priceInput.value = "";
  if (noteInput) noteInput.value = "";

  saveState();
  renderPriceListDraftEntries();
  renderPriceListSearch();
}

async function parsePriceListPdfFile(file) {
  if (!window.pdfjsLib) {
    throw new Error("PDF.js wurde nicht geladen.");
  }

  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const allItems = [];
  const allLines = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();

    content.items.forEach((item) => {
      const text = String(item.str || "").trim();
      if (!text) return;

      allItems.push({
        page: pageNumber,
        x: item.transform[4],
        y: item.transform[5],
        text
      });
    });
  }

  const rows = groupPdfItemsToRows(allItems);

  rows.forEach((row) => {
    allLines.push(row.items.map((item) => item.text).join(" ").replace(/\s+/g, " ").trim());
  });

  const fullText = allLines.join("\n");

  const result = {
    company: "",
    date: "",
    priceListNumber: "",
    entries: []
  };

  const numberDateMatch = fullText.match(/Preisliste\s+Nummer\s+(\d+)\s+(\d{2})\.(\d{2})\.(\d{4})/i);
  if (numberDateMatch) {
    result.priceListNumber = numberDateMatch[1];
    result.date = `${numberDateMatch[4]}-${numberDateMatch[3]}-${numberDateMatch[2]}`;
  }

  const companyMatch = fullText.match(/([A-ZÄÖÜ][A-Za-zÄÖÜäöüß\- ]+\s+GmbH)/);
  if (companyMatch) {
    result.company = companyMatch[1].trim();
  }

  const entries = [];
  const seen = new Set();

  rows.forEach((row) => {
    const line = row.items.map((item) => item.text).join(" ").replace(/\s+/g, " ").trim();
    const lineEntries = parsePriceEntriesFromLine(line);

    lineEntries.forEach((entry) => {
      const key = `${entry.material.toLowerCase()}_${entry.priceTo}`;
      if (seen.has(key)) return;
      seen.add(key);
      entries.push(entry);
    });
  });

  if (entries.length < 10) {
    const fallbackEntries = parsePriceEntriesFromLine(fullText.replace(/\n/g, " "));
    fallbackEntries.forEach((entry) => {
      const key = `${entry.material.toLowerCase()}_${entry.priceTo}`;
      if (seen.has(key)) return;
      seen.add(key);
      entries.push(entry);
    });
  }

  result.entries = entries;
  console.log("PDF-Auslesung:", {
    zeilen: rows.length,
    erkanntePreise: entries.length,
    text: fullText
  });

  return result;
}

function groupPdfItemsToRows(items) {
  const sorted = [...items].sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page;
    return b.y - a.y;
  });

  const rows = [];

  sorted.forEach((item) => {
    let row = rows.find((candidate) =>
      candidate.page === item.page && Math.abs(candidate.y - item.y) <= 4
    );

    if (!row) {
      row = {
        page: item.page,
        y: item.y,
        items: []
      };
      rows.push(row);
    }

    row.items.push(item);
  });

  rows.forEach((row) => {
    row.items.sort((a, b) => a.x - b.x);
  });

  return rows.sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page;
    return b.y - a.y;
  });
}

function parsePriceEntriesFromLine(line) {
  const entries = [];
  const cleanedLine = String(line || "")
    .replace(/\s+/g, " ")
    .replace(/€\s*\/\s*to/gi, "€ /to")
    .trim();

  const priceRegex = /(.+?)\s+(\d{1,3}(?:[.\s]\d{3})*(?:,\d{1,2})?)\s*€?\s*\/?\s*to\b/gi;

  let match;

  while ((match = priceRegex.exec(cleanedLine)) !== null) {
    const rawMaterial = cleanPriceListMaterialName(match[1]);
    const material = normalizeDetectedMaterialName(rawMaterial);
    const priceTo = parseNumberGerman(match[2]);

    if (!material || !priceTo) continue;
    if (shouldSkipPriceListMaterial(material)) continue;

    entries.push({
      id: uid(),
      rawMaterial,
      detectedMaterial: material,
      material,
      priceTo,
      priceKg: priceTo / 1000,
      unit: "€/to",
      note: ""
    });
  }

  return entries;
}

function cleanPriceListMaterialName(value) {
  return String(value || "")
    .replace(/Bezeichnung\s+Preis\s+ME/gi, "")
    .replace(/Preisliste\s+Nummer\s+\d+\s+\d{2}\.\d{2}\.\d{4}/gi, "")
    .replace(/NE-Metalle/gi, "")
    .replace(/Messing/gi, "")
    .replace(/Rotguß/gi, "")
    .replace(/Blei/gi, "")
    .replace(/Sondermetalle/gi, "")
    .replace(/Legierter Schrott/gi, "")
    .replace(/Aluminium/gi, "")
    .replace(/Edelstahl/gi, "")
    .replace(/Zink/gi, "")
    .replace(/Zinn/gi, "Zinn")
    .replace(/^\s*[-–—:|]+\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldSkipPriceListMaterial(material) {
  const normalized = String(material || "").trim().toLowerCase();

  if (!normalized) return true;
  if (normalized.length < 2) return true;

  const exactBlocked = [
    "bezeichnung",
    "preis",
    "me",
    "ne-metalle",
    "messing",
    "rotguß",
    "rotguss",
    "blei",
    "sondermetalle",
    "legierter schrott",
    "aluminium",
    "edelstahl",
    "zink"
  ];

  if (exactBlocked.includes(normalized)) return true;

  const blockedParts = [
    "die preise verstehen sich freibleibend",
    "mit freundlichen grüßen",
    "prometall gmbh",
    "telefon",
    "telefax",
    "email",
    "www.",
    "ust-id",
    "iban",
    "bic",
    "geschäftsführer"
  ];

  return blockedParts.some((word) => normalized.includes(word));
}

function normalizeMaterialText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9%]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDetectedMaterialName(rawMaterial) {
  const cleaned = String(rawMaterial || "").trim();
  if (!cleaned) return "";

  const normalized = normalizeMaterialText(cleaned);

  const learnedAliases = Array.isArray(state.materialAliases)
    ? state.materialAliases
    : [];

  const allAliases = [
    ...learnedAliases,
    ...DEFAULT_MATERIAL_ALIASES
  ];

  let bestMatch = null;
  let bestScore = 0;

  allAliases.forEach((alias) => {
    const words = Array.isArray(alias.words) ? alias.words : [];
    if (!alias.name || !words.length) return;

    const score = scoreMaterialAlias(normalized, words);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = alias.name;
    }
  });

  if (bestMatch && bestScore >= 0.72) {
    return bestMatch;
  }

  return cleanupMaterialDisplayName(cleaned);
}

function scoreMaterialAlias(normalizedText, words) {
  const normalizedWords = words
    .map((word) => normalizeMaterialText(word))
    .filter(Boolean);

  if (!normalizedText || !normalizedWords.length) return 0;

  let hits = 0;

  normalizedWords.forEach((word) => {
    if (normalizedText.includes(word)) {
      hits += 1;
    }
  });

  const baseScore = hits / normalizedWords.length;

  if (hits === normalizedWords.length) return 1;

  return baseScore;
}

function cleanupMaterialDisplayName(value) {
  return String(value || "")
    .replace(/\bcu\b/gi, "Cu")
    .replace(/\bms\b/gi, "MS")
    .replace(/\bv2a\b/gi, "V2A")
    .replace(/\bv4a\b/gi, "V4A")
    .replace(/\bpvc\b/gi, "PVC")
    .replace(/\s+/g, " ")
    .trim();
}

function learnMaterialAliasFromCorrection(oldValue, newValue) {
  ensurePriceListDraft();

  const oldText = normalizeMaterialText(oldValue);
  const newText = String(newValue || "").trim();

  if (!oldText || !newText) return;
  if (oldText.length < 3 || newText.length < 3) return;

  const alreadyKnown = [...state.materialAliases, ...DEFAULT_MATERIAL_ALIASES]
    .some((alias) => {
      const sameName = normalizeMaterialText(alias.name) === normalizeMaterialText(newText);
      const sameWords = Array.isArray(alias.words)
        && alias.words.join(" ") === oldText;
      return sameName && sameWords;
    });

  if (alreadyKnown) return;

  state.materialAliases.push({
    name: newText,
    words: oldText.split(" ").filter((word) => word.length >= 2)
  });
}

function savePriceListDraft() {
  ensurePriceListDraft();

  const company = (state.priceList.company || "").trim();
  const date = state.priceList.date || "";

  if (!company) {
    showToast("Bitte Firma eintragen.", "error");
    return;
  }

  if (!date) {
    showToast("Bitte Datum eintragen.", "error");
    return;
  }

  

  if (!state.priceList.entries.length) {
    showToast("Bitte mindestens eine Materialposition eintragen.", "error");
    return;
  }

  state.priceLists.push({
  id: uid(),
  company,
  date,
  excelName: state.priceList.excelName || "",
  pdfName: state.priceList.pdfName || "",
  pdfStorageId: state.priceList.pdfStorageId || "",
  pdfPath: "",
  pdfData: "",
  createdAt: new Date().toISOString(),
  entries: state.priceList.entries.map((entry) => ({ ...entry }))
});

  resetPriceListDraft(false);
  saveState();
  renderPriceList();
  showToast("Preisliste gespeichert.", "success");
}

function resetPriceListDraft(shouldSave = true) {
  state.priceList = {
  company: "",
  date: "",
  excelName: "",
  pdfName: "",
  pdfStorageId: "",
  pdfData: "",
  pdfPath: "",
  entries: []
};

  const materialInput = $("#priceListMaterialInput");
  const priceInput = $("#priceListPriceToInput");
  const noteInput = $("#priceListNoteInput");
  const excelInput = $("#priceListExcelInput");
const pdfInput = $("#priceListPdfInput");

if (materialInput) materialInput.value = "";
if (priceInput) priceInput.value = "";
if (noteInput) noteInput.value = "";
if (excelInput) excelInput.value = "";
if (pdfInput) pdfInput.value = "";

  if (shouldSave) saveState();
  renderPriceList();
}

function renderPriceListsList() {
  const target = $("#priceListsList");
  if (!target) return;

  ensurePriceListDraft();

  const lists = [...state.priceLists].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  if (!lists.length) {
    target.innerHTML = `<div class="price-list-empty">Noch keine Preislisten gespeichert.</div>`;
    return;
  }

  target.innerHTML = lists
    .map((list) => `
      <div class="price-list-card" data-price-list-id="${escapeHtmlAttr(list.id)}">
        <div class="price-list-card-head">
          <div>
            <strong>${escapeHtml(list.company || "Ohne Firma")}</strong>
            <small>
  ${list.date ? formatDate(parseDateKey(list.date)) : "Ohne Datum"}
  · ${escapeHtml(list.excelName || "Keine Excel")}
  · ${escapeHtml(list.pdfName || "Keine PDF")}
</small>
          <div class="price-list-card-actions">
<button class="ghost" type="button" data-open-price-pdf="${escapeHtmlAttr(list.id)}" ${list.pdfStorageId ? "" : "disabled"}>PDF öffnen</button>            <button class="danger" type="button" data-delete-price-list="${escapeHtmlAttr(list.id)}">Löschen</button>
          </div>
        </div>

        <div class="price-list-entry-table">
          ${(list.entries || []).map((entry) => `
            <div class="price-list-entry-line">
              <span>${escapeHtml(entry.material || "")}</span>
              <strong>${formatEuroPerTon(entry.priceTo)}</strong>
              <strong>${formatEuroPerKg(entry.priceKg)}</strong>
            </div>
          `).join("")}
        </div>
      </div>
    `)
    .join("");

  target.querySelectorAll("[data-open-price-pdf]").forEach((button) =>
    button.addEventListener("click", () => {
      const list = state.priceLists.find((item) => item.id === button.dataset.openPricePdf);
      if (list) openPriceListPdf(list);
    })
  );

  target.querySelectorAll("[data-delete-price-list]").forEach((button) =>
    button.addEventListener("click", () => {
      const id = button.dataset.deletePriceList;
      const list = state.priceLists.find((item) => item.id === id);
      if (!list) return;

      showConfirm(`Preisliste von "${list.company}" wirklich löschen?`, async () => {
  if (list.pdfStorageId) {
    try {
      await deletePriceListPdfFromIndexedDb(list.pdfStorageId);
    } catch (err) {
      console.error("PDF konnte nicht aus IndexedDB gelöscht werden:", err);
    }
  }

  state.priceLists = state.priceLists.filter((item) => item.id !== id);
  saveState();
  renderPriceList();
});
    })
  );
}

function parseNumberGerman(value) {
  const normalized = String(value || "")
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");

  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function formatEuroPerTon(value) {
  const number = Number(value || 0);
  if (!number) return "0,00 €/to";
  return `${number.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/to`;
}

function formatEuroPerKg(value) {
  const number = Number(value || 0);
  if (!number) return "0,00 €/kg";
  return `${number.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/kg`;
}

function openLocalFilesDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(LOCAL_FILES_DB, LOCAL_FILES_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(PRICE_LIST_PDF_STORE)) {
        db.createObjectStore(PRICE_LIST_PDF_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function savePriceListPdfToIndexedDb(fileRecord) {
  const db = await openLocalFilesDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PRICE_LIST_PDF_STORE, "readwrite");
    tx.objectStore(PRICE_LIST_PDF_STORE).put(fileRecord);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getPriceListPdfFromIndexedDb(id) {
  if (!id) return null;

  const db = await openLocalFilesDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PRICE_LIST_PDF_STORE, "readonly");
    const request = tx.objectStore(PRICE_LIST_PDF_STORE).get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function deletePriceListPdfFromIndexedDb(id) {
  if (!id) return;

  const db = await openLocalFilesDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PRICE_LIST_PDF_STORE, "readwrite");
    tx.objectStore(PRICE_LIST_PDF_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function importPriceListExcel(event) {
  console.log("Excel Import gestartet");
alert("Excel Import gestartet");
  const file = event.target.files?.[0];
  if (!file) return;

  if (!window.XLSX) {
    showToast("Excel-Bibliothek wurde nicht geladen.", "error");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const data = new Uint8Array(reader.result);
      const workbook = XLSX.read(data, { type: "array", cellDates: false });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const entries = normalizeImportedPriceRows(rows);

      if (!entries.length) {
        showToast("Keine gültigen Preise in der Excel gefunden.", "error");
        return;
      }

      ensurePriceListDraft();

      state.priceList.excelName = file.name;
      state.priceList.entries = entries;

      saveState();
      renderPriceList();

      showToast(`${entries.length} Preise aus Excel importiert.`, "success");
    } catch (err) {
      console.error(err);
      showToast("Excel konnte nicht importiert werden.", "error");
    } finally {
      event.target.value = "";
    }
  };

  reader.readAsArrayBuffer(file);
}

function normalizeImportedPriceRows(rows) {
  const result = [];

  rows.forEach((raw) => {
    const material = getPriceImportValue(raw, [
      "Material",
      "Bezeichnung",
      "Artikel",
      "Sorte",
      "Name"
    ]).trim();

    const priceText = getPriceImportValue(raw, [
      "Preis €/to",
      "Preis",
      "€/to",
      "EUR/to",
      "Preis pro Tonne",
      "Tonnenpreis"
    ]);

    const note = getPriceImportValue(raw, [
      "Notiz",
      "Bemerkung",
      "Hinweis"
    ]).trim();

    const priceTo = parseNumberGerman(priceText);

    if (!material || !priceTo || priceTo <= 0) return;

    result.push({
      id: uid(),
      material,
      priceTo,
      priceKg: priceTo / 1000,
      unit: "€/to",
      note
    });
  });

  return result;
}

function getPriceImportValue(row, possibleNames) {
  for (const name of possibleNames) {
    if (Object.prototype.hasOwnProperty.call(row, name)) {
      return String(row[name] ?? "").trim();
    }
  }

  const normalizedMap = Object.fromEntries(
    Object.keys(row).map((key) => [normalizePriceColumnName(key), key])
  );

  for (const name of possibleNames) {
    const foundKey = normalizedMap[normalizePriceColumnName(name)];
    if (foundKey) return String(row[foundKey] ?? "").trim();
  }

  return "";
}

function normalizePriceColumnName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/€/g, "eur")
    .replace(/[^a-z0-9]+/g, "");
}

function bindContainers() {
  $("#containerExcelImportInput")?.addEventListener("change", importContainersExcel);
  $("#containerExcelExportBtn")?.addEventListener("click", exportContainersExcel);

  $("#containerSearchBtn")?.addEventListener("click", searchContainers);
  $("#containerSearchNumberInput")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") searchContainers();
  });
  $("#containerSearchWeightInput")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") searchContainers();
  });

  $("#containerFilterOverdueBtn")?.addEventListener("click", showOverdueContainers);
  $("#containerFilterThisMonthBtn")?.addEventListener("click", showThisMonthContainers);
  $("#containerClearListBtn")?.addEventListener("click", clearContainerVisibleList);

  $("#containerShowPeriodBtn")?.addEventListener("click", showContainerPeriod);
  $("#containerExportPeriodBtn")?.addEventListener("click", exportContainerPeriodExcel);

  $("#containerAddBtn")?.addEventListener("click", addContainerFromForm);
  $("#containerUpdateBtn")?.addEventListener("click", updateContainerFromForm);
  $("#containerDeleteBtn")?.addEventListener("click", deleteSelectedContainer);
  $("#containerInspectionDoneBtn")?.addEventListener("click", markContainerInspectionDone);
  $("#containerInspectionBackdateBtn")?.addEventListener("click", updateContainerFromForm);
  $("#containerEditClearBtn")?.addEventListener("click", clearContainerForm);
}

function renderContainers() {
  if (!Array.isArray(state.containers)) {
    state.containers = [];
  }

  if (!Array.isArray(containerVisibleRows)) {
    containerVisibleRows = [];
  }

  renderContainerTable(containerVisibleRows);
}

function renderContainerTable(rows) {
  const body = $("#containerTableBody");
  const info = $("#containerListInfo");
  if (!body) return;

  const list = Array.isArray(rows) ? rows : [];

  if (info) {
  if (!state.containers.length) {
    info.textContent = "Noch keine Container geladen.";
  } else if (!list.length) {
    info.textContent = `${state.containers.length} Container gespeichert. Suche nach Nummer oder Gewicht.`;
  } else {
    info.textContent = `${list.length} Treffer angezeigt. Insgesamt ${state.containers.length} Container gespeichert.`;
  }
}

  if (!list.length) {
  body.innerHTML = `
    <tr>
      <td colspan="7" class="container-empty-cell">
        Keine Treffer angezeigt. Bitte Container suchen oder Filter verwenden.
      </td>
    </tr>
  `;
  return;
}

  body.innerHTML = list
    .map((container) => {
      const status = getContainerInspectionStatus(container.inspectionDate);
      const nextInspection = getNextContainerInspectionDate(container.inspectionDate);
      const rowClass = status === "overdue"
        ? "container-row-overdue"
        : status === "due"
          ? "container-row-due"
          : "";

      return `
        <tr class="${rowClass}" data-container-number="${escapeHtmlAttr(container.number)}">
          <td><strong>${escapeHtml(container.number || "")}</strong></td>
          <td>${escapeHtml(container.weight || "")}</td>
          <td>${escapeHtml(container.inspectionDate || "")}</td>
          <td>${nextInspection ? formatDate(nextInspection) : "-"}</td>
          <td>${escapeHtml(container.m3 || "")}</td>
          <td>${escapeHtml(container.year || "")}</td>
          <td>${escapeHtml(container.note || "")}</td>
        </tr>
      `;
    })
    .join("");

  body.querySelectorAll("tr[data-container-number]").forEach((row) => {
    row.addEventListener("dblclick", () => {
      const number = row.dataset.containerNumber;
      const container = state.containers.find((item) => item.number === number);
      if (container) fillContainerForm(container);
    });
  });
}

function importContainersExcel(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!window.XLSX) {
    showContainerMessage("Excel-Bibliothek wurde nicht geladen.", "error");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const data = new Uint8Array(reader.result);
      const workbook = XLSX.read(data, { type: "array", cellDates: false });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const imported = normalizeImportedContainerRows(rows);

      if (!imported.length) {
        showContainerMessage("Keine gültigen Container in der Excel gefunden.", "error");
        return;
      }

      state.containers = imported;
      containerVisibleRows = [];
      selectedContainerNumber = "";

      saveState();
      clearContainerForm(false);
      renderContainers();

      showContainerMessage(`${imported.length} Container importiert.`, "success");
    } catch (err) {
      console.error(err);
      showContainerMessage("Excel konnte nicht importiert werden.", "error");
    } finally {
      event.target.value = "";
    }
  };

  reader.readAsArrayBuffer(file);
}

function normalizeImportedContainerRows(rows) {
  const seen = new Set();
  const result = [];

  rows.forEach((raw) => {
    const number = getContainerImportValue(raw, ["Nummer", "Containernummer"]).trim();
    if (!number || seen.has(number)) return;

    seen.add(number);

    result.push({
      id: uid(),
      number,
      weight: getContainerImportValue(raw, ["Gewicht", "Leergewicht"]),
      inspectionDate: normalizeContainerExcelDate(getContainerImportValue(raw, ["Prüfdatum", "Pruefdatum"])),
      m3: getContainerImportValue(raw, ["m³", "m3", "M3"]),
      year: getContainerImportValue(raw, ["Baujahr"]),
      note: getContainerImportValue(raw, ["Notiz"])
    });
  });

  return result.sort(sortContainersByNumber);
}

function getContainerImportValue(row, possibleNames) {
  for (const name of possibleNames) {
    if (Object.prototype.hasOwnProperty.call(row, name)) {
      return String(row[name] ?? "").trim();
    }
  }

  const normalizedMap = Object.fromEntries(
    Object.keys(row).map((key) => [normalizeContainerColumnName(key), key])
  );

  for (const name of possibleNames) {
    const foundKey = normalizedMap[normalizeContainerColumnName(name)];
    if (foundKey) return String(row[foundKey] ?? "").trim();
  }

  return "";
}

function normalizeContainerColumnName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/³/g, "3")
    .replace(/[^a-z0-9]+/g, "");
}

function normalizeContainerExcelDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatContainerDate(value);
  }

  // Excel speichert Datumswerte oft als Seriennummer, z. B. 45382
  if (typeof value === "number" && Number.isFinite(value)) {
    const excelDate = excelSerialDateToJSDate(value);
    if (excelDate) return formatContainerDate(excelDate);
  }

  const raw = String(value || "").trim();
  if (!raw) return "";

  // Falls die Excel-Zahl als Text kommt, z. B. "45382"
  if (/^\d{5}$/.test(raw)) {
    const excelDate = excelSerialDateToJSDate(Number(raw));
    if (excelDate) return formatContainerDate(excelDate);
  }

  const parsed = parseContainerDate(raw);
  if (parsed) return formatContainerDate(parsed);

  return raw;
}

function excelSerialDateToJSDate(serial) {
  const number = Number(serial);

  if (!Number.isFinite(number)) return null;

  // Realistische Excel-Datumswerte grob eingrenzen
  // 30000 ≈ Jahr 1982, 60000 ≈ Jahr 2064
  if (number < 30000 || number > 60000) return null;

  // Excel zählt ab 1899-12-30
  const utcDays = Math.floor(number - 25569);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);

  if (Number.isNaN(dateInfo.getTime())) return null;

  return new Date(
    dateInfo.getUTCFullYear(),
    dateInfo.getUTCMonth(),
    dateInfo.getUTCDate()
  );
}

function exportContainersExcel() {
  if (!window.XLSX) {
    showContainerMessage("Excel-Bibliothek wurde nicht geladen.", "error");
    return;
  }

  if (!state.containers?.length) {
    showContainerMessage("Keine Container zum Exportieren vorhanden.", "error");
    return;
  }

  const rows = [...state.containers].sort(sortContainersByNumber).map((container) => ({
    Nummer: container.number || "",
    Gewicht: container.weight || "",
    Prüfdatum: container.inspectionDate || "",
    "m³": container.m3 || "",
    Baujahr: container.year || "",
    Notiz: container.note || ""
  }));

  exportRowsAsExcel(rows, "container_export.xlsx");
}

function searchContainers() {
  const number = ($("#containerSearchNumberInput")?.value || "").trim();
  const weight = ($("#containerSearchWeightInput")?.value || "").trim();

  let matches = [...state.containers];

  if (number) {
    matches = matches.filter((container) => String(container.number || "") === number);
  }

  if (weight) {
    matches = matches.filter((container) =>
      String(container.weight || "").toLowerCase().includes(weight.toLowerCase())
    );
  }

  if (!matches.length) {
    showContainerMessage("Kein Container gefunden.", "error");
    return;
  }

  containerVisibleRows = matches.sort(sortContainersByNumber);

  fillContainerForm(matches[0]);

  const numberInput = $("#containerSearchNumberInput");
  const weightInput = $("#containerSearchWeightInput");
  if (numberInput) numberInput.value = "";
  if (weightInput) weightInput.value = "";
  numberInput?.focus();

  renderContainers();
}

function showOverdueContainers() {
  containerVisibleRows = state.containers
    .filter((container) => isContainerInspectionOverdue(container.inspectionDate))
    .sort(sortContainersByNumber);

  renderContainers();
}

function showThisMonthContainers() {
  containerVisibleRows = state.containers
    .filter((container) => getContainerInspectionStatus(container.inspectionDate) === "due")
    .sort(sortContainersByNumber);

  renderContainers();
}

function clearContainerVisibleList() {
  containerVisibleRows = [];
  renderContainerTable([]);
}

function showContainerPeriod() {
  const period = $("#containerPeriodSelect")?.value || "nextMonth";
  containerVisibleRows = getContainersForPeriod(period);
  renderContainers();

  if (!containerVisibleRows.length) {
    showContainerMessage("Für diesen Zeitraum wurden keine Container gefunden.", "error");
  }
}

function exportContainerPeriodExcel() {
  if (!window.XLSX) {
    showContainerMessage("Excel-Bibliothek wurde nicht geladen.", "error");
    return;
  }

  const period = $("#containerPeriodSelect")?.value || "nextMonth";
  const rows = getContainersForPeriod(period).map((container) => {
    const nextInspection = getNextContainerInspectionDate(container.inspectionDate);

    return {
      Nummer: container.number || "",
      Gewicht: container.weight || "",
      Prüfdatum: container.inspectionDate || "",
      "m³": container.m3 || "",
      Baujahr: container.year || "",
      Notiz: container.note || "",
      "Nächste Prüfung": nextInspection ? formatDate(nextInspection) : ""
    };
  });

  if (!rows.length) {
    showContainerMessage("Für diesen Zeitraum wurden keine Container gefunden.", "error");
    return;
  }

  const fileName = `container_pruefungen_${period}_${dateKey(new Date())}.xlsx`;
  exportRowsAsExcel(rows, fileName);
}

function getContainersForPeriod(period) {
  const today = new Date();
  const todayOnly = parseDateKey(dateKey(today));

  return [...state.containers]
    .filter((container) => {
      const next = getNextContainerInspectionDate(container.inspectionDate);
      const firstDue = getFirstContainerDueDate(container.inspectionDate);

      if (period === "allWithDate") return !!next;

      if (period === "overdue") {
        return !!firstDue && firstDue < todayOnly;
      }

      if (!next) return false;

      if (period === "thisMonth") {
        return next.getMonth() === today.getMonth() && next.getFullYear() === today.getFullYear();
      }

      if (period === "nextMonth") {
        const target = addContainerMonths(todayOnly, 1);
        return next.getMonth() === target.getMonth() && next.getFullYear() === target.getFullYear();
      }

      const monthsMap = {
        next3: 3,
        next6: 6,
        next12: 12
      };

      if (monthsMap[period]) {
        const limit = addContainerMonths(todayOnly, monthsMap[period]);
        return next >= todayOnly && next <= limit;
      }

      return false;
    })
    .sort(sortContainersByNumber);
}

function addContainerFromForm() {
  const values = getContainerFormValues();

  if (!values.number) {
    showContainerMessage("Bitte eine Nummer eintragen.", "error");
    return;
  }

  if (state.containers.some((container) => container.number === values.number)) {
    showContainerMessage("Diese Containernummer gibt es bereits.", "error");
    return;
  }

  const container = {
    id: uid(),
    ...values
  };

  state.containers.push(container);
  selectedContainerNumber = container.number;
  containerVisibleRows = [container, ...state.containers.filter((item) => item.number !== container.number)];

  saveState();
  renderContainers();
  showContainerMessage("Container hinzugefügt.", "success");
}

function updateContainerFromForm() {
  const values = getContainerFormValues();

  if (!values.number) {
    showContainerMessage("Bitte eine Nummer eintragen.", "error");
    return;
  }

  const oldNumber = selectedContainerNumber || values.number;
  const index = state.containers.findIndex((container) => container.number === oldNumber);

  if (index === -1) {
    showContainerMessage("Bitte zuerst einen Container suchen oder doppelklicken.", "error");
    return;
  }

  const numberExists = state.containers.some((container, currentIndex) =>
    currentIndex !== index && container.number === values.number
  );

  if (numberExists) {
    showContainerMessage("Die neue Containernummer existiert bereits.", "error");
    return;
  }

  state.containers[index] = {
    ...state.containers[index],
    ...values
  };

  selectedContainerNumber = values.number;
  containerVisibleRows = [
    state.containers[index],
    ...state.containers.filter((container) => container.number !== values.number)
  ];

  saveState();
  renderContainers();
  showContainerMessage("Container bearbeitet.", "success");
}

function deleteSelectedContainer() {
  const values = getContainerFormValues();
  const targetNumber = selectedContainerNumber || values.number;

  if (!targetNumber) {
    showContainerMessage("Bitte zuerst einen Container auswählen.", "error");
    return;
  }

  const container = state.containers.find((item) => item.number === targetNumber);
  if (!container) {
    showContainerMessage("Diese Containernummer existiert nicht.", "error");
    return;
  }

  showConfirm(`Container ${container.number} wirklich löschen?`, () => {
    state.containers = state.containers.filter((item) => item.number !== targetNumber);
    containerVisibleRows = containerVisibleRows.filter((item) => item.number !== targetNumber);
    selectedContainerNumber = "";

    clearContainerForm(false);
    saveState();
    renderContainers();
  });
}

function markContainerInspectionDone() {
  const values = getContainerFormValues();
  const targetNumber = selectedContainerNumber || values.number;

  if (!targetNumber) {
    showContainerMessage("Bitte zuerst einen Container suchen oder auswählen.", "error");
    return;
  }

  const container = state.containers.find((item) => item.number === targetNumber);
  if (!container) {
    showContainerMessage("Diese Containernummer existiert nicht.", "error");
    return;
  }

  container.number = values.number || container.number;
  container.weight = values.weight;
  container.inspectionDate = formatContainerDate(new Date());
  container.m3 = values.m3;
  container.year = values.year;
  container.note = values.note;

  selectedContainerNumber = container.number;
  fillContainerForm(container);

  containerVisibleRows = [
    container,
    ...state.containers.filter((item) => item.number !== container.number)
  ];

  saveState();
  renderContainers();
  showContainerMessage(`Prüfung erledigt. Prüfdatum wurde auf ${container.inspectionDate} gesetzt.`, "success");
}

function fillContainerForm(container) {
  selectedContainerNumber = container.number || "";

  setInputValue("#containerEditNumberInput", container.number || "");
  setInputValue("#containerEditWeightInput", container.weight || "");
  setInputValue("#containerEditInspectionInput", container.inspectionDate || "");
  setInputValue("#containerEditM3Input", container.m3 || "");
  setInputValue("#containerEditYearInput", container.year || "");
  setInputValue("#containerEditNoteInput", container.note || "");
}

function clearContainerForm(shouldFocus = true) {
  selectedContainerNumber = "";

  setInputValue("#containerEditNumberInput", "");
  setInputValue("#containerEditWeightInput", "");
  setInputValue("#containerEditInspectionInput", "");
  setInputValue("#containerEditM3Input", "");
  setInputValue("#containerEditYearInput", "");
  setInputValue("#containerEditNoteInput", "");

  if (shouldFocus) $("#containerEditNumberInput")?.focus();
}

function getContainerFormValues() {
  return {
    number: ($("#containerEditNumberInput")?.value || "").trim(),
    weight: ($("#containerEditWeightInput")?.value || "").trim(),
    inspectionDate: ($("#containerEditInspectionInput")?.value || "").trim(),
    m3: ($("#containerEditM3Input")?.value || "").trim(),
    year: ($("#containerEditYearInput")?.value || "").trim(),
    note: ($("#containerEditNoteInput")?.value || "").trim()
  };
}

function setInputValue(selector, value) {
  const input = $(selector);
  if (input) input.value = value;
}

function parseContainerDate(value) {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const text = String(value || "").trim();
  if (!text) return null;

  const patterns = [
    /^(\d{2})\.(\d{2})\.(\d{4})$/,
    /^(\d{1,2})\.(\d{1,2})\.(\d{2})$/,
    /^(\d{4})-(\d{2})-(\d{2})$/,
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/
  ];

  let match = text.match(patterns[0]);
  if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));

  match = text.match(patterns[1]);
  if (match) {
    const year = Number(match[3]);
    return new Date(year >= 70 ? 1900 + year : 2000 + year, Number(match[2]) - 1, Number(match[1]));
  }

  match = text.match(patterns[2]);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));

  match = text.match(patterns[3]);
  if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));

  match = text.match(patterns[4]);
  if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));

  return null;
}

function formatContainerDate(value) {
  const date = value instanceof Date ? value : parseContainerDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function addContainerYears(date, years = 1) {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);

  if (result.getMonth() !== date.getMonth()) {
    result.setDate(0);
  }

  return result;
}

function addContainerMonths(date, months) {
  const result = new Date(date);
  const targetMonth = result.getMonth() + months;
  result.setMonth(targetMonth);

  if (result.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    result.setDate(0);
  }

  return result;
}

function getFirstContainerDueDate(inspectionDateText) {
  const inspectionDate = parseContainerDate(inspectionDateText);
  if (!inspectionDate) return null;
  return addContainerYears(inspectionDate, 1);
}

function getNextContainerInspectionDate(inspectionDateText) {
  let due = getFirstContainerDueDate(inspectionDateText);
  if (!due) return null;

  const todayOnly = parseDateKey(dateKey(new Date()));

  while (due < todayOnly) {
    due = addContainerYears(due, 1);
    if (!due) return null;
  }

  return due;
}

function isContainerInspectionOverdue(inspectionDateText) {
  const firstDue = getFirstContainerDueDate(inspectionDateText);
  if (!firstDue) return false;

  const todayOnly = parseDateKey(dateKey(new Date()));
  return firstDue < todayOnly;
}

function getContainerInspectionStatus(inspectionDateText) {
  if (isContainerInspectionOverdue(inspectionDateText)) {
    return "overdue";
  }

  const next = getNextContainerInspectionDate(inspectionDateText);
  if (!next) return "unknown";

  const today = new Date();
  if (next.getMonth() === today.getMonth() && next.getFullYear() === today.getFullYear()) {
    return "due";
  }

  return "ok";
}

function sortContainersByNumber(a, b) {
  return String(a.number || "").localeCompare(String(b.number || ""), "de", {
    numeric: true,
    sensitivity: "base"
  });
}

function exportRowsAsExcel(rows, fileName) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Container");
  XLSX.writeFile(workbook, fileName);
}

function showContainerMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
    return;
  }

  alert(message);
}

  function renderOfficeOnly() {
    renderPeriodInfo();
    renderOfficeGrid();
    renderHoursBilling();
    renderHoursBillingTabStatus();
  }

  function shiftPeriod(delta) {
    const { year, month } = state.settings.periodAnchor;
    const d = new Date(year, month - 1 + delta, 1);
    state.settings.periodAnchor = { year: d.getFullYear(), month: d.getMonth() + 1 };
    saveState();
    renderOfficeOnly();
  }

  function shiftStatsMonth(delta) {
    const { year, month } = state.settings.statsAnchor;
    const d = new Date(year, month - 1 + delta, 1);
    state.settings.statsAnchor = { year: d.getFullYear(), month: d.getMonth() + 1 };
    saveState();
    renderStatsMonthTitle();
    renderMonthlyStats();
  }

  function shiftAttendanceDay(delta) {
    const d = parseDateKey(state.settings.attendanceDay || dateKey(new Date()));
    d.setDate(d.getDate() + delta);
    state.settings.attendanceDay = dateKey(d);
    saveState();
    renderDailyAttendance();
  }

  function shiftAttendanceMonth(delta) {
    const current = parseDateKey(state.settings.attendanceDay || dateKey(new Date()));

    const year = current.getFullYear();
    const month = current.getMonth();
    const day = current.getDate();

    const target = new Date(year, month + delta, 1);
    const lastDayOfTargetMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();

    target.setDate(Math.min(day, lastDayOfTargetMonth));

    state.settings.attendanceDay = dateKey(target);
    saveState();
    renderAttendanceMonthTitle();
    renderDailyAttendance();
  }

  function getCurrentMonthView() {
    const { year, month } = state.settings.periodAnchor;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return {
      start,
      end,
      label: `${start.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}`
    };
  }

  function getStatsMonthView() {
    return getPayrollPeriodForAnchor(state.settings.statsAnchor);
  }

  function getMonthGridDays(view) {
    const first = new Date(view.start);
    const offset = (first.getDay() + 6) % 7;
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - offset);

    const last = new Date(view.end);
    const endOffset = 6 - ((last.getDay() + 6) % 7);
    const gridEnd = new Date(last);
    gridEnd.setDate(last.getDate() + endOffset);

    const days = [];
    const d = new Date(gridStart);

    while (d <= gridEnd) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }

  function getMonthDays(view) {
    const days = [];
    const d = new Date(view.start);
    while (d <= view.end) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }

  /**
   * Rendert den Büroplan-Titel und den Dashboard-Badge.
   * - Büroplan-Titel (#periodTitle): zeigt den Abrechnungszeitraum des
   *   aktuell ANGEZEIGTEN Kalendermonats (folgt der Navigation mit ◀/▶).
   *   Format: "20.03. – 19.04."
   * - Dashboard-Badge (#currentPeriodBadge): zeigt IMMER den aktuellen
   *   (heutigen) Abrechnungszeitraum als Monatsnamen (z.B. "März / April").
   */
  function renderPeriodInfo() {
    // Büroplan: Abrechnungszeitraum des angezeigten Monats (folgt Navigation)
    const officeView = getCurrentMonthView();
    const el = $("#periodTitle");
    if (el) el.textContent = officeView.label;

    // Dashboard-Badge: IMMER aktueller Abrechnungszeitraum als Monatsname
    const currentPayroll = getCurrentPayrollPeriod();
    const startName = currentPayroll.start.toLocaleDateString("de-DE", { month: "long" });
    const endName = currentPayroll.end.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
    const badge = $("#currentPeriodBadge");
    if (badge) badge.textContent = `${startName} / ${endName}`;
  }

  function renderHeaderStatusCards() {
    const target = $("#headerStatusCards");
    if (!target) return;

    const todayText = new Date().toLocaleDateString("de-DE", {
      weekday: "long",
      day: "2-digit",
      month: "long"
    });
    const office = state.officePlan?.[dateKey(new Date())] || {};
    const officeNames = [office.primaryEmployeeId, office.secondaryEmployeeId]
      .filter(Boolean)
      .map((id) => employeeNameById(id))
      .filter(Boolean);
    const priceStatus = getNewPricesStatus();
    const syncText = state.settings.trashIcalLastLoaded
      ? `Zuletzt ${formatDate(new Date(state.settings.trashIcalLastLoaded))}`
      : "Lokal gespeichert";

    const cards = [
      { label: "Heute", value: todayText, icon: "calendar-day", tone: "neutral" },
      { label: "Büro besetzt", value: officeNames.length ? officeNames.join(" + ") : "Nicht eingetragen", icon: "building", tone: officeNames.length ? "ok" : "warn" },
      { label: "Sync", value: syncText, icon: "arrows-rotate", tone: "neutral" }
    ];

    target.innerHTML = cards
      .map((card, index) => `
        <article class="status-card ${card.tone}" data-status-index="${index}">
          <span class="status-card-icon">${getFaStatusIconHtml(card.icon)}</span>
          <div class="status-card-copy">
            <span>${escapeHtml(card.label)}</span>
            ${card.value ? `<strong>${escapeHtml(card.value)}</strong>` : ""}
          </div>
        </article>
      `)
      .join("");
  }

  function renderDashboardCommandCards() {
    const target = $("#dashboardCommandCards");
    if (!target) return;

    const currentPayroll = getCurrentPayrollPeriod();
    const hoursDone = isHoursBillingDoneForDashboard(currentPayroll);
    const yesimActual = calculateOfficeCounters(currentPayroll)["Yesim Kröll"] || { shifts: 0, hours: 0 };
    const office = state.officePlan?.[dateKey(new Date())] || {};
    const officeNames = [office.primaryEmployeeId, office.secondaryEmployeeId]
      .filter(Boolean)
      .map((id) => employeeNameById(id))
      .filter(Boolean);
    const officeCount = officeNames.length;
    const notePreviewItems = getNotesAndEventsPreviewItems();
    const noteCount = notePreviewItems.length;
    const deadlineCount = getUpcomingVehicleDeadlines(10).length;
    const nextWaste = getNextWastePickup();
    const upcomingBirthdays = getBirthdayPreviewItems(6);
    const yesimMeta = `${yesimActual.shifts} Tage · ${yesimActual.hours} Std.`;
    const yesimDetail = `Aktueller Abrechnungszeitraum: ${currentPayroll.start.toLocaleDateString("de-DE", { month: "long" })} / ${currentPayroll.end.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}`;
    const priceStatus = getNewPricesStatus();
    const newPricesDateLabel = state.settings.newPricesDate
      ? formatDate(new Date(state.settings.newPricesDate))
      : "Kein Hinweis";
    const newPricesMeta = state.settings.newPricesDate
      ? `Stand: ${newPricesDateLabel}`
      : "Kein Hinweis";

    const cards = [
      {
        title: priceStatus.needsAttention ? "!Neue Preise!" : "Neue Preise",
        meta: newPricesMeta,
        submeta: "",
        icon: "briefcase",
        tab: "dashboard",
        tone: priceStatus.needsAttention ? "alert" : "",
        detail: priceStatus.needsAttention
          ? "Neue Preise bestaetigen oder mit heutigem Datum aktualisieren."
          : "Neue Preisinfo mit Datum eintragen.",
        drawerType: "new-prices-action"
      },
      {
        title: "Yesims Stunden",
        meta: yesimMeta,
        icon: "user-clock",
        tab: "dashboard",
        detail: yesimDetail,
        drawerType: "yesim-hours-preview"
      },
      {
        title: "Büroplan heute",
        meta: officeCount ? officeNames.join(" + ") : "Noch keine Belegung",
        icon: "building",
        tab: "buero",
        detail: officeCount
          ? officeNames.join(", ")
          : "Für heute ist noch niemand im Büro eingetragen.",
        drawerType: "office-preview"
      },
      {
        title: "Müll",
        meta: nextWaste ? `${nextWaste.type} · ${formatDate(parseDateKey(nextWaste.date))}` : "Keine nächste Abholung",
        icon: "trash",
        tab: "einstellungen",
        detail: nextWaste ? "Die nächste Müllabholung ist im Kalender eingetragen." : "Aktuell ist keine Müllabholung eingetragen.",
        drawerType: "waste-preview"
      },
      {
        title: "Geburtstage",
        meta: upcomingBirthdays.length ? `${upcomingBirthdays.length} in den nächsten 30 Tagen` : "Keine anstehenden Geburtstage",
        icon: "cake-candles",
        tab: "einstellungen",
        detail: upcomingBirthdays.length ? "Anstehende Geburtstage von Mitarbeitern und externen Kontakten." : "Aktuell sind keine Geburtstage in den nächsten 30 Tagen vorhanden.",
        drawerType: "birthdays-preview"
      },
      {
        title: "Stundenabrechnung",
        meta: hoursDone ? "Für aktuellen Zeitraum erledigt" : "Für aktuellen Zeitraum offen",
        icon: "clock",
        tab: "stundenabrechnung",
        detail: `${currentPayroll.label} · ${hoursDone ? "erledigt" : "offen"}`,
        drawerType: "hours-preview"
      },
      {
        title: "Notizen & Termine",
        meta: noteCount ? `${noteCount} sichtbare Einträge` : "Keine sichtbaren Einträge",
        icon: "note-sticky",
        tab: "notizen",
        detail: noteCount ? "Sichtbare Notizen, Hinweise und Termine koennen direkt im Notizen-Tab bearbeitet werden." : "Aktuell sind keine sichtbaren Notizen, Hinweise oder Termine vorhanden.",
        drawerType: "notes-preview"
      },
      {
        title: "Fahrzeugfristen",
        meta: deadlineCount ? `${deadlineCount} Fristen im Blick` : "Keine offenen Fristen",
        icon: "truck-fast",
        tab: "fahrzeuge",
        detail: deadlineCount ? "Die nächsten Fahrzeugfristen findest du direkt im Fahrzeug-Tab." : "Aktuell sind keine Fahrzeugfristen eingetragen.",
        drawerType: "vehicle-deadlines-preview"
      },
    ];

    target.innerHTML = cards
      .map((card) => `
        <button class="command-card ${card.tone || ""}" type="button" data-command-tab="${card.tab}" data-command-title="${escapeHtmlAttr(card.title || card.meta)}" data-command-detail="${escapeHtmlAttr(card.detail)}" data-command-drawer="${card.drawerType || "default"}">
          <span class="command-card-icon">${getFaStatusIconHtml(card.icon)}</span>
          <div class="command-card-copy">
            ${card.title ? `<strong>${escapeHtml(card.title)}</strong>` : ""}
            <span>${escapeHtml(card.meta)}</span>
            ${card.submeta ? `<small>${escapeHtml(card.submeta)}</small>` : ""}
          </div>
        </button>
      `)
      .join("");

    $$("#dashboardCommandCards .command-card").forEach((card) =>
      card.addEventListener("click", () => {
        const drawerType = card.dataset.commandDrawer || "default";
        if (drawerType === "office-preview") {
          openDetailDrawer(buildOfficePreviewDrawerHtml());
        } else if (drawerType === "hours-preview") {
          openDetailDrawer(buildHoursBillingDrawerHtml());
        } else if (drawerType === "notes-preview") {
          openDetailDrawer(buildNotesPreviewDrawerHtml());
        } else if (drawerType === "vehicle-deadlines-preview") {
          openDetailDrawer(buildVehicleDeadlinesDrawerHtml());
        } else if (drawerType === "new-prices-action") {
          triggerNewPricesAction();
          return;
        } else if (drawerType === "yesim-hours-preview") {
          openDetailDrawer(buildYesimHoursDrawerHtml());
        } else if (drawerType === "waste-preview") {
          openDetailDrawer(buildWastePreviewDrawerHtml());
        } else if (drawerType === "birthdays-preview") {
          openDetailDrawer(buildBirthdaysPreviewDrawerHtml());
        } else {
          openDetailDrawer(`
            <div class="drawer-section">
              <div class="drawer-eyebrow">Command Card</div>
              <h3>${escapeHtml(card.dataset.commandTitle || "")}</h3>
              <p>${escapeHtml(card.dataset.commandDetail || "")}</p>
              <button class="ghost" type="button" data-drawer-tab="${card.dataset.commandTab || "dashboard"}">Zum Bereich</button>
            </div>
          `);
        }

        $("#detailDrawer [data-drawer-tab]")?.addEventListener("click", () => {
          activateTab(card.dataset.commandTab || "dashboard");
          closeDetailDrawer();
        });
      })
    );
  }

  function renderAttendanceMonthTitle() {
    const selectedDate = parseDateKey(state.settings.attendanceDay || dateKey(new Date()));
    const el = $("#attendanceMonthTitle");
    if (!el) return;

    el.textContent = selectedDate.toLocaleDateString("de-DE", {
      month: "long",
      year: "numeric"
    });
  }

  function renderStatsMonthTitle() {
    const view = getStatsMonthView();
    const el = $("#statsMonthTitle");
    if (el) el.textContent = view.label;
  }

  function renderVacationPlanYearSelect() {
    const years = collectYearsWithFallback();
    const current = state.settings.vacationPlanYear || new Date().getFullYear();
    const select = $("#vacationPlanYearSelect");
    if (!select) return;
    select.innerHTML = years
      .map((y) => `<option value="${y}" ${y === current ? "selected" : ""}>${y}</option>`)
      .join("");
  }

  function renderVacationPlanBossSelect() {
    const select = $("#vacationPlanBossSelect");
    if (!select) return;

    const bosses = state.externalBirthdays || [];
    const current = state.settings.vacationPlanBossId || "";

    select.innerHTML = [
      `<option value="">Geschaeftsfuehrung waehlen</option>`,
      ...bosses.map((boss) => `<option value="${boss.id}" ${boss.id === current ? "selected" : ""}>${escapeHtml(boss.name || "Chef")}</option>`)
    ].join("");
  }

  function renderDashboardYearSelect() {
    const years = collectYearsWithFallback();
    const current = state.settings.dashboardYear || new Date().getFullYear();
    const select = $("#dashboardYearSelect");
    if (!select) return;
    select.innerHTML = years
      .map((y) => `<option value="${y}" ${y === current ? "selected" : ""}>${y}</option>`)
      .join("");
  }

  function renderSettingsToggles() {
    const sunday = $("#sundaysEditableToggle");
    if (sunday) sunday.checked = !!state.settings.sundaysEditable;

    const holiday = $("#holidaysEditableToggle");
    if (holiday) holiday.checked = !!state.settings.holidaysEditable;

    const secondPerson = $("#officeSecondPersonToggle");
    if (secondPerson) secondPerson.checked = !!state.settings.officeSecondPersonEnabled;

    const specialMode = $("#officeSpecialModeToggle");
    if (specialMode) specialMode.checked = !!state.settings.officeSpecialModeEnabled;

    const urlInput = $("#trashIcalUrl");
    if (urlInput) urlInput.value = state.settings.trashIcalUrl || "";

    const statusEl = $("#trashIcalStatus");
    if (statusEl) {
      const count = (state.trashEvents || []).length;
      const last = state.settings.trashIcalLastLoaded;
      if (count > 0 && last) {
        statusEl.textContent = `✓ ${count} Termine geladen · zuletzt ${formatDate(new Date(last))}`;
      } else if (count > 0) {
        statusEl.textContent = `✓ ${count} Termine gespeichert`;
      } else {
        statusEl.textContent = "";
      }
    }
  }

  function populateBulkEmployeeDropdown() {
  const select = $("#bulkEmployee");
  if (!select) return;

  const currentValue = select.value;
  const bossOptions = (state.externalBirthdays || [])
    .map((boss) => `<option value="boss:${boss.id}">${escapeHtml(boss.name)} (GF)</option>`)
    .join("");

  select.innerHTML = `
    <option value="">Mitarbeiter wählen</option>
    ${state.employees
      .filter((e) => e.active)
      .map((e) => `<option value="${e.id}">${escapeHtml(e.name)}</option>`)
      .join("")}
    ${bossOptions}
  `;

  if (currentValue) {
    select.value = currentValue;
  }
}

  function getPayrollPeriodForDate(baseDate) {
    const d = new Date(baseDate);
    const year = d.getFullYear();
    const month = d.getMonth();

    if (d.getDate() >= 20) {
      return {
        start: new Date(year, month, 20),
        end: new Date(year, month + 1, 19)
      };
    }

    return {
      start: new Date(year, month - 1, 20),
      end: new Date(year, month, 19)
    };
  }

  /**
   * Gibt IMMER den aktuell laufenden Abrechnungszeitraum zurück,
   * basierend auf dem heutigen Datum.
   * Beispiel: Am 5. April → gibt 20.03. – 19.04. zurück.
   * Wird für Yesim-Counter (Büroplan + Dashboard) verwendet.
   */
  function getCurrentPayrollPeriod() {
    return getPayrollPeriodForDate(new Date());
  }

  /**
   * Gibt den Abrechnungszeitraum für einen gegebenen Monats-Anker zurück.
   * Label-Format: "20.03. – 19.04." (für Büroplan-Anzeige)
   * Das Dashboard-Badge zeigt stattdessen Monatsnamen (März/April).
   */
  function getPayrollPeriodForAnchor(anchor) {
    const baseDate = new Date(anchor.year, anchor.month - 1, 1);
    const period = getPayrollPeriodForDate(baseDate);

    // Kurzes Datum-Format für den Büroplan (z.B. "20.03. – 19.04.")
    const fmt = (d) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.`;
    const labelDate = `${fmt(period.start)} – ${fmt(period.end)}`;

    return {
      ...period,
      label: labelDate
    };
  }

  function getPayrollPeriodKey(period) {
    return `${dateKey(period.start)}_${dateKey(period.end)}`;
  }

  function getHoursBillingDoneMap() {
    if (!state.settings.hoursBillingDonePeriods || typeof state.settings.hoursBillingDonePeriods !== "object") {
      state.settings.hoursBillingDonePeriods = {};
    }
    return state.settings.hoursBillingDonePeriods;
  }

  function isHoursBillingDone(period) {
    return !!getHoursBillingDoneMap()[getPayrollPeriodKey(period)];
  }

  function isHoursBillingDoneForDashboard(period) {
    const doneAt = getHoursBillingDoneMap()[getPayrollPeriodKey(period)];
    if (!doneAt) return false;

    const doneDate = new Date(doneAt);
    if (Number.isNaN(doneDate.getTime())) return true;

    const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
    return Date.now() - doneDate.getTime() <= fiveDaysMs;
  }

  function getRecentHoursBillingDoneForDashboard() {
    const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    return Object.entries(getHoursBillingDoneMap())
      .map(([key, doneAt]) => {
        const doneDate = new Date(doneAt);
        if (Number.isNaN(doneDate.getTime()) || now - doneDate.getTime() > fiveDaysMs) return null;

        const [startKey, endKey] = key.split("_");
        const start = parseDateKey(startKey || "");
        const end = parseDateKey(endKey || "");
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

        return { start, end, doneAt: doneDate.getTime() };
      })
      .filter(Boolean)
      .sort((a, b) => b.doneAt - a.doneAt)[0] || null;
  }

  function setHoursBillingDone(period, done) {
    const map = getHoursBillingDoneMap();
    const key = getPayrollPeriodKey(period);
    if (done) map[key] = new Date().toISOString();
    else delete map[key];
  }

  function renderHoursBillingTabStatus() {
    const tab = document.querySelector('.tab[data-tab="stundenabrechnung"]');
    if (!tab) return;

    tab.classList.remove("billing-warning-soon", "billing-warning-urgent", "billing-warning-due", "billing-done");
    tab.dataset.billingBadge = "";

    const period = getPayrollPeriodForDate(new Date());
    if (isHoursBillingDone(period)) {
      tab.classList.add("billing-done");
      tab.dataset.billingBadge = "✓";
      return;
    }

    const todayOnly = parseDateKey(dateKey(new Date()));
    const endOnly = parseDateKey(dateKey(period.end));
    const daysLeft = Math.round((endOnly - todayOnly) / 86400000);

    if (daysLeft <= 0) {
      tab.classList.add("billing-warning-due");
      tab.dataset.billingBadge = "!";
    } else if (daysLeft === 1) {
      tab.classList.add("billing-warning-urgent");
    } else if (daysLeft === 2) {
      tab.classList.add("billing-warning-soon");
    }
  }

  function onHoursBillingDoneChange(e) {
    const period = getPayrollPeriodForAnchor(state.settings.periodAnchor);
    setHoursBillingDone(period, e.target.checked);
    saveState();
    renderHoursBilling();
    renderHoursBillingTabStatus();
    renderDashboard();
  }

  function getOfficeCounterAnchorDate() {
    const storedKey = state.settings.officeCounterAnchorDate || "";
    if (storedKey) return parseDateKey(storedKey);
    return new Date();
  }

  function getOfficeCounterPayrollPeriod() {
    const anchorDate = getOfficeCounterAnchorDate();
    const period = getPayrollPeriodForDate(anchorDate);
    const fmt = (d) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.`;

    return {
      ...period,
      label: `${fmt(period.start)} - ${fmt(period.end)}`
    };
  }

function isBulkBlockedDay(date) {
  const key = dateKey(date);
  const day = date.getDay(); // 0 = Sonntag, 6 = Samstag
  const holidays = buildHolidayMapForRange(date, date);

  return day === 0 || day === 6 || !!holidays[key];
}

function applyBulkStatusRange() {
  const employeeValue = $("#bulkEmployee")?.value;
  const status = $("#bulkStatus")?.value;
  const from = $("#bulkFrom")?.value;
  const to = $("#bulkTo")?.value;

  if (!employeeValue || !status || !from || !to) return;

  const isBoss = employeeValue.startsWith("boss:");
  const employeeId = isBoss ? employeeValue.slice(5) : employeeValue;

  let current = new Date(from);
  const end = new Date(to);

  while (current <= end) {
    if (!isBulkBlockedDay(current)) {
      const key = dateKey(current);

      if (isBoss) {
        setManagementAttendanceEntry(employeeId, key, { status, note: "" });
      } else {
        if (!state.attendance[employeeId]) {
          state.attendance[employeeId] = {};
        }

        state.attendance[employeeId][key] = {
          status,
          note: ""
        };
      }
    }

    current.setDate(current.getDate() + 1);
  }

  saveState();
  renderAll();
}

function removeBulkStatusRange() {
  const employeeValue = $("#bulkEmployee")?.value;
  const status = $("#bulkStatus")?.value;
  const from = $("#bulkFrom")?.value;
  const to = $("#bulkTo")?.value;

  if (!employeeValue || !status || !from || !to) return;

  const isBoss = employeeValue.startsWith("boss:");
  const employeeId = isBoss ? employeeValue.slice(5) : employeeValue;
  if (!isBoss && !state.attendance[employeeId]) return;

  let current = new Date(from);
  const end = new Date(to);

  while (current <= end) {
    if (!isBulkBlockedDay(current)) {
      const key = dateKey(current);
      const entry = isBoss
        ? getManagementAttendanceEntry(employeeId, key)
        : getRawAttendanceEntry(employeeId, key);

      if (entry && entry.status === status) {
        if (isBoss) clearManagementAttendanceEntry(employeeId, key);
        else delete state.attendance[employeeId][key];
      }
    }

    current.setDate(current.getDate() + 1);
  }

  saveState();
  renderAll();
}

  function isOnVacation(employeeId, dateKeyStr) {
    const entry = getAttendanceEntry(employeeId, dateKeyStr);
    return entry && entry.status === "U";
  }

  function getPartTimeVacationQuota(employeeId) {
    const employee = state.employees.find((e) => e.id === employeeId);
    if (!employee) return 0;

    const normalized = (employee.name || "").toLowerCase();
    if (normalized.includes("yesim")) return 2;
    if (normalized.includes("daniela")) return 3;
    return 0;
  }

  function isPartTimeVacationEmployee(employeeId) {
    return getPartTimeVacationQuota(employeeId) > 0;
  }

  function isPartTimeNonCountedVacationDay(employeeId, date) {
    const employee = state.employees.find((e) => e.id === employeeId);
    if (!employee) return false;

    const normalized = (employee.name || "").toLowerCase();
    const weekday = date.getDay();

    if (normalized.includes("yesim")) return weekday >= 3 && weekday <= 5;
    if (normalized.includes("daniela")) return weekday >= 4 && weekday <= 5;
    return false;
  }

  function getPartTimeVacationWeekCount(employeeId, date) {
    const weekStart = new Date(date);
    const dayIndex = (weekStart.getDay() + 6) % 7;
    weekStart.setDate(weekStart.getDate() - dayIndex);
    weekStart.setHours(0, 0, 0, 0);

    let count = 0;
    for (let i = 0; i < 5; i += 1) {
      const current = new Date(weekStart);
      current.setDate(weekStart.getDate() + i);
      const entry = getRawAttendanceEntry(employeeId, dateKey(current));
      if (entry?.status === "U") count += 1;
    }

    return count;
  }

  function getExpandedVacationEntry(employeeId, key) {
    const quota = getPartTimeVacationQuota(employeeId);
    if (!quota) return null;

    const day = parseDateKey(key);
    const weekday = day.getDay();
    if (weekday === 0 || weekday === 6) return null;

    return getPartTimeVacationWeekCount(employeeId, day) >= quota
      ? { status: "U", note: "" }
      : null;
  }

  function getSpecialOfficeDay(key) {
    return state.specialOfficeDays?.[key] || { mode: "", openingText: "", note: "" };
  }

  function setSpecialOfficeDay(key, value) {
    if (!state.specialOfficeDays) state.specialOfficeDays = {};
    state.specialOfficeDays[key] = value;
  }

  function clearSpecialOfficeDay(key) {
    if (!state.specialOfficeDays) return;
    delete state.specialOfficeDays[key];
  }

  /**
   * Rendert das gesamte Dashboard:
   * - Notizen: separater Unterabschnitt (Punkt 9)
   * - Fahrzeuge: separater Unterabschnitt (Punkt 10)
   * Das Dashboard-Label zeigt Monatsnamen (März/April), nicht das Datum (Punkt 19-24).
   */
  function renderDashboard() {
    renderHeaderStatusCards();
    renderDashboardCommandCards();
    const vehicleItems = [];  // Fahrzeuge-Unterabschnitt
    const noteItems = [];     // Notizen-Unterabschnitt

    const in30Days = addDays(new Date(), 30);

    // --- Fahrzeuge: Fristen ---
    getUpcomingVehicleDeadlines(20)
      .filter((item) => {
        const dt = parseMonthKey(item.date);
        if (!dt) return false;
        const itemMonth = new Date(dt.getFullYear(), dt.getMonth(), 1);
        const limitMonth = new Date(in30Days.getFullYear(), in30Days.getMonth(), 1);
        return itemMonth <= limitMonth || item.isOverdue;
      })
      .forEach((item) => {
        const cardClass = item.isOverdue
          ? "danger-card"
          : item.isSoon
            ? "warning-card"
            : "";
        vehicleItems.push(`
          <div class="mini-list-item ${cardClass}">
            <div>
              <div class="title">${escapeHtml(item.vehicle.name)}</div>
              <small>${item.label}</small>
            </div>
            <div class="date">${formatMonthKey(item.date)}</div>
          </div>
        `);
      });

    // --- Notizen: nur Notizen mit showInDashboard = true ---
    (state.notes || [])
      .filter((n) => n.showInDashboard !== false)
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .slice(0, 6)
      .forEach((note) => {
        noteItems.push(`
          <div class="mini-list-item">
            <div>
              <div class="title">${escapeHtml(note.title)}</div>
              <small>${note.date ? formatDate(parseDateKey(note.date)) : ""}</small>
            </div>
          </div>
        `);
      });

    // --- Fahrzeuge befüllen ---
    const vehiclesEl = $("#dashboardVehicles");
    if (vehiclesEl) {
      vehiclesEl.innerHTML = vehicleItems.length
        ? vehicleItems.join("")
        : `<div class="mini-list-item"><div><div class="title">Keine Fahrzeugfristen in den nächsten 30 Tagen</div></div></div>`;
    }

    // --- Notizen befüllen ---
    const notesEl = $("#dashboardNotes");
    if (notesEl) {
      notesEl.innerHTML = noteItems.length
        ? noteItems.join("")
        : `<div class="mini-list-item"><div><div class="title">Keine Notizen vorhanden</div></div></div>`;
    }

    bindBirthdayTooltips();
    animateDashboardNumbers($("#dashboard"));
  }

  function getNextWastePickup() {
    const today = dateKey(new Date());
    return getWasteEntries().find((entry) => entry.date >= today) || null;
  }

  function isBueroDept(dept) {
    if (!dept) return false;
    const d = dept.toLowerCase().replace(/ü/g, "u");
    return d === "buero" || d === "buro";
  }

  function renderOfficeGrid() {
    const view = getCurrentMonthView();
    const days = getMonthGridDays(view);
    const holidays = buildHolidayMapForRange(days[0], days[days.length - 1]);
    const officeEmployees = state.employees.filter((e) => e.active && isBueroDept(e.department));
    const trashBadgeMap = buildTrashBadgeMap(days, holidays);
    const todayKey = dateKey(new Date());

    $("#officeCalendarGrid").innerHTML = days.map((day) => {
      const key = dateKey(day);
      const office = state.officePlan[key] || {};
      const special = getSpecialOfficeDay(key);
      const holidayName = holidays[key];
      const sunday = day.getDay() === 0;
      const outside = day.getMonth() !== view.start.getMonth();
      const isClosed = special.mode === "closed";
      const hasCustomHours = special.mode === "custom-hours";
      const customHoursLabel = (special.openingText || "").trim();

      const events = state.events.filter((e) => e.date === key);
      const birthdays = state.employees.filter((e) => e.active && isBirthdayOnDay(e.birthday, day));
      const externalBirthdays = state.externalBirthdays.filter((e) => isBirthdayOnDay(e.birthday, day));
      const trashItems = trashBadgeMap[key] || [];
      const isToday = key === todayKey;

      const primaryEmp = state.employees.find((e) => e.id === office.primaryEmployeeId);
      const secondaryEmp = state.employees.find((e) => e.id === office.secondaryEmployeeId);

      let officeStateClass = "";
      if (!outside && !holidayName && !sunday && !isClosed) {
        if (!office.primaryEmployeeId && !office.secondaryEmployeeId) {
          officeStateClass = "office-empty";
        } else if (primaryEmp?.name === "Daniela Leins" && !office.secondaryEmployeeId) {
          officeStateClass = "office-daniela";
        } else if (primaryEmp?.name === "Yesim Kröll" && !office.secondaryEmployeeId) {
          officeStateClass = "office-yesim";
        } else {
          officeStateClass = "office-filled";
        }
      }

      const primaryOptions = officeEmployees.map((emp) => {
        const vacation = isOnVacation(emp.id, key);
        return `
          <option
            value="${emp.id}"
            ${office.primaryEmployeeId === emp.id ? "selected" : ""}
            ${vacation ? "disabled" : ""}>
            ${escapeHtml(emp.name)}${vacation ? " (Urlaub)" : ""}
          </option>
        `;
      }).join("");

      const secondaryOptions = officeEmployees.map((emp) => {
        const vacation = isOnVacation(emp.id, key);
        return `
          <option
            value="${emp.id}"
            ${office.secondaryEmployeeId === emp.id ? "selected" : ""}
            ${vacation ? "disabled" : ""}>
            ${escapeHtml(emp.name)}${vacation ? " (Urlaub)" : ""}
          </option>
        `;
      }).join("");
      const secondPersonEnabled = !!state.settings.officeSecondPersonEnabled;
      const specialModeEnabled = !!state.settings.officeSpecialModeEnabled;

      let lowerContent = "";

      if (isClosed) {
        lowerContent = `
          <div class="office-closed-note">geschlossen</div>
          <div class="office-selects">
            ${specialModeEnabled ? `
              <select data-office-special data-date="${key}">
                <option value="">Normal</option>
                <option value="closed" selected>Geschlossen</option>
                <option value="custom-hours">Geänderte Zeiten</option>
              </select>
            ` : ""}
          </div>
        `;
      } else if ((sunday && !state.settings.sundaysEditable) || (holidayName && !state.settings.holidaysEditable)) {
        lowerContent = `
          <div class="office-closed-note">geschlossen</div>
        `;
      } else {
        lowerContent = `
          <div class="office-selects">
            <select data-office-role="primary" data-date="${key}">
              <option value="">Niemand</option>
              ${primaryOptions}
            </select>

            ${secondPersonEnabled ? `
              <select data-office-role="secondary" data-date="${key}">
                <option value="">2. Person optional</option>
                ${secondaryOptions}
              </select>
            ` : ""}

            ${specialModeEnabled ? `
              <select data-office-special data-date="${key}">
                <option value="" ${!special.mode ? "selected" : ""}>Normal</option>
                <option value="closed" ${special.mode === "closed" ? "selected" : ""}>Geschlossen</option>
                <option value="custom-hours" ${special.mode === "custom-hours" ? "selected" : ""}>Geänderte Zeiten</option>
              </select>
            ` : ""}

          </div>
        `;
      }

      return `
        <div class="office-day ${holidayName ? "holiday" : ""} ${sunday ? "sunday" : ""} ${day.getDate() === 19 ? "payday" : ""} ${outside ? "outside" : ""} ${isToday ? "today" : ""} ${officeStateClass}" data-day-key="${key}">
          <div class="office-head">
            <div>
              <div class="office-number">${day.getDate()}</div>
              <div class="office-weekday">${day.toLocaleDateString("de-DE", { weekday: "short" })}</div>
            </div>

            <div class="office-flags">
              ${day.getDate() === 19 ? `<span class="tiny-badge payday" title="Abrechnung"><img src="assets/file-invoice-dollar.svg" alt="" aria-hidden="true"></span>` : ""}              ${isClosed ? `<span class="tiny-badge closed">Geschlossen</span>` : ""}
              ${hasCustomHours ? `<span class="tiny-badge custom-hours" title="Geänderte Öffnungszeiten</span>` : ""}
              ${isToday ? `<span class="tiny-badge today">Heute</span>` : ""}
              ${holidayName ? `<span class="tiny-badge holiday" title="${escapeHtml(holidayName)}">Feiertag</span>` : ""}
              ${[...birthdays, ...externalBirthdays].map((b) => `<span class="tiny-badge birthday" title="${escapeHtmlAttr(getBirthdayTooltip(b, day))}">🎂</span>`).join("")}
              ${trashItems.length ? `<span class="office-trash-group">${trashItems.map((s) => `<span class="tiny-badge trash ${getTrashBadgeClass(s)}" title="🗑️ ${escapeHtmlAttr(s)} – rausstellen"><img src="assets/trash.svg" alt="" aria-hidden="true"></span>`).join("")}</span>` : ""}              ${events.length ? `<span class="tiny-badge event" title="${escapeHtml(events.map((e) => e.title).join(", "))}">T</span>` : ""}
              ${officeStateClass === "office-empty" ? `<span class="tiny-badge empty">!</span>` : ""}
            </div>
          </div>

          <div class="office-assigned">
            ${renderOfficeChip(office.primaryEmployeeId)}
            ${renderOfficeChip(office.secondaryEmployeeId)}
          </div>

          ${lowerContent}
        </div>
      `;
    }).join("");

    $("#officeCalendarGrid")
      .querySelectorAll("select[data-office-role]")
      .forEach((el) => el.addEventListener("change", onOfficePlanChange));

    $("#officeCalendarGrid")
      .querySelectorAll("select[data-office-special]")
      .forEach((el) => el.addEventListener("change", onOfficeSpecialChange));

    $("#officeCalendarGrid")
      .querySelectorAll(".office-day")
      .forEach((el) => {
        el.addEventListener("click", (event) => {
          const target = event.target;
          if (target instanceof Element && target.closest("select, input, button")) return;
          state.settings.officeCounterAnchorDate = el.dataset.dayKey;
          saveState();
          renderOfficeCounters();
        });
      });

    $("#officeCalendarGrid")
      .querySelectorAll(".office-day.outside")
      .forEach((el) => {
        el.addEventListener("click", () => {
          const date = parseDateKey(el.dataset.dayKey);
          state.settings.periodAnchor = {
            year: date.getFullYear(),
            month: date.getMonth() + 1
          };
          state.settings.officeCounterAnchorDate = el.dataset.dayKey;
          saveState();
          renderOfficeOnly();
        });
      });

    renderOfficeCounters();
  }

  function getWasteMarkerDate(pickupDateKey) {
    let d = parseDateKey(pickupDateKey);
    d.setDate(d.getDate() - 1);

    while (isBlockedOfficeMarkerDay(d)) {
      d.setDate(d.getDate() - 1);
    }
    return dateKey(d);
  }

  function isBlockedOfficeMarkerDay(date) {
    const key = dateKey(date);
    const holidays = buildHolidayMapForRange(date, date);
    const special = getSpecialOfficeDay(key);

    return date.getDay() === 0 || !!holidays[key] || special.mode === "closed";
  }

  function getWasteEntries() {
    return (state.wasteCalendar?.entries || [])
    .filter((e) => e.date)
    .map((e) => ({
      ...e,
      type: normalizeWasteType(e.type)
    }))
    .sort ((a, b) => a.date.localeCompare(b.date));
  }

  function findCounterByPartialName(counters, partialName) {
    const key = Object.keys(counters).find((k) => k.toLowerCase().includes(partialName.toLowerCase()));
    return key ? counters[key] : null;
  }

  /**
   * Rendert die Yesim-Counter im Büroplan (oberhalb des Monats-Grids).
   *
   * Logik:
   * - Die Counter zeigen den Abrechnungszeitraum des aktuell angezeigten Monats.
   * - Da das Grid immer den Kalendermonat (periodAnchor) zeigt und die Counter
   *   den zugehörigen Abrechnungszeitraum, bleibt das konsistent beim Navigieren.
   * - Beim Start / "Aktueller Monat"-Button: periodAnchor = heute → Counter
   *   zeigen automatisch den aktuell laufenden Abrechnungszeitraum.
   * - Format im Counter: "20.03. – 19.04." (kurzes Datum)
   */
  function renderOfficeCounters() {
    const payroll = getOfficeCounterPayrollPeriod();
    const allActual = calculateOfficeCounters(payroll);
    const allPlanned = calculatePlannedCounters(payroll);
    const actual = findCounterByPartialName(allActual, "Yesim") || { shifts: 0, hours: 0 };
    const planned = findCounterByPartialName(allPlanned, "Yesim") || { shifts: 0, hours: 0 };

    $("#hoursCounters").innerHTML = `
      <div class="counter-card ${actual.hours >= 80 ? "warning" : ""}">
        <div>Yesim · Tatsächlich</div>
        <strong>${actual.shifts} Tage · ${actual.hours} Std.</strong>
        <div class="meta">${payroll.label}</div>
      </div>

      <div class="counter-card ${planned.hours >= 80 ? "warning" : ""}">
        <div>Yesim · Geplant</div>
        <strong>${planned.shifts} Tage · ${planned.hours} Std.</strong>
        <div class="meta">${payroll.label}</div>
      </div>
    `;
  }

  async function onOfficePlanChange(e) {
    const date = e.target.dataset.date;
    const role = e.target.dataset.officeRole;
    const value = e.target.value || "";

    state.settings.officeCounterAnchorDate = date;

    if (!state.officePlan[date]) {
      state.officePlan[date] = { primaryEmployeeId: "", secondaryEmployeeId: "" };
    }

    state.officePlan[date][role === "primary" ? "primaryEmployeeId" : "secondaryEmployeeId"] = value;

    if (
      state.officePlan[date].primaryEmployeeId &&
      state.officePlan[date].primaryEmployeeId === state.officePlan[date].secondaryEmployeeId
    ) {
      if (role === "primary") {
        state.officePlan[date].secondaryEmployeeId = "";
      } else {
        state.officePlan[date].primaryEmployeeId = "";
      }
    }

    saveState();
    await saveOfficePlanToSupabase();
    renderDashboard();
    renderOfficeGrid();
    renderHoursBilling();
    renderMonthlyStats();
    renderYearlyStats();
  }

  function onOfficeSpecialChange(e) {
    const key = e.target.dataset.date;
    const mode = e.target.value;
    state.settings.officeCounterAnchorDate = key;
    const current = getSpecialOfficeDay(key);
    setSpecialOfficeDay(key, { ...current, mode });
    saveState();
    renderOfficeGrid();
    renderHoursBilling();
  }

  function onOfficeHoursInput(e) {
    const key = e.target.dataset.officeHours;
    state.settings.officeCounterAnchorDate = key;
    const current = getSpecialOfficeDay(key);
    setSpecialOfficeDay(key, { ...current, openingText: e.target.value });
    saveState();
  }

  function onOfficeClosedNoteInput(e) {
    const key = e.target.dataset.officeNote;
    state.settings.officeCounterAnchorDate = key;
    const current = getSpecialOfficeDay(key);
    setSpecialOfficeDay(key, { ...current, note: e.target.value });
    saveState();
  }

  function renderEmployeeMonthTrack(employeeId) {
    const selectedDate = parseDateKey(state.settings.attendanceDay || dateKey(new Date()));
    const view = {
      start: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
      end: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
    };

    const days = getMonthDays(view);
    const holidays = buildHolidayMapForRange(view.start, view.end);

    return days.map((day) => {
      const key = dateKey(day);
      const entry = getAttendanceEntry(employeeId, key);
      const status = entry.status || "BLANK";
      const isHoliday = !!holidays[key];
      const isSunday = day.getDay() === 0;
      const isSelected = key === (state.settings.attendanceDay || "");
      const isNonCountedVacationDay = status === "U" && isPartTimeNonCountedVacationDay(employeeId, day);
      const label = isNonCountedVacationDay
        ? "Urlaub - zaehlt nicht als Urlaubstag"
        : getTrackLabel(status);
      const content = isNonCountedVacationDay ? "X" : day.getDate();
      const nonCountedStyle = isNonCountedVacationDay
        ? "background:repeating-linear-gradient(135deg, rgba(116,125,136,.24) 0 3px, transparent 3px 7px), #e1e5ea; color:#485260; border:2px solid #76bdf6; height:22px; min-height:22px; font-weight:900;"
        : "";

      return `
        <button
          type="button"
          class="track-day ${getTrackClass(status)} ${isNonCountedVacationDay ? "non-counted-vacation-track" : ""} ${isSunday ? "sunday-track" : ""} ${isHoliday ? "holiday-track" : ""} ${isSelected ? "selected-track" : ""}"
          title="${day.getDate()}.${day.getMonth() + 1}. - ${isHoliday ? holidays[key] + " · " : ""}${label}"
          style="${nonCountedStyle}"
          data-track-date="${key}">
          <span>${content}</span>
        </button>
      `;
    }).join("");
  }

  function getTrackClass(status) {
    return {
      A: "a",
      U: "u",
      K: "k",
      S: "s",
      F: "f",
      SO: "so",
      BLANK: "blank"
    }[status] || "blank";
  }

  function getTrackLabel(status) {
    return {
      A: "Anwesend",
      U: "Urlaub",
      K: "Krank",
      S: "Sonstiges",
      F: "Feiertag",
      SO: "Sonntag",
      BLANK: "Leer"
    }[status] || "Leer";
  }

  function renderDailyAttendance() {
    const key = state.settings.attendanceDay || dateKey(new Date());
    const hiddenDayInput = $("#attendanceDayInput");
    if (hiddenDayInput) hiddenDayInput.value = key;
    renderAttendanceMonthTitle();
    const selectedDateObj = parseDateKey(key);
    const holidayMap = buildHolidayMapForRange(selectedDateObj, selectedDateObj);
    const holidayName = holidayMap[key] || "";
    const specialDay = getSpecialOfficeDay(key);
    const isSundayDay = selectedDateObj.getDay() === 0;
    const isClosedDay = specialDay.mode === "closed";
    const isBlockedDay = isSundayDay || !!holidayName || isClosedDay;
    $("#dailyHints").innerHTML = `
      <span class="pill blank">Leer = noch nichts erfasst</span>
      ${isBlockedDay ? `<span class="pill f">${escapeHtml(isClosedDay ? "Geschlossen im Büroplan" : holidayName || "Sonntag")} · keine Erfassung möglich</span>` : ""}
    `;

    const employees = state.employees
      .filter((e) => e.active);

    // Prüfen ob der angezeigte Tag ein Sonntag ist (Punkt 16: Sonntage etwas dunkler)
    $("#dailyAttendanceBoard").innerHTML = employees
      .map((emp) => {
        const entry = getAttendanceEntry(emp.id, key);
        const isNonCountedVacationDay = entry.status === "U" && isPartTimeNonCountedVacationDay(emp.id, selectedDateObj);
        const nonCountedStyle = isNonCountedVacationDay
          ? "background:linear-gradient(135deg, transparent calc(50% - 2px), rgba(102,113,127,.58) 50%, transparent calc(50% + 2px)), repeating-linear-gradient(135deg, rgba(116,125,136,.12) 0 8px, transparent 8px 16px), #e8ebef; border:2px solid #76bdf6; box-shadow:0 0 0 3px rgba(118,189,246,.18);"
          : "";

        return `
          <div class="daily-row ${entry.status === "S" ? "show-note" : ""} ${isNonCountedVacationDay ? "non-counted-vacation-attendance" : ""} ${isSundayDay ? "sunday-attendance" : ""} ${holidayName ? "holiday-attendance" : ""} ${isClosedDay ? "closed-attendance" : ""}" style="${nonCountedStyle}" data-employee-id="${emp.id}">
            <div class="daily-employee">
              <strong>${escapeHtml(emp.name)}</strong>
              <small>${isBueroDept(emp.department) ? "Büro" : "Lager"}${emp.phone ? " · " + escapeHtml(emp.phone) : ""}${isNonCountedVacationDay ? " · zaehlt nicht als Urlaubstag" : ""}</small>
            </div>

            <div class="daily-controls">
              <select data-attendance-status data-employee="${emp.id}" ${isBlockedDay ? "disabled" : ""}>
                <option value="" ${entry.status === "" ? "selected" : ""}>— leer —</option>
                ${["A", "U", "K", "S"].map((s) => `<option value="${s}" ${entry.status === s ? "selected" : ""}>${statusLabel(s)}</option>`).join("")}
              </select>

              <input
                class="daily-note"
                type="text"
                placeholder="${isBlockedDay ? "An diesem Tag gesperrt" : "Notiz für Sonstiges"}"
                data-attendance-note
                data-employee="${emp.id}"
                ${isBlockedDay ? "disabled" : ""}
                value="${entry.status === "S" ? escapeHtmlAttr(entry.note || "") : ""}">
            </div>

            <div class="daily-month-track">
              ${renderEmployeeMonthTrack(emp.id)}
            </div>
          </div>
        `;
      })
      .join("");

    $("#dailyAttendanceBoard")
      .querySelectorAll("[data-attendance-status]")
      .forEach((el) => el.addEventListener("change", onAttendanceStatusChange));

    $("#dailyAttendanceBoard")
      .querySelectorAll("[data-attendance-note]")
      .forEach((el) => el.addEventListener("input", onAttendanceNoteChange));

    $("#dailyAttendanceBoard")
      .querySelectorAll("[data-track-date]")
      .forEach((el) => {
        el.addEventListener("click", () => {
          state.settings.attendanceDay = el.dataset.trackDate;
          saveState();
          renderAttendanceMonthTitle();
          renderDailyAttendance();
        });
      });
  }

  function renderVacationPlanner() {
    const year = Number($("#vacationPlanYearSelect")?.value || state.settings.vacationPlanYear || new Date().getFullYear());
    const target = $("#vacationPlanGrid");
    if (!target) return;

    const people = [
      ...state.employees
        .filter((e) => e.active)
        .map((emp) => ({ id: emp.id, name: emp.name, type: "employee" })),
      ...state.externalBirthdays
        .map((boss) => ({ id: boss.id, name: boss.name || "Geschaeftsfuehrung", type: "boss" }))
    ];

    target.innerHTML = Array.from({ length: 12 }, (_, month) => renderVacationMonthCard(year, month, people)).join("");

    target.querySelectorAll("[data-management-vacation]").forEach((el) =>
      el.addEventListener("click", () => {
        const bossId = el.dataset.bossId;
        const key = el.dataset.date;
        if (!bossId || !key) return;
        cycleManagementAttendance(bossId, key);
      })
    );
  }

  function renderVacationMonthCard(year, month, people) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const days = getMonthDays({ start, end });
    const holidays = buildHolidayMapForRange(start, end);

    const bars = buildVacationBarsForMonth(people, days);
    const hoverMap = buildVacationHoverMap(days, bars);
    const header = days.map((day) => renderVacationDayHead(day, holidays, hoverMap)).join("");

    return `
      <section class="vacation-month-card">
        <div class="vacation-month-title">${start.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}</div>
        <div class="vacation-month-grid" style="--vac-days:${days.length}">
          ${header}
        </div>
      </section>
    `;
  }

  function renderVacationDayCell(person, day, holidays) {
    const key = dateKey(day);
    const holidayName = holidays[key];
    const sunday = day.getDay() === 0;
    const status = person.type === "boss"
      ? (getManagementAttendanceEntry(person.id, key)?.status || "")
      : (getAttendanceEntry(person.id, key)?.status || "");

    const classes = ["vacation-cell"];
    if (status === "U") classes.push("urlaub");
    else if (status === "K") classes.push("krank");
    else if (holidayName) classes.push("holiday");
    else if (sunday) classes.push("sunday");

    const titleBits = [person.name, formatDate(day)];
    if (holidayName) titleBits.push(holidayName);
    if (status === "U") titleBits.push("Urlaub");
    if (status === "K") titleBits.push("Krank");

    const content = status === "U" ? "U" : status === "K" ? "K" : "";

    if (person.type === "boss" && !holidayName && !sunday) {
      return `
        <button
          type="button"
          class="${classes.join(" ")} boss-editable"
          data-management-status="1"
          data-boss-id="${person.id}"
          data-date="${key}"
          title="${escapeHtmlAttr(titleBits.join(" · "))}">
          ${content}
        </button>
      `;
    }

    return `
      <div class="${classes.join(" ")}" title="${escapeHtmlAttr(titleBits.join(" · "))}">
        ${content}
      </div>
    `;
  }

  function renderVacationDayHead(day, holidays, hoverMap) {
    const key = dateKey(day);
    const holidayName = holidays[key];
    const sunday = day.getDay() === 0;
    const saturday = day.getDay() === 6;
    const selectedBossId = state.settings.vacationPlanBossId || "";
    const bossStatus = selectedBossId ? (getManagementAttendanceEntry(selectedBossId, key)?.status || "") : "";
    const vacationInfo = hoverMap[key] || [];
    const dayHasVacation = vacationInfo.length > 0;
    const showVacationHighlight = !holidayName && !sunday && !saturday;

    const classes = ["vacation-day-head"];
    if (showVacationHighlight && (bossStatus === "U" || dayHasVacation)) classes.push("urlaub");
    if (holidayName) classes.push("holiday");
    else if (sunday) classes.push("sunday");
    else if (saturday) classes.push("saturday");

    const titleBits = [formatDate(day)];
    if (holidayName) titleBits.push(holidayName);
    if (bossStatus === "U") titleBits.push("Urlaub");
    vacationInfo.forEach((entry) => {
      if (entry.partTimeQuota) {
        titleBits.push(`${entry.personName}: ${entry.fromLabel} bis ${entry.toLabel} (Tage: ${entry.displayDays} · Urlaubstage: ${entry.vacationDays})`);
      } else {
        titleBits.push(`${entry.personName}: ${entry.fromLabel} bis ${entry.toLabel} (${entry.vacationDays} Urlaubstag${entry.vacationDays === 1 ? "" : "e"})`);
      }
    });

    if (selectedBossId && !holidayName && !sunday && !saturday) {
      return `
        <button
          type="button"
          class="${classes.join(" ")} boss-editable"
          data-management-vacation="1"
          data-boss-id="${selectedBossId}"
          data-date="${key}"
          title="${escapeHtmlAttr(titleBits.join(" · "))}">
          ${day.getDate()}
        </button>
      `;
    }

    return `<div class="${classes.join(" ")}" title="${escapeHtmlAttr(titleBits.join(" · "))}">${day.getDate()}</div>`;
  }

  function buildVacationBarsForMonth(people, days) {
    const bars = [];
    const holidays = buildHolidayMapForRange(days[0], days[days.length - 1]);

    people.forEach((person) => {
      let currentBar = null;

      days.forEach((day, index) => {
        const key = dateKey(day);
        const status = person.type === "boss"
          ? (getManagementAttendanceEntry(person.id, key)?.status || "")
          : (getAttendanceEntry(person.id, key)?.status || "");
        const ignoredGapDay = isVacationIgnoredGapDay(day, holidays);

        if (status === "U") {
          const countedVacationDay = !isVacationIgnoredGapDay(day, holidays);
          if (!currentBar) {
            currentBar = {
              personName: person.name,
              partTimeQuota: getPartTimeVacationQuota(person.id),
              startDay: index + 1,
              endDay: index + 1,
              startKey: key,
              endKey: key,
              displayEndKey: countedVacationDay ? key : "",
              displayDays: countedVacationDay ? 1 : 0,
              countedDayKeys: countedVacationDay ? [key] : [],
              vacationDays: countedVacationDay ? 1 : 0
            };
            bars.push(currentBar);
          } else {
            currentBar.endDay = index + 1;
            currentBar.endKey = key;
            if (countedVacationDay) {
              currentBar.displayDays += 1;
              currentBar.countedDayKeys.push(key);
              currentBar.vacationDays += 1;
              currentBar.displayEndKey = key;
            }
          }
        } else if (currentBar && ignoredGapDay) {
          currentBar.endDay = index + 1;
          currentBar.endKey = key;
        } else {
          currentBar = null;
        }
      });
    });

    bars.forEach((bar) => {
      if (!bar.partTimeQuota) return;
      const usedByWeek = {};

      (bar.countedDayKeys || []).forEach((key) => {
        const weekKey = getVacationWeekKey(parseDateKey(key));
        usedByWeek[weekKey] = Math.min((usedByWeek[weekKey] || 0) + 1, bar.partTimeQuota);
      });

      bar.vacationDays = Object.values(usedByWeek).reduce((sum, value) => sum + value, 0);
    });

    return bars;
  }

  function buildVacationHoverMap(days, bars) {
    const map = Object.fromEntries(days.map((day) => [dateKey(day), []]));

    bars.forEach((bar) => {
      const fromLabel = formatDate(parseDateKey(bar.startKey));
      const toLabel = formatDate(parseDateKey(bar.displayEndKey || bar.startKey));

      days.forEach((day) => {
        const key = dateKey(day);
        if (key < bar.startKey || key > bar.endKey) return;
        map[key].push({
          personName: bar.personName,
          partTimeQuota: bar.partTimeQuota || 0,
          fromLabel,
          toLabel,
          displayDays: bar.displayDays,
          vacationDays: bar.vacationDays
        });
      });
    });

    return map;
  }

  function renderVacationBar(bar, row) {
    return `
      <div
        class="vacation-bar"
        style="grid-column:${bar.startDay} / ${bar.endDay + 1}; grid-row:${row};"
        title="${escapeHtmlAttr(`${bar.personName} · ${bar.startKey} bis ${bar.endKey}`)}">
        ${escapeHtml(bar.personName)}
      </div>
    `;
  }

  function getManagementAttendanceEntry(bossId, key) {
    return state.managementAttendance?.[bossId]?.[key] || null;
  }

  function renderVacationBar(bar, row) {
    const fromLabel = formatDate(parseDateKey(bar.startKey));
    const toLabel = formatDate(parseDateKey(bar.endKey));
    const vacationDayLabel = `${bar.vacationDays} Urlaubstag${bar.vacationDays === 1 ? "" : "e"}`;
    const title = `${bar.personName} - ${fromLabel} bis ${toLabel} - ${vacationDayLabel}`;
    return `
      <div
        class="vacation-bar"
        style="grid-column:${bar.startDay} / ${bar.endDay + 1}; grid-row:${row};"
        title="${escapeHtmlAttr(title)}"></div>
    `;
  }

  function isVacationIgnoredGapDay(day, holidays) {
    const key = dateKey(day);
    return day.getDay() === 0 || day.getDay() === 6 || !!holidays[key];
  }

  function setManagementAttendanceEntry(bossId, key, entry) {
    if (!state.managementAttendance) state.managementAttendance = {};
    if (!state.managementAttendance[bossId]) state.managementAttendance[bossId] = {};
    state.managementAttendance[bossId][key] = entry;
  }

  function clearManagementAttendanceEntry(bossId, key) {
    if (!state.managementAttendance?.[bossId]) return;
    delete state.managementAttendance[bossId][key];
  }

  function cycleManagementAttendance(bossId, key) {
    const current = getManagementAttendanceEntry(bossId, key)?.status || "";
    const next = current === "" ? "U" : "";

    if (!next) clearManagementAttendanceEntry(bossId, key);
    else setManagementAttendanceEntry(bossId, key, { status: next, note: "" });

    saveState();
    renderVacationPlanner();
  }

  function onAttendanceStatusChange(e) {
    const employeeId = e.target.dataset.employee;
    const date = state.settings.attendanceDay;
    const status = e.target.value;

    if (!status) {
      clearAttendanceEntry(employeeId, date);
    } else {
      const old = getRawAttendanceEntry(employeeId, date) || { status, note: "" };
      setAttendanceEntry(employeeId, date, {
        status,
        note: status === "S" ? old.note || "" : ""
      });
    }

    saveState();
    renderDailyAttendance();
    renderDashboard();
    renderOfficeCounters();
    renderHoursBilling();
    renderMonthlyStats();
    renderYearlyStats();
  }

  function onAttendanceNoteChange(e) {
    const employeeId = e.target.dataset.employee;
    const date = state.settings.attendanceDay;
    const old = getRawAttendanceEntry(employeeId, date) || { status: "S", note: "" };
    setAttendanceEntry(employeeId, date, { ...old, note: e.target.value });
    saveState();
  }

  function renderEmployeesAdmin() {
    const tpl = $("#employeeCardTemplate");
    const list = $("#employeesAdminList");
    const searchInput = $("#employeeSearchInput");
    const currentYear = new Date().getFullYear();
    if (searchInput && searchInput.value !== employeeAdminSearchTerm) {
      searchInput.value = employeeAdminSearchTerm;
    }

    list.innerHTML = "";

    const filteredEmployees = state.employees
      .filter((employee) => matchesEmployeeAdminSearch(employee, employeeAdminSearchTerm));

    list.appendChild(buildEmployeeAdminSection(
      `Aktive Mitarbeiter (${filteredEmployees.filter((employee) => employee.active !== false).length})`,
      filteredEmployees.filter((employee) => employee.active !== false),
      currentYear,
      employeeAdminSearchTerm ? "Keine aktiven Treffer." : "Keine aktiven Mitarbeiter vorhanden."
    ));

    list.appendChild(buildEmployeeAdminSection(
      `Inaktive Mitarbeiter (${filteredEmployees.filter((employee) => employee.active === false).length})`,
      filteredEmployees.filter((employee) => employee.active === false),
      currentYear,
      employeeAdminSearchTerm ? "Keine inaktiven Treffer." : "Keine inaktiven Mitarbeiter vorhanden."
    ));

    function buildEmployeeAdminSection(title, employees, year, emptyText) {
      const section = document.createElement("section");
      section.className = "employee-admin-section";
      section.innerHTML = `
        <div class="employee-admin-section-head">
          <h3>${escapeHtml(title)}</h3>
        </div>
        <div class="admin-header-row employee-admin-header">
          <div></div>
          <div>Name</div>
          <div>Bereich</div>
          <div>Telefon</div>
          <div>Eintritt</div>
          <div>Geburtstag</div>
          <div>Status</div>
          <div>Urlaub/Jahr</div>
          <div>Resturlaub</div>
          <div></div>
        </div>
      `;

      const body = document.createElement("div");
      body.className = "employee-admin-list";

      if (!employees.length) {
        const empty = document.createElement("div");
        empty.className = "employee-admin-empty";
        empty.textContent = emptyText;
        body.appendChild(empty);
      } else {
        employees.forEach((employee) => {
          const node = tpl.content.firstElementChild.cloneNode(true);
          node.dataset.id = employee.id;
          node.dataset.activeGroup = employee.active !== false ? "active" : "inactive";

          setField(node, "name", employee.name);
          setField(node, "department", employee.department === "Buero" ? "Büro" : employee.department);
          setField(node, "phone", employee.phone || "");
          setField(node, "entryDate", employee.entryDate ? formatDate(parseDateKey(employee.entryDate)) : "");
          setField(node, "birthday", employee.birthday ? formatDate(parseDateKey(employee.birthday)) : "");
          setField(node, "active", employee.active !== false ? "Aktiv" : "Inaktiv");
          setField(node, "vacationAllowance", String(employee.vacationAllowance ?? 0));
          setField(node, "vacationCarryover", getVacationCarryoverForYear(employee, year));

          const dragHandle = node.querySelector(".drag-handle");
          if (dragHandle) {
            const dragDisabled = !!employeeAdminSearchTerm;
            dragHandle.disabled = dragDisabled;
            dragHandle.title = dragDisabled
              ? "Drag & Drop ist bei aktiver Suche deaktiviert"
              : "Reihenfolge ändern";
          }

          node.querySelector('[data-action="edit"]').addEventListener("click", () => openEmployeeEditModal(employee.id, year));
          bindEmployeeAdminDragAndDrop(node);

          body.appendChild(node);
        });
      }

      section.appendChild(body);
      return section;
    }
  }

  function addEmployee() {
    const employee = {
      id: uid(),
      name: "Neuer Mitarbeiter",
      department: "Lager",
      phone: "",
      entryDate: "",
      birthday: "",
      active: true,
      notes: "",
      vacationAllowance: 24,
      vacationCarryoverByYear: {}
    };
    state.employees.push(employee);
    saveState();
    renderEmployeesAdmin();
    openEmployeeEditModal(employee.id, new Date().getFullYear());
  }

  function openEmployeeEditModal(id, year = new Date().getFullYear()) {
    const emp = state.employees.find((employee) => employee.id === id);
    const modal = $("#employeeEditModal");
    const nameInput = $("#employeeEditNameInput");
    const departmentInput = $("#employeeEditDepartmentInput");
    const phoneInput = $("#employeeEditPhoneInput");
    const entryDateInput = $("#employeeEditEntryDateInput");
    const birthdayInput = $("#employeeEditBirthdayInput");
    const activeInput = $("#employeeEditActiveInput");
    const vacationAllowanceInput = $("#employeeEditVacationAllowanceInput");
    const vacationCarryoverInput = $("#employeeEditVacationCarryoverInput");
    const saveBtn = $("#employeeEditSave");
    const deleteBtn = $("#employeeEditDelete");
    if (!emp || !modal || !nameInput || !departmentInput || !phoneInput || !entryDateInput || !birthdayInput || !activeInput || !vacationAllowanceInput || !vacationCarryoverInput || !saveBtn || !deleteBtn) return;

    nameInput.value = emp.name || "";
    departmentInput.value = emp.department || "Lager";
    phoneInput.value = emp.phone || "";
    entryDateInput.value = emp.entryDate || "";
    birthdayInput.value = emp.birthday || "";
    activeInput.value = emp.active !== false ? "true" : "false";
    vacationAllowanceInput.value = String(emp.vacationAllowance ?? 0);
    vacationCarryoverInput.value = String(getVacationCarryoverForYear(emp, year));
    modal.classList.remove("hidden");
    setTimeout(() => nameInput.focus(), 0);

    const cleanup = () => {
      modal.classList.add("hidden");
      saveBtn.onclick = null;
      deleteBtn.onclick = null;
    };

    saveBtn.onclick = () => {
      emp.name = nameInput.value.trim() || "Ohne Namen";
      emp.department = departmentInput.value || "Lager";
      emp.phone = phoneInput.value.trim();
      emp.entryDate = entryDateInput.value || "";
      emp.birthday = birthdayInput.value || "";
      emp.active = activeInput.value === "true";
      emp.vacationAllowance = Number(vacationAllowanceInput.value || 0);
      setVacationCarryoverForYear(emp, year, vacationCarryoverInput.value);
      saveState();
      cleanup();
      renderAll();
    };

    deleteBtn.onclick = () => {
      state.employees = state.employees.filter((employee) => employee.id !== id);
      delete state.attendance[id];

      Object.keys(state.officePlan).forEach((date) => {
        if (state.officePlan[date]?.primaryEmployeeId === id) state.officePlan[date].primaryEmployeeId = "";
        if (state.officePlan[date]?.secondaryEmployeeId === id) state.officePlan[date].secondaryEmployeeId = "";
      });

      saveState();
      cleanup();
      renderAll();
    };
  }

  function bindEmployeeAdminDragAndDrop(node) {
    const handle = node.querySelector(".drag-handle");
    if (!handle) return;
    handle.addEventListener("pointerdown", (event) => {
      if (employeeAdminSearchTerm) return;
      if (event.button !== 0) return;
      startEmployeeAdminPointerDrag(node, handle, event);
    });
  }

  function startEmployeeAdminPointerDrag(node, handle, event) {
    const list = node.parentElement;
    if (!list) return;

    event.preventDefault();
    handle.setPointerCapture?.(event.pointerId);
    node.classList.add("dragging");
    document.body.classList.add("employee-drag-active");

    employeeAdminPointerDrag = {
      pointerId: event.pointerId,
      row: node,
      handle,
      list,
      group: node.dataset.activeGroup || "",
      moved: false
    };

    const onPointerMove = (moveEvent) => {
      if (!employeeAdminPointerDrag || moveEvent.pointerId !== employeeAdminPointerDrag.pointerId) return;
      employeeAdminPointerDrag.moved = true;

      const target = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest(".employee-admin-row");
      $$(".employee-admin-row").forEach((row) => row.classList.remove("drag-over"));

      if (!target || target === employeeAdminPointerDrag.row) return;
      if (target.parentElement !== employeeAdminPointerDrag.list) return;
      if (target.dataset.activeGroup !== employeeAdminPointerDrag.group) return;

      const rect = target.getBoundingClientRect();
      const insertBefore = moveEvent.clientY < rect.top + rect.height / 2;
      target.classList.add("drag-over");

      if (insertBefore) {
        employeeAdminPointerDrag.list.insertBefore(employeeAdminPointerDrag.row, target);
      } else {
        employeeAdminPointerDrag.list.insertBefore(employeeAdminPointerDrag.row, target.nextElementSibling);
      }
    };

    const finishDrag = (upEvent) => {
      if (!employeeAdminPointerDrag || upEvent.pointerId !== employeeAdminPointerDrag.pointerId) return;

      employeeAdminPointerDrag.handle.releasePointerCapture?.(employeeAdminPointerDrag.pointerId);
      employeeAdminPointerDrag.row.classList.remove("dragging");
      document.body.classList.remove("employee-drag-active");
      $$(".employee-admin-row").forEach((row) => row.classList.remove("drag-over"));

      const group = employeeAdminPointerDrag.group;
      const orderedIds = Array.from(employeeAdminPointerDrag.list.querySelectorAll(".employee-admin-row"))
        .map((row) => row.dataset.id)
        .filter(Boolean);

      employeeAdminPointerDrag = null;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);

      if (!orderedIds.length) return;
      persistEmployeeAdminOrder(group, orderedIds);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
  }

  function persistEmployeeAdminOrder(group, orderedIds) {
    const wantedActive = group === "active";
    const groupIds = state.employees
      .filter((employee) => (employee.active !== false) === wantedActive)
      .map((employee) => employee.id);

    if (orderedIds.length !== groupIds.length) return;

    const orderedIdSet = new Set(orderedIds);
    if (groupIds.some((id) => !orderedIdSet.has(id))) return;

    const reorderedGroupEmployees = orderedIds
      .map((id) => state.employees.find((employee) => employee.id === id))
      .filter(Boolean);

    const otherEmployees = state.employees.filter((employee) => (employee.active !== false) !== wantedActive);
    state.employees = wantedActive
      ? [...reorderedGroupEmployees, ...otherEmployees]
      : [...otherEmployees, ...reorderedGroupEmployees];

    saveState();
    renderEmployeesAdmin();
  }

  function showConfirm(text, onConfirm) {
    const modal = $("#confirmModal");
    const box = modal.querySelector(".confirm-box");
    const textEl = $("#confirmText");
    const okBtn = $("#confirmOk");
    const cancelBtn = $("#confirmCancel");

    textEl.textContent = text;
    modal.classList.remove("hidden");

    const cleanup = () => {
      modal.classList.add("hidden");
      okBtn.onclick = null;
      cancelBtn.onclick = null;
      modal.onclick = null;
    };

    okBtn.onclick = () => {
      cleanup();
      onConfirm();
    };

    cancelBtn.onclick = cleanup;

    modal.onclick = (e) => {
      if (!box.contains(e.target)) {
        cleanup();
      }
    };
  }

  function getNewPricesStatus() {
    const currentOfficeSignature = getCurrentOfficeSignature();
    const confirmedOfficeSignature = state.settings.newPricesConfirmedOfficeSignature || "";
    const hasPriceDate = !!state.settings.newPricesDate;
    const officeNeedsConfirmation = hasPriceDate
      && !!currentOfficeSignature
      && currentOfficeSignature !== confirmedOfficeSignature;
    const manuallyActive = state.settings.newPricesActive === true;
    const needsAttention = manuallyActive || officeNeedsConfirmation;
    const officeLabel = getCurrentOfficeLabel();

    return {
      needsAttention,
      officeLabel,
      title: needsAttention
        ? "Neue Preise bestätigen und ausschalten"
        : "Neue Preisänderung mit heutigem Datum eintragen"
    };
  }

  function acknowledgeNewPricesForCurrentOffice() {
    state.settings.newPricesActive = false;
    state.settings.newPricesConfirmedOfficeSignature = getCurrentOfficeSignature();
    saveState();
  }

  function triggerNewPricesAction() {
    const status = getNewPricesStatus();
    if (status.needsAttention) {
      acknowledgeNewPricesForCurrentOffice();
      renderDashboard();
      return;
    }

    showNewPricesDateModal(dateKey(new Date()));
  }

  function getCurrentOfficeSignature() {
    const office = state.officePlan?.[dateKey(new Date())] || {};
    return [office.primaryEmployeeId, office.secondaryEmployeeId]
      .filter(Boolean)
      .sort()
      .join("|");
  }

  function getCurrentOfficeLabel() {
    const office = state.officePlan?.[dateKey(new Date())] || {};
    const names = [office.primaryEmployeeId, office.secondaryEmployeeId]
      .filter(Boolean)
      .map((id) => state.employees.find((emp) => emp.id === id)?.name)
      .filter(Boolean);

    return names.length ? names.join(" + ") : "";
  }

  function showNewPricesDateModal(defaultDateKey) {
    const modal = $("#newPricesModal");
    const box = modal?.querySelector(".confirm-box");
    const input = $("#newPricesDateInput");
    const saveBtn = $("#newPricesSave");
    const cancelBtn = $("#newPricesCancel");
    if (!modal || !box || !input || !saveBtn || !cancelBtn) return;

    input.value = defaultDateKey;
    modal.classList.remove("hidden");
    setTimeout(() => input.focus(), 0);

    const cleanup = () => {
      modal.classList.add("hidden");
      saveBtn.onclick = null;
      cancelBtn.onclick = null;
      modal.onclick = null;
      input.onkeydown = null;
    };

    const save = () => {
      const selectedDate = parseDateKey(input.value);
      if (!input.value || Number.isNaN(selectedDate.getTime())) {
        input.classList.add("input-error");
        return;
      }

      input.classList.remove("input-error");
      state.settings.newPricesDate = selectedDate.toISOString();
      state.settings.newPricesActive = true;
      state.settings.newPricesConfirmedOfficeSignature = "";
      state.settings.newPricesUntil = "";
      saveState();
      cleanup();
      renderDashboard();
    };

    saveBtn.onclick = save;
    cancelBtn.onclick = cleanup;
    input.onkeydown = (event) => {
      if (event.key === "Enter") save();
      if (event.key === "Escape") cleanup();
    };
    modal.onclick = (event) => {
      if (!box.contains(event.target)) cleanup();
    };
  }

  function deleteEmployee(id) {
    const emp = state.employees.find((e) => e.id === id);
    if (!emp) return;

    showConfirm(`${emp.name} wirklich löschen?`, () => {
      state.employees = state.employees.filter((e) => e.id !== id);
      delete state.attendance[id];

      Object.keys(state.officePlan).forEach((date) => {
        if (state.officePlan[date]?.primaryEmployeeId === id) state.officePlan[date].primaryEmployeeId = "";
        if (state.officePlan[date]?.secondaryEmployeeId === id) state.officePlan[date].secondaryEmployeeId = "";
      });

      saveState();
      renderAll();
    });
  }

  function renderEventsAdmin() {
    const tpl = $("#eventCardTemplate");
    const list = $("#eventsAdminList");
    list.innerHTML = "";

    state.events
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((item) => {
        const node = tpl.content.firstElementChild.cloneNode(true);
        node.dataset.id = item.id;

        setField(node, "title", item.title);
        setField(node, "date", item.date ? formatDate(parseDateKey(item.date)) : "");
        setField(node, "type", item.type);
        setField(node, "notes", item.notes || "");

        node.querySelector('[data-action="edit"]').addEventListener("click", () => openEventEditModal(item.id));

        list.appendChild(node);
      });
  }

  function addEvent() {
    const item = {
      id: uid(),
      title: "Neuer Termin",
      date: dateKey(new Date()),
      type: "Veranstaltung",
      notes: ""
    };
    state.events.push(item);
    saveState();
    renderEventsAdmin();
    openEventEditModal(item.id);
  }

  function openEventEditModal(id) {
    const item = state.events.find((event) => event.id === id);
    const modal = $("#eventEditModal");
    const titleInput = $("#eventEditTitleInput");
    const dateInput = $("#eventEditDateInput");
    const typeInput = $("#eventEditTypeInput");
    const notesInput = $("#eventEditNotesInput");
    const deleteBtn = $("#eventEditDelete");
    const saveBtn = $("#eventEditSave");
    if (!item || !modal || !titleInput || !dateInput || !typeInput || !notesInput || !deleteBtn || !saveBtn) return;

    titleInput.value = item.title || "";
    dateInput.value = item.date || "";
    typeInput.value = item.type || "Veranstaltung";
    notesInput.value = item.notes || "";
    modal.classList.remove("hidden");
    setTimeout(() => titleInput.focus(), 0);

    const cleanup = () => {
      modal.classList.add("hidden");
      deleteBtn.onclick = null;
      saveBtn.onclick = null;
    };

    saveBtn.onclick = () => {
      item.title = titleInput.value.trim() || "Ohne Titel";
      item.date = dateInput.value || "";
      item.type = typeInput.value || "Veranstaltung";
      item.notes = notesInput.value.trim();
      saveState();
      cleanup();
      renderAll();
    };

    deleteBtn.onclick = () => {
      state.events = state.events.filter((event) => event.id !== id);
      saveState();
      cleanup();
      renderAll();
    };
  }

  function deleteEvent(id) {
    const item = state.events.find((e) => e.id === id);
    if (!item) return;
    state.events = state.events.filter((e) => e.id !== id);
    saveState();
    renderAll();
  }

  function renderVehiclesAdmin() {
    const tpl = $("#vehicleCardTemplate");
    const list = $("#vehiclesAdminList");
    if (!tpl || !list) return;
    renderVehicleTypeTabs();
    renderVehicleDeadlineSummary(state.vehicles);

    const currentTab = getCurrentVehicleTab();
    const visibleVehicles = getVehiclesForTab(currentTab);

    list.innerHTML = "";

    if (!visibleVehicles.length) {
      list.innerHTML = `<div class="vehicle-admin-empty">Keine Fahrzeuge in dieser Kategorie.</div>`;
      return;
    }

    visibleVehicles.forEach((vehicle) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.id = vehicle.id;

      setField(node, "name", vehicle.name || "");

      const badge = node.querySelector('[data-role="type-badge"]');
      if (badge) badge.textContent = getVehicleTypeMeta(vehicle.type).label;

      const fieldsHost = node.querySelector('[data-role="fields"]');
      if (fieldsHost) {
        fieldsHost.innerHTML = getVehicleFieldConfigs(vehicle)
          .map((field) => `
            <label class="vehicle-field">
              <span>${escapeHtml(field.label)}</span>
              <input data-field="${field.field}" type="text" readonly>
            </label>
          `)
          .join("");
      }

      getVehicleFieldConfigs(vehicle).forEach((field) => {
        const value = field.type === "month"
          ? formatVehicleMonthLabel(vehicle[field.field] || "")
          : vehicle[field.field]
            ? formatDate(parseDateKey(vehicle[field.field]))
            : "";
        setField(node, field.field, value);
      });

      const pdfOpenBtn = node.querySelector('[data-action="open-pdf"]');
      if (pdfOpenBtn) {
        const hasPdf = !!vehicle.registrationPdfData;
        pdfOpenBtn.classList.toggle("hidden", !hasPdf);
        if (hasPdf) {
          pdfOpenBtn.title = vehicle.registrationPdfName
            ? `Fahrzeugschein öffnen: ${vehicle.registrationPdfName}`
            : "Fahrzeugschein öffnen";
          pdfOpenBtn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            openVehiclePdf(vehicle.id);
          });
        }
      }

      node.querySelector('[data-action="edit"]')?.addEventListener("click", () => openVehicleEditModal(vehicle.id));

      list.appendChild(node);
    });
  }

  function addVehicle() {
    const currentTab = getCurrentVehicleTab();
    const isInactiveTab = currentTab === "inactive";
    state.vehicles.push({
      id: uid(),
      name: "Neues Fahrzeug",
      type: isInactiveTab ? "pkw" : currentTab,
      tuv: "",
      sp: "",
      tacho: "",
      uvv: "",
      service: "",
      deregistrationDate: isInactiveTab ? dateKey(new Date()) : "",
      registrationPdfName: "",
      registrationPdfData: "",
      active: !isInactiveTab
    });
    saveState();
    renderVehiclesAdmin();
    openVehicleEditModal(state.vehicles[state.vehicles.length - 1].id);
  }

  function normalizeVehicleType(type) {
    const normalized = (type || "").toLowerCase().trim();
    if (normalized === "pkw") return "pkw";
    if (normalized === "anhänger" || normalized === "anhaenger") return "anhaenger";
    if (normalized === "bagger" || normalized === "stapler" || normalized === "maschine" || normalized === "maschinen") return "maschine";
    return "lkw";
  }

  function getVehicleTypeMeta(type) {
    const normalized = normalizeVehicleType(type);
    return {
      pkw: { label: "PKW" },
      lkw: { label: "LKW" },
      anhaenger: { label: "Anhänger" },
      maschine: { label: "Maschine" }
    }[normalized] || { label: "LKW" };
  }

  function getVehicleDeadlineEntries(vehicle) {
    return getVehicleFieldConfigs(vehicle)
      .filter((cfg) => cfg.deadline)
      .map((cfg) => ({ ...cfg, date: vehicle[cfg.field] || "" }))
      .filter((item) => item.date)
      .sort((a, b) => monthKeyToSortValue(a.date) - monthKeyToSortValue(b.date));
  }

  function getVehicleNextDeadline(vehicle) {
    return getVehicleDeadlineEntries(vehicle)[0] || null;
  }

  function renderVehicleDeadlineSummary(vehicles) {
    const summary = $("#vehicleDeadlinesSummary");
    if (!summary) return;

    const today = new Date();
    const in30Days = addDays(today, 30);
    const limitMonth = new Date(in30Days.getFullYear(), in30Days.getMonth(), 1);

    const badges = getUpcomingVehicleDeadlines(20)
      .filter((item) => {
        const dt = parseMonthKey(item.date);
        if (!dt) return false;
        const itemMonth = new Date(dt.getFullYear(), dt.getMonth(), 1);
        return itemMonth <= limitMonth || item.isOverdue;
      })
      .map((item) => {
        const badgeClass = item.isOverdue
          ? " danger"
          : item.isSoon
            ? " warning"
            : "";
        return `
          <div class="vehicle-deadline-badge${badgeClass}">
            <span>${escapeHtml(item.vehicle.name || "Ohne Namen")}</span>
            <span>${escapeHtml(item.label)}</span>
          </div>
        `;
      })
      .filter(Boolean)
      .join("");

    summary.innerHTML = badges || `<div class="vehicle-deadline-badge empty">Keine Fahrzeugfristen hinterlegt</div>`;
  }

  function formatVehicleMonthLabel(monthKey) {
    const date = parseMonthKey(monthKey);
    if (!date) return monthKey;
    return date.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  }

  function renderVehicleTypeTabs() {
    const tabsEl = $("#vehicleTypeTabs");
    if (!tabsEl) return;

    const currentTab = getCurrentVehicleTab();
    tabsEl.innerHTML = getVehicleTabOptions()
      .map((tab) => {
        const count = tab.key === "inactive"
          ? state.vehicles.filter((vehicle) => vehicle.active === false).length
          : state.vehicles.filter((vehicle) => vehicle.active !== false && normalizeVehicleType(vehicle.type) === tab.key).length;
        return `<button class="vehicle-type-tab ${currentTab === tab.key ? "active" : ""}" data-vehicle-tab="${tab.key}">${escapeHtml(tab.label)} <span>${count}</span></button>`;
      })
      .join("");

    tabsEl.querySelectorAll("[data-vehicle-tab]").forEach((button) =>
      button.addEventListener("click", () => {
        state.settings.vehicleTab = button.dataset.vehicleTab || "pkw";
        saveState();
        renderVehiclesAdmin();
      })
    );
  }

  function getCurrentVehicleTab() {
    const tab = state.settings.vehicleTab || "pkw";
    return getVehicleTabOptions().some((item) => item.key === tab) ? tab : "pkw";
  }

  function getVehicleTabOptions() {
    return [
      { key: "pkw", label: "PKW" },
      { key: "lkw", label: "LKW" },
      { key: "anhaenger", label: "Anhänger" },
      { key: "maschine", label: "Maschinen" },
      { key: "inactive", label: "Inaktiv" }
    ];
  }

  function getVehiclesForTab(tabKey) {
    return [...state.vehicles]
      .filter((vehicle) => {
        if (tabKey === "inactive") return vehicle.active === false;
        return vehicle.active !== false && normalizeVehicleType(vehicle.type) === tabKey;
      })
      .sort((a, b) => {
        if (tabKey === "inactive") {
          return (b.deregistrationDate || "").localeCompare(a.deregistrationDate || "") || (a.name || "").localeCompare(b.name || "", "de");
        }
        const aDue = getVehicleNextDeadline(a);
        const bDue = getVehicleNextDeadline(b);
        if (!aDue && !bDue) return (a.name || "").localeCompare(b.name || "", "de");
        if (!aDue) return 1;
        if (!bDue) return -1;
        return monthKeyToSortValue(aDue.date) - monthKeyToSortValue(bDue.date);
      });
  }

  function getVehicleFieldConfigs(vehicle) {
    if (vehicle.active === false) {
      return [
        { field: "deregistrationDate", label: "Abmeldedatum", type: "date" }
      ];
    }

    const type = normalizeVehicleType(vehicle.type);
    if (type === "pkw") {
      return [
        { field: "tuv", label: "TÜV", type: "month", deadline: true },
        { field: "service", label: "Service", type: "month", deadline: true }
      ];
    }
    if (type === "lkw") {
      return [
        { field: "tuv", label: "TÜV", type: "month", deadline: true },
        { field: "sp", label: "SP", type: "month", deadline: true },
        { field: "service", label: "Service", type: "month", deadline: true },
        { field: "tacho", label: "Tachoprüfung", type: "month", deadline: true }
      ];
    }
    if (type === "anhaenger") {
      return [
        { field: "tuv", label: "TÜV", type: "month", deadline: true },
        { field: "sp", label: "SP", type: "month", deadline: true }
      ];
    }
    return [
      { field: "uvv", label: "UVV", type: "month", deadline: true },
      { field: "sp", label: "SP", type: "month", deadline: true }
    ];
  }

  function getAllVehicleManagedFields() {
    return ["tuv", "sp", "tacho", "uvv", "service", "deregistrationDate"];
  }

  function openVehicleEditModal(id) {
    const vehicle = state.vehicles.find((item) => item.id === id);
    const modal = $("#vehicleEditModal");
    const nameInput = $("#vehicleEditNameInput");
    const typeBadge = $("#vehicleEditTypeBadge");
    const fieldsHost = $("#vehicleEditFields");
    const pdfBtn = $("#vehicleEditPdfButton");
    const pdfLabel = $("#vehicleEditPdfLabel");
    const pdfAddBtn = $("#vehicleEditPdfAdd");
    const pdfRemoveBtn = $("#vehicleEditPdfRemove");
    const uploadInput = $("#vehicleEditPdfUpload");
    const toggleBtn = $("#vehicleEditToggleActive");
    const deleteBtn = $("#vehicleEditDelete");
    const saveBtn = $("#vehicleEditSave");
    if (!vehicle || !modal || !nameInput || !typeBadge || !fieldsHost || !pdfBtn || !pdfLabel || !pdfAddBtn || !pdfRemoveBtn || !uploadInput || !toggleBtn || !deleteBtn || !saveBtn) return;

    nameInput.value = vehicle.name || "";
    typeBadge.textContent = getVehicleTypeMeta(vehicle.type).label;
    fieldsHost.innerHTML = getVehicleFieldConfigs(vehicle)
      .map((field) => `
        <label class="vehicle-field">
          <span>${escapeHtml(field.label)}</span>
          <input data-field="${field.field}" type="${field.type}">
        </label>
      `)
      .join("");
    getVehicleFieldConfigs(vehicle).forEach((field) => {
      const fieldEl = fieldsHost.querySelector(`[data-field="${field.field}"]`);
      if (fieldEl) fieldEl.value = vehicle[field.field] || "";
    });

    pdfBtn.classList.toggle("has-file", !!vehicle.registrationPdfData);
    pdfBtn.title = vehicle.registrationPdfData
      ? `Fahrzeugschein öffnen${vehicle.registrationPdfName ? `: ${vehicle.registrationPdfName}` : ""}`
      : "Kein PDF hinterlegt";
    pdfBtn.disabled = !vehicle.registrationPdfData;
    pdfLabel.textContent = vehicle.registrationPdfName || "Kein Fahrzeugschein hinterlegt";
    pdfRemoveBtn.classList.toggle("hidden", !vehicle.registrationPdfData);
    toggleBtn.textContent = vehicle.active === false ? "Reaktivieren" : "Inaktiv setzen";
    uploadInput.value = "";
    modal.classList.remove("hidden");
    setTimeout(() => nameInput.focus(), 0);

    const cleanup = () => {
      modal.classList.add("hidden");
      pdfBtn.onclick = null;
      pdfAddBtn.onclick = null;
      pdfRemoveBtn.onclick = null;
      uploadInput.onchange = null;
      toggleBtn.onclick = null;
      deleteBtn.onclick = null;
      saveBtn.onclick = null;
    };

    const refreshModal = () => {
      cleanup();
      renderVehiclesAdmin();
      openVehicleEditModal(id);
    };

    pdfBtn.onclick = () => {
      if (!vehicle.registrationPdfData) return;
      openVehiclePdf(id);
    };

    pdfAddBtn.onclick = () => {
      uploadInput.click();
    };

    uploadInput.onchange = (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.type !== "application/pdf") {
        showToast("Bitte eine PDF-Datei auswählen.", "error");
        uploadInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        vehicle.registrationPdfName = file.name;
        vehicle.registrationPdfData = String(reader.result || "");
        saveState();
        refreshModal();
      };
      reader.readAsDataURL(file);
    };

    pdfRemoveBtn.onclick = () => {
      vehicle.registrationPdfName = "";
      vehicle.registrationPdfData = "";
      saveState();
      refreshModal();
    };

    toggleBtn.onclick = () => {
      vehicle.active = vehicle.active === false;
      if (vehicle.active === false && !vehicle.deregistrationDate) {
        vehicle.deregistrationDate = dateKey(new Date());
      }
      if (vehicle.active !== false) {
        vehicle.deregistrationDate = "";
      }
      saveState();
      refreshModal();
    };

    saveBtn.onclick = () => {
      vehicle.name = nameInput.value.trim() || "Ohne Namen";
      getAllVehicleManagedFields().forEach((field) => {
        const fieldEl = fieldsHost.querySelector(`[data-field="${field}"]`);
        vehicle[field] = fieldEl ? fieldEl.value : "";
      });
      saveState();
      cleanup();
      renderAll();
    };

    deleteBtn.onclick = () => {
      state.vehicles = state.vehicles.filter((item) => item.id !== id);
      saveState();
      cleanup();
      renderAll();
    };
  }

  function openVehiclePdf(id) {
  const vehicle = state.vehicles.find((item) => item.id === id);

  if (!vehicle?.registrationPdfData) {
    showToast("Keine PDF hinterlegt.", "error");
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "pdf-viewer-overlay";
  overlay.innerHTML = `
    <div class="pdf-viewer-box">
      <div class="pdf-viewer-head">
        <strong>${escapeHtml(vehicle.registrationPdfName || "Fahrzeugschein.pdf")}</strong>
        <button type="button" class="ghost" data-close-pdf>Schließen</button>
      </div>
      <iframe src="${vehicle.registrationPdfData}" class="pdf-viewer-frame"></iframe>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector("[data-close-pdf]").addEventListener("click", () => {
    overlay.remove();
  });
}

 async function importPriceListPdfLocal(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (file.type !== "application/pdf") {
    showToast("Bitte eine PDF-Datei auswählen.", "error");
    event.target.value = "";
    return;
  }

  ensurePriceListDraft();

  const pdfStorageId = state.priceList.pdfStorageId || uid();

  try {
    await savePriceListPdfToIndexedDb({
      id: pdfStorageId,
      fileName: file.name,
      mimeType: file.type,
      blob: file,
      createdAt: new Date().toISOString()
    });

    state.priceList.pdfStorageId = pdfStorageId;
    state.priceList.pdfName = file.name;
    state.priceList.pdfData = "";
    state.priceList.pdfPath = "";

    saveState();
    renderPriceList();

    showToast("PDF lokal gespeichert.", "success");
  } catch (err) {
    console.error(err);
    showToast("PDF konnte lokal nicht gespeichert werden.", "error");
  } finally {
    event.target.value = "";
  }
}

  async function openPriceListPdf(list = state.priceList) {
  if (!list?.pdfStorageId && !list?.pdfData && !list?.pdfPath) {
    showToast("Keine PDF hinterlegt.", "error");
    return;
  }

  let pdfUrl = "";

  if (list.pdfStorageId) {
    const fileRecord = await getPriceListPdfFromIndexedDb(list.pdfStorageId);

    if (!fileRecord?.blob) {
      showToast("PDF wurde lokal nicht gefunden.", "error");
      return;
    }

    pdfUrl = URL.createObjectURL(fileRecord.blob);
  } else if (list.pdfData) {
    pdfUrl = list.pdfData;
  } else if (list.pdfPath) {
    showToast("Diese alte PDF liegt noch in Supabase. Bitte neu lokal hinterlegen.", "error");
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "pdf-viewer-overlay";
  overlay.innerHTML = `
    <div class="pdf-viewer-box">
      <div class="pdf-viewer-head">
        <strong>${escapeHtml(list.pdfName || "Preisliste.pdf")}</strong>
        <button type="button" class="ghost" data-close-pdf>Schließen</button>
      </div>
      <iframe src="${pdfUrl}" class="pdf-viewer-frame"></iframe>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector("[data-close-pdf]")?.addEventListener("click", () => {
    if (list.pdfStorageId && pdfUrl.startsWith("blob:")) {
      URL.revokeObjectURL(pdfUrl);
    }

    overlay.remove();
  });
}

  function renderExternalBirthdays() {
    const tpl = $("#externalBirthdayTemplate");
    const list = $("#externalBirthdaysList");
    if (!tpl || !list) return;

    list.innerHTML = "";

    state.externalBirthdays
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
      .forEach((item) => {
        const node = tpl.content.firstElementChild.cloneNode(true);
        node.dataset.id = item.id;

        setField(node, "name", item.name || "");
        setField(node, "birthday", item.birthday ? formatDate(parseDateKey(item.birthday)) : "");
        setField(node, "phone", item.phone || item.notes || "");

        node.querySelector('[data-action="edit"]').addEventListener("click", () => openExternalBirthdayModal(item.id));

        list.appendChild(node);
      });
  }

  function addExternalBirthday() {
    const item = {
      id: uid(),
      name: "Name",
      birthday: "",
      phone: ""
    };
    state.externalBirthdays.push(item);
    saveState();
    renderExternalBirthdays();
    openExternalBirthdayModal(item.id);
  }

  function openExternalBirthdayModal(id) {
    const item = state.externalBirthdays.find((b) => b.id === id);
    const modal = $("#externalBirthdayModal");
    const nameInput = $("#externalBirthdayNameInput");
    const dateInput = $("#externalBirthdayDateInput");
    const phoneInput = $("#externalBirthdayPhoneInput");
    const saveBtn = $("#externalBirthdaySave");
    const deleteBtn = $("#externalBirthdayDelete");
    if (!item || !modal || !nameInput || !dateInput || !phoneInput || !saveBtn || !deleteBtn) return;

    nameInput.value = item.name || "";
    dateInput.value = item.birthday || "";
    phoneInput.value = item.phone || item.notes || "";
    modal.classList.remove("hidden");
    setTimeout(() => nameInput.focus(), 0);

    const cleanup = () => {
      modal.classList.add("hidden");
      saveBtn.onclick = null;
      deleteBtn.onclick = null;
    };

    saveBtn.onclick = () => {
      item.name = nameInput.value.trim() || "Ohne Namen";
      item.birthday = dateInput.value || "";
      item.phone = phoneInput.value.trim();
      delete item.notes;
      saveState();
      cleanup();
      renderAll();
    };

    deleteBtn.onclick = () => {
      state.externalBirthdays = state.externalBirthdays.filter((b) => b.id !== id);
      saveState();
      cleanup();
      renderAll();
    };
  }

  function deleteExternalBirthday(id) {
    const item = state.externalBirthdays.find((b) => b.id === id);
    if (!item) return;
    showConfirm(`${item.name} wirklich löschen?`, () => {
      state.externalBirthdays = state.externalBirthdays.filter((b) => b.id !== id);
      saveState();
      renderAll();
    });
  }

  /**
   * Rendert die Notizen-Liste im Notizen-Tab.
   * Jede Karte hat zwei Checkboxen:
   * - "Im Dashboard anzeigen" (showInDashboard)
   * - "Als Pop-up anzeigen" (showAsPopup)
   */
  function renderNotesAdmin() {
    const tpl = $("#noteCardTemplate");
    const list = $("#notesAdminList");
    if (!tpl || !list) return;

    list.innerHTML = "";

    const notes = state.notes || [];
    notes
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .forEach((item) => {
        const node = tpl.content.firstElementChild.cloneNode(true);
        node.dataset.id = item.id;

        setField(node, "title", item.title || "");
        setField(node, "date", item.date || "");
        setField(node, "content", item.content || "");

        // Checkboxen setzen
        const dashCb = node.querySelector('[data-field="showInDashboard"]');
        const popupCb = node.querySelector('[data-field="showAsPopup"]');
        if (dashCb) dashCb.checked = item.showInDashboard !== false;
        if (popupCb) popupCb.checked = item.showAsPopup !== false;

        node.querySelector('[data-action="save"]').addEventListener("click", () => saveNoteCard(node));
        node.querySelector('[data-action="delete"]').addEventListener("click", () => deleteNote(item.id));

        list.appendChild(node);
      });
  }

  /**
   * Erstellt eine neue Notiz mit Standardwerten.
   * showInDashboard: Notiz im Dashboard-Unterabschnitt anzeigen.
   * showAsPopup: Notiz beim App-Start als Pop-up anzeigen.
   */
  function addNote() {
    if (!state.notes) state.notes = [];
    state.notes.push({
      id: uid(),
      title: "Neue Notiz",
      date: dateKey(new Date()),
      content: "",
      showInDashboard: true,
      showAsPopup: true
    });
    saveState();
    renderNotesAdmin();
  }

  /**
   * Speichert eine Notiz-Karte inkl. der Checkbox-Felder
   * showInDashboard und showAsPopup.
   */
  function saveNoteCard(node) {
    if (!state.notes) state.notes = [];
    const item = state.notes.find((n) => n.id === node.dataset.id);
    if (!item) return;

    item.title = getField(node, "title").trim() || "Ohne Titel";
    item.date = getField(node, "date");
    item.content = getField(node, "content");

    // Checkboxen: showInDashboard und showAsPopup
    const dashCb = node.querySelector('[data-field="showInDashboard"]');
    const popupCb = node.querySelector('[data-field="showAsPopup"]');
    item.showInDashboard = dashCb ? dashCb.checked : true;
    item.showAsPopup = popupCb ? popupCb.checked : true;

    saveState();
    renderAll(); // renderAll damit Dashboard-Notizen sofort aktualisiert werden
  }

  function deleteNote(id) {
    if (!state.notes) return;
    const item = state.notes.find((n) => n.id === id);
    if (!item) return;
    showConfirm(`"${item.title}" wirklich löschen?`, () => {
      state.notes = state.notes.filter((n) => n.id !== id);
      saveState();
      renderNotesAdmin();
    });
  }

  /**
   * Zeigt beim App-Start ein Pop-up mit Notizen, die showAsPopup: true haben.
   * Notizen ohne dieses Flag (oder false) werden nicht im Pop-up angezeigt.
   */
  function showNotesStartupPopup() {
    const allNotes = state.notes || [];
    // Nur Notizen mit showAsPopup = true (Standard: true für alte Notizen ohne das Feld)
    const notes = allNotes.filter((n) => n.showAsPopup !== false);
    if (!notes.length) return;

    const modal = $("#notesStartupModal");
    const listEl = $("#notesStartupList");
    const closeBtn = $("#notesStartupClose");
    const goToBtn = $("#notesStartupGoTo");
    if (!modal || !listEl) return;

    listEl.innerHTML = notes
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .map((n) => `
        <div class="startup-note-item">
          <div class="startup-note-title">${escapeHtml(n.title)}${n.date ? " · " + formatDate(parseDateKey(n.date)) : ""}</div>
          ${n.content ? `<div class="startup-note-content">${escapeHtml(n.content)}</div>` : ""}
        </div>
      `)
      .join("");

    modal.classList.remove("hidden");

    closeBtn.onclick = () => modal.classList.add("hidden");
    goToBtn.onclick = () => {
      modal.classList.add("hidden");
      activateTab("notizen");
    };
    modal.onclick = (e) => {
      if (!modal.querySelector(".confirm-box").contains(e.target)) {
        modal.classList.add("hidden");
      }
    };
  }

  function renderMonthlyStats() {
    const view = getStatsMonthView();
    const summary = buildMonthlySummary(view);

    $("#monthlyStatsCharts").innerHTML = state.employees
      .filter((e) => e.active)
      .map((emp) => pieCardHtml(emp.name, summary.employeeStats[emp.id] || emptyStats(), emp.id, view.start.getFullYear()))
      .join("");
  }

  function renderHoursBilling() {
    const body = $("#hoursBillingBody");
    const cards = $("#hoursBillingCards");
    if (!body && !cards) return;

    const view = getPayrollPeriodForAnchor(state.settings.periodAnchor);
    const title = $("#hoursBillingTitle");
    if (title) title.textContent = view.label;
    const doneCheckbox = $("#hoursBillingDoneCheckbox");
    if (doneCheckbox) {
      doneCheckbox.checked = isHoursBillingDone(view);
      doneCheckbox.closest(".hours-billing-done")?.classList.toggle("done", doneCheckbox.checked);
    }

    const rows = state.employees
      .filter((e) => e.active)
      .map((employee) => buildHoursBillingRow(employee, view));

    if (body) {
      body.innerHTML = rows.map((row) => `
      <tr>
        <td><strong>${escapeHtml(row.name)}</strong></td>
        <td>${row.workdayDays} Tage · ${row.workdayHours} Std.</td>
        <td>${row.saturdayDays} Tage · ${row.saturdayHours} Std.</td>
        <td>${row.holidayDays} Tage · ${row.holidayHours} Std.</td>
        <td>${row.vacationDays} Tage · ${row.vacationHours} Std.</td>
        <td>${row.sickDays} Tage · ${row.sickHours} Std.</td>
        <td><strong>ca. ${row.totalHours} Std.</strong></td>
        <td class="hours-billing-details">${escapeHtml(row.details || "-")}</td>
      </tr>
      `).join("");
    }

    if (cards) {
      cards.innerHTML = rows.map((row) => `
        <article class="hours-billing-card">
          <div class="hours-billing-card-head">
            <div>
              <h3>${escapeHtml(row.name)}</h3>
              <span>${escapeHtml(view.label)}</span>
            </div>
            <strong>ca. ${row.totalHours} Std.</strong>
          </div>
          <div class="hours-billing-metrics">
            <div><span>9 Std</span><strong>${row.workdayDays}</strong><small>${row.workdayHours} Std.</small></div>
            <div><span>Sa 4 Std</span><strong>${row.saturdayDays}</strong><small>${row.saturdayHours} Std.</small></div>
            <div><span>Feiertage</span><strong>${row.holidayDays}</strong><small>${row.holidayHours} Std.</small></div>
            <div><span>Urlaub</span><strong>${row.vacationDays}</strong><small>${row.vacationHours} Std.</small></div>
            <div><span>Krank</span><strong>${row.sickDays}</strong><small>${row.sickHours} Std.</small></div>
          </div>
          ${row.details ? `<p class="hours-billing-card-details">${escapeHtml(row.details)}</p>` : ""}
        </article>
      `).join("");
    }
  }

  function buildHoursBillingRow(employee, view) {
    const days = getDaysInRange(view.start, view.end);
    const holidays = buildHolidayMapForRange(view.start, view.end);
    const row = {
      name: employee.name,
      workdayDays: 0,
      workdayHours: 0,
      saturdayDays: 0,
      saturdayHours: 0,
      holidayDays: 0,
      holidayHours: 0,
      vacationDays: 0,
      vacationHours: 0,
      sickDays: 0,
      sickHours: 0,
      sickOverflowDays: 0,
      longTermSickSince: "",
      totalHours: 0,
      details: ""
    };
    const holidayDetails = [];

    days.forEach((day) => {
      if (!hasEmployeeStartedOnDate(employee, day)) return;

      const key = dateKey(day);
      const dayIndex = day.getDay();
      const holidayName = holidays[key] || "";
      const attendance = getAttendanceEntry(employee.id, key);
      const office = state.officePlan[key] || {};
      const special = getSpecialOfficeDay(key);
      const assigned = office.primaryEmployeeId === employee.id || office.secondaryEmployeeId === employee.id;
      const isOfficeBasedEmployee = isPartTimeVacationEmployee(employee.id);
      const worked = attendance.status === "A";
      if (dayIndex === 0 || special.mode === "closed") return;

      if (holidayName && (!isOfficeBasedEmployee || assigned)) {
        const hours = dayIndex === 6 ? 4 : 9;
        row.holidayDays += 1;
        row.holidayHours += hours;
        if (isOfficeBasedEmployee) {
          holidayDetails.push(`${formatDate(day)} ${holidayName} (${hours} Std.)`);
        }
        return;
      }

      if (!worked || holidayName) return;

      if (dayIndex === 6) {
        row.saturdayDays += 1;
        row.saturdayHours += 4;
      } else {
        row.workdayDays += 1;
        row.workdayHours += 9;
      }
    });

    row.vacationDays = getBillingVacationDays(employee.id, days, holidays);
    row.vacationHours = row.vacationDays * 9;
    const sickInfo = getBillingSickDays(employee.id, days, holidays);
    row.sickDays = sickInfo.days;
    row.sickHours = row.sickDays * 9;
    row.sickOverflowDays = sickInfo.overflowDays;
    row.longTermSickSince = sickInfo.longTermSickSince;
    row.totalHours = row.workdayHours + row.saturdayHours + row.holidayHours + row.vacationHours + row.sickHours;

    const detailParts = [];
    if (row.longTermSickSince) {
      row.details = `Seit: ${formatDate(parseDateKey(row.longTermSickSince))}, Langzeitkrankheit`;
      return row;
    }

    if (holidayDetails.length) detailParts.push(`Feiertage: ${holidayDetails.join(", ")}`);
    if (isPartTimeVacationEmployee(employee.id)) {
      detailParts.push(`Urlaub/Krank gedeckelt auf ${getPartTimeVacationQuota(employee.id)} Tage pro Woche`);
    }
    row.details = detailParts.join(" · ");

    return row;
  }

  function getBillingVacationDays(employeeId, days, holidays) {
    const employee = state.employees.find((e) => e.id === employeeId);
    const quota = getPartTimeVacationQuota(employeeId);
    if (!quota) {
      return days.reduce((sum, day) => {
        if (!hasEmployeeStartedOnDate(employee, day)) return sum;
        const key = dateKey(day);
        const entry = getAttendanceEntry(employeeId, key);
        const isSunday = day.getDay() === 0;
        const isHoliday = !!holidays[key];
        return entry.status === "U" && !isSunday && !isHoliday ? sum + 1 : sum;
      }, 0);
    }

    const usedByWeek = {};
    days.forEach((day) => {
      if (!hasEmployeeStartedOnDate(employee, day)) return;
      const key = dateKey(day);
      const entry = getAttendanceEntry(employeeId, key);
      const isWeekday = day.getDay() >= 1 && day.getDay() <= 5;
      if (entry.status !== "U" || !isWeekday || holidays[key]) return;

      const weekKey = getVacationWeekKey(day);
      usedByWeek[weekKey] = Math.min((usedByWeek[weekKey] || 0) + 1, quota);
    });

    return Object.values(usedByWeek).reduce((sum, value) => sum + value, 0);
  }

  function getBillingSickDays(employeeId, days, holidays) {
    const employee = state.employees.find((e) => e.id === employeeId);
    const quota = getPartTimeVacationQuota(employeeId);
    const usedByWeek = {};
    let daysCount = 0;
    let overflowDays = 0;
    let longTermSickSince = "";
    let currentLongTermSickSince = "";

    days.forEach((day) => {
      if (!hasEmployeeStartedOnDate(employee, day)) return;
      const key = dateKey(day);
      const entry = getAttendanceEntry(employeeId, key);
      const isWeekday = day.getDay() >= 1 && day.getDay() <= 5;
      if (!isWeekday || holidays[key]) return;

      if (entry.status === "A") {
        currentLongTermSickSince = "";
        longTermSickSince = "";
        return;
      }

      if (entry.status !== "K") return;

      const sickWorkdayNumber = getContinuousSickWorkdayNumber(employeeId, day);
      if (sickWorkdayNumber > 30) {
        overflowDays += 1;
        const thresholdDate = getContinuousSickThresholdDate(employeeId, day, 30);
        if (thresholdDate) currentLongTermSickSince = thresholdDate;
        longTermSickSince = currentLongTermSickSince;
        return;
      }

      if (!quota) {
        daysCount += 1;
        return;
      }

      const weekKey = getVacationWeekKey(day);
      usedByWeek[weekKey] = Math.min((usedByWeek[weekKey] || 0) + 1, quota);
    });

    return {
      days: quota ? Object.values(usedByWeek).reduce((sum, value) => sum + value, 0) : daysCount,
      overflowDays,
      longTermSickSince
    };
  }

  function getContinuousSickWorkdayNumber(employeeId, day) {
    const employee = state.employees.find((e) => e.id === employeeId);
    let count = 0;
    const current = new Date(day);
    let checkedDays = 0;

    while (checkedDays < 370) {
      if (!hasEmployeeStartedOnDate(employee, current)) break;
      const key = dateKey(current);
      const holidays = buildHolidayMapForRange(current, current);
      const isWorkday = current.getDay() >= 1 && current.getDay() <= 5 && !holidays[key];
      const entry = getAttendanceEntry(employeeId, key);

      if (isWorkday) {
        if (entry.status !== "K") break;
        count += 1;
      }

      current.setDate(current.getDate() - 1);
      checkedDays += 1;
    }

    return count;
  }

  function getContinuousSickThresholdDate(employeeId, day, threshold) {
    const employee = state.employees.find((e) => e.id === employeeId);
    const sickWorkdays = [];
    const current = new Date(day);
    let checkedDays = 0;

    while (checkedDays < 370) {
      if (!hasEmployeeStartedOnDate(employee, current)) break;
      const key = dateKey(current);
      const holidays = buildHolidayMapForRange(current, current);
      const isWorkday = current.getDay() >= 1 && current.getDay() <= 5 && !holidays[key];
      const entry = getAttendanceEntry(employeeId, key);

      if (isWorkday) {
        if (entry.status !== "K") break;
        sickWorkdays.push(key);
      }

      current.setDate(current.getDate() - 1);
      checkedDays += 1;
    }

    if (sickWorkdays.length < threshold) return "";
    return sickWorkdays[sickWorkdays.length - threshold];
  }

  function renderYearSelect() {
    const years = collectYearsWithFallback();
    const currentYear = new Date().getFullYear();
    const select = $("#yearSelect");
    if (!select) return;
    select.innerHTML = years
      .map((y) => `<option value="${y}" ${y === currentYear ? "selected" : ""}>${y}</option>`)
      .join("");
  }

  function renderYearlyStats() {
    const year = Number($("#yearSelect")?.value || new Date().getFullYear());
    const activeEmployees = state.employees.filter((e) => e.active);

    $("#yearlyStatsCharts").innerHTML = activeEmployees
      .map((emp) => pieCardHtml(emp.name, buildYearlyEmployeeStats(emp.id, year), emp.id, year))
      .join("");
  }

  function buildMonthlySummary(view) {
    const days = getMonthDays(view);
    const employeeStats = {};
    const officeDaysByEmployee = {};

    state.employees.forEach((e) => {
      employeeStats[e.id] = emptyStats();
      officeDaysByEmployee[e.id] = 0;
    });

    days.forEach((day) => {
      const key = dateKey(day);

      state.employees.filter((e) => e.active).forEach((emp) => {
        if (!hasEmployeeStartedOnDate(emp, day)) return;
        const entry = getAttendanceEntry(emp.id, key);
        const status = entry.status || "BLANK";
        if (status === "U") return;
        employeeStats[emp.id][status] += 1;
      });

      const office = state.officePlan[key];
      if (office?.primaryEmployeeId) {
        const primaryEmployee = state.employees.find((employee) => employee.id === office.primaryEmployeeId);
        if (hasEmployeeStartedOnDate(primaryEmployee, day)) officeDaysByEmployee[office.primaryEmployeeId] += 1;
      }
      if (office?.secondaryEmployeeId) {
        const secondaryEmployee = state.employees.find((employee) => employee.id === office.secondaryEmployeeId);
        if (hasEmployeeStartedOnDate(secondaryEmployee, day)) officeDaysByEmployee[office.secondaryEmployeeId] += 1;
      }
    });

    state.employees
      .filter((e) => e.active)
      .forEach((emp) => {
        employeeStats[emp.id].U = getUsedVacationDaysInRange(emp.id, days);
      });

    return {
      employeeStats,
      officeDaysByEmployee,
      officeCounters: calculateOfficeCounters(view)
    };
  }

  function buildYearlyEmployeeStats(employeeId, year) {
    const stats = emptyStats();
    let officeDays = 0;
    let weekdayHolidayCount = 0;
    const employee = state.employees.find((e) => e.id === employeeId);

    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    const holidays = buildHolidayMapForRange(start, end);
    const d = new Date(start);

    while (d <= end) {
      if (!hasEmployeeStartedOnDate(employee, d)) {
        d.setDate(d.getDate() + 1);
        continue;
      }

      const key = dateKey(d);
      const holidayName = holidays[key];
      const entry = getAttendanceEntry(employeeId, key);
      const status = entry.status || "BLANK";
      if (status !== "U") stats[status] += 1;

      if (holidayName && d.getDay() !== 0) weekdayHolidayCount++;

      const office = state.officePlan[key];
      if (office?.primaryEmployeeId === employeeId) officeDays++;
      if (office?.secondaryEmployeeId === employeeId) officeDays++;

      d.setDate(d.getDate() + 1);
    }

    stats.U = getUsedVacationDays(employeeId, year);

    return { ...stats, officeDays, weekdayHolidayCount };
  }

  function getLabelName(label) {
    return { A: "Anwesend", U: "Urlaub", K: "Krank" }[label] || label;
  }

  function pieCardHtml(name, stats, employeeId, yearForVacation) {
    const parts = [
      { label: "A", value: stats.A || 0, color: "#22a06b" },
      { label: "U", value: stats.U || 0, color: "#3b82f6" },
      { label: "K", value: stats.K || 0, color: "#d64545" }
    ];

    const total = parts.reduce((sum, p) => sum + p.value, 0) || 1;
    const radius = 15.915;
    const circumference = 2 * Math.PI * radius;
    let acc = 0;

    const circles = parts
      .filter((p) => p.value > 0)
      .map((p) => {
        const fraction = p.value / total;
        const dash = `${(fraction * circumference).toFixed(3)} ${(circumference - fraction * circumference).toFixed(3)}`;
        const offset = (-acc * circumference).toFixed(3);
        acc += fraction;
        return `<circle cx="21" cy="21" r="${radius}" fill="transparent" stroke="${p.color}" stroke-width="7" stroke-dasharray="${dash}" stroke-dashoffset="${offset}" transform="rotate(-90 21 21)"></circle>`;
      })
      .join("");

    const vacationYear = yearForVacation || new Date().getFullYear();
    const rest = getRemainingVacation(state.employees.find((e) => e.id === employeeId), vacationYear);

    return `
      <div class="kpi-card clickable" data-employee-id="${employeeId}">
        <div class="kpi-card-title">${escapeHtml(name)}</div>
        <div class="svg-wrap">
          <svg width="150" height="150" viewBox="0 0 42 42">
            <circle cx="21" cy="21" r="${radius}" fill="transparent" stroke="#eef3f8" stroke-width="7"></circle>
            ${circles}
          </svg>
        </div>
        <div class="kpi-card-meta">Resturlaub: ${rest.remaining} / ${rest.allowance + rest.carryover} · A:${stats.A || 0} U:${stats.U || 0} K:${stats.K || 0}</div>
      </div>
    `;
  }

  function getUsedVacationDays(employeeId, year) {
    const employee = state.employees.find((e) => e.id === employeeId);
    if (isPartTimeVacationEmployee(employeeId)) {
      return getPartTimeUsedVacationDays(employeeId, year);
    }

    let used = 0;
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    const d = new Date(start);

    while (d <= end) {
      if (!hasEmployeeStartedOnDate(employee, d)) {
        d.setDate(d.getDate() + 1);
        continue;
      }

      const key = dateKey(d);
      const entry = getAttendanceEntry(employeeId, key);
      if (entry.status === "U") used++;
      d.setDate(d.getDate() + 1);
    }

    return used;
  }

  function getUsedVacationDaysInRange(employeeId, days) {
    const employee = state.employees.find((e) => e.id === employeeId);
    if (!isPartTimeVacationEmployee(employeeId)) {
      return days.reduce((sum, day) => {
        if (!hasEmployeeStartedOnDate(employee, day)) return sum;
        const key = dateKey(day);
        const entry = getAttendanceEntry(employeeId, key);
        return entry.status === "U" ? sum + 1 : sum;
      }, 0);
    }

    const quota = getPartTimeVacationQuota(employeeId);
    const usedByWeek = {};

    days.forEach((day) => {
      if (!hasEmployeeStartedOnDate(employee, day)) return;
      const key = dateKey(day);
      const entry = getAttendanceEntry(employeeId, key);
      const isWeekday = day.getDay() !== 0 && day.getDay() !== 6;

      if (entry.status === "U" && isWeekday) {
        const weekKey = getVacationWeekKey(day);
        usedByWeek[weekKey] = Math.min((usedByWeek[weekKey] || 0) + 1, quota);
      }
    });

    return Object.values(usedByWeek).reduce((sum, value) => sum + value, 0);
  }

  function getPartTimeUsedVacationDays(employeeId, year) {
    const employee = state.employees.find((e) => e.id === employeeId);
    const quota = getPartTimeVacationQuota(employeeId);
    const usedByWeek = {};
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    const d = new Date(start);

    while (d <= end) {
      if (!hasEmployeeStartedOnDate(employee, d)) {
        d.setDate(d.getDate() + 1);
        continue;
      }

      const key = dateKey(d);
      const entry = getAttendanceEntry(employeeId, key);
      const isWeekday = d.getDay() !== 0 && d.getDay() !== 6;

      if (entry.status === "U" && isWeekday) {
        const weekKey = getVacationWeekKey(d);
        usedByWeek[weekKey] = Math.min((usedByWeek[weekKey] || 0) + 1, quota);
      }

      d.setDate(d.getDate() + 1);
    }

    return Object.values(usedByWeek).reduce((sum, value) => sum + value, 0);
  }

  function getVacationWeekKey(date) {
    const weekStart = new Date(date);
    const dayIndex = (weekStart.getDay() + 6) % 7;
    weekStart.setDate(weekStart.getDate() - dayIndex);
    weekStart.setHours(0, 0, 0, 0);
    return dateKey(weekStart);
  }

  function getEmployeeEntryDate(employee) {
    if (!employee?.entryDate) return null;
    const entryDate = parseDateKey(employee.entryDate);
    return Number.isNaN(entryDate.getTime()) ? null : entryDate;
  }

  function hasEmployeeStartedOnDate(employee, day) {
    const entryDate = getEmployeeEntryDate(employee);
    if (!entryDate) return true;
    return dateOnly(day) >= dateOnly(entryDate);
  }

  function getRemainingVacation(employee, year) {
    if (!employee) {
      return { allowance: 0, carryover: 0, used: 0, remaining: 0 };
    }

    const allowance = Number(employee.vacationAllowance || 0);
    const carryover = getVacationCarryoverForYear(employee, year);
    const used = getUsedVacationDays(employee.id, year);

    return {
      allowance,
      carryover,
      used,
      remaining: allowance + carryover - used
    };
  }

  function renderOfficeChip(employeeId) {
    if (!employeeId) return "";
    const emp = state.employees.find((e) => e.id === employeeId);
    if (!emp) return "";
    const cls = emp.name.includes("Daniela")
      ? "daniela"
      : emp.name.includes("Yesim")
        ? "yesim"
        : "other";
    return `<span class="person-chip ${cls}">${escapeHtml(emp.name.split(" ")[0])}</span>`;
  }

  function calculateOfficeCounters(payrollPeriod) {
    const counters = {};

    state.employees
      .filter((e) => e.active && isBueroDept(e.department))
      .forEach((e) => (counters[e.name] = { shifts: 0, hours: 0 }));

    getDaysInRange(payrollPeriod.start, payrollPeriod.end).forEach((day) => {
      const key = dateKey(day);
      const office = state.officePlan[key];
      if (!office) return;

      [office.primaryEmployeeId, office.secondaryEmployeeId]
        .filter(Boolean)
        .forEach((id) => {
          const emp = state.employees.find((e) => e.id === id);
          if (!emp || !counters[emp.name]) return;

          const attendance = getAttendanceEntry(id, key);
          if (!attendance || attendance.status !== "A") return;

          counters[emp.name].shifts += 1;
          counters[emp.name].hours += day.getDay() === 6 ? 4 : 9;
        });
    });

    return counters;
  }

  function calculatePlannedCounters(payrollPeriod) {
    const counters = {};

    state.employees
      .filter((e) => e.active && isBueroDept(e.department))
      .forEach((e) => (counters[e.name] = { shifts: 0, hours: 0 }));

    getDaysInRange(payrollPeriod.start, payrollPeriod.end).forEach((day) => {
      const key = dateKey(day);
      const office = state.officePlan[key];
      if (!office) return;

      [office.primaryEmployeeId, office.secondaryEmployeeId]
        .filter(Boolean)
        .forEach((id) => {
          const emp = state.employees.find((e) => e.id === id);
          if (!emp || !counters[emp.name]) return;

          counters[emp.name].shifts += 1;
          counters[emp.name].hours += day.getDay() === 6 ? 4 : 9;
        });
    });

    return counters;
  }

  function getDaysInRange(start, end) {
    const days = [];
    const d = new Date(start);
    while (d <= end) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }

  function getAttendanceEntry(employeeId, key) {
    return getRawAttendanceEntry(employeeId, key)
      || getExpandedVacationEntry(employeeId, key)
      || { status: "", note: "" };
  }

  function getRawAttendanceEntry(employeeId, key) {
    return state.attendance?.[employeeId]?.[key] || null;
  }

  function setAttendanceEntry(employeeId, key, entry) {
    if (!state.attendance[employeeId]) state.attendance[employeeId] = {};
    state.attendance[employeeId][key] = entry;
  }

  function clearAttendanceEntry(employeeId, key) {
    if (!state.attendance[employeeId]) return;
    delete state.attendance[employeeId][key];
  }

  function statusLabel(status) {
    return ({
      A: "A · Anwesend",
      U: "U · Urlaub",
      K: "K · Krank",
      S: "S · Sonstiges"
    })[status] || status;
  }

  function buildHolidayMapForRange(start, end) {
    const years = new Set([start.getFullYear(), end.getFullYear()]);
    const map = {};
    years.forEach((year) => {
      Object.entries(getGermanBwHolidays(year)).forEach(([key, label]) => {
        if (key >= dateKey(start) && key <= dateKey(end)) map[key] = label;
      });
    });
    return map;
  }

  function getGermanBwHolidays(year) {
    const easter = getEasterSunday(year);
    return {
      [makeDateKey(year, 1, 1)]: "Neujahr",
      [makeDateKey(year, 1, 6)]: "Heilige Drei Könige",
      [dateKey(addDays(easter, -2))]: "Karfreitag",
      [dateKey(addDays(easter, 1))]: "Ostermontag",
      [makeDateKey(year, 5, 1)]: "Tag der Arbeit",
      [dateKey(addDays(easter, 39))]: "Christi Himmelfahrt",
      [dateKey(addDays(easter, 50))]: "Pfingstmontag",
      [dateKey(addDays(easter, 60))]: "Fronleichnam",
      [makeDateKey(year, 10, 3)]: "Tag der Deutschen Einheit",
      [makeDateKey(year, 11, 1)]: "Allerheiligen",
      [makeDateKey(year, 12, 25)]: "1. Weihnachtstag",
      [makeDateKey(year, 12, 26)]: "2. Weihnachtstag"
    };
  }

  function getEasterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  function getUpcomingBirthdays(limit) {
    const today = new Date();
    return state.employees
      .filter((e) => e.active && e.birthday)
      .map((emp) => ({ emp, next: nextBirthdayDate(emp.birthday, today) }))
      .sort((a, b) => a.next - b.next)
      .slice(0, limit);
  }

  function getUpcomingExternalBirthdays(limit) {
    const today = new Date();
    return state.externalBirthdays
      .filter((e) => e.birthday)
      .map((item) => ({ item, next: nextBirthdayDate(item.birthday, today) }))
      .sort((a, b) => a.next - b.next)
      .slice(0, limit);
  }

  function getUpcomingEvents(limit) {
    const today = dateKey(new Date());
    return state.events
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, limit);
  }

  function getUpcomingVehicleDeadlines(limit) {
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const items = [];

    state.vehicles
      .filter((v) => v.active !== false)
      .forEach((vehicle) => {
        getVehicleDeadlineEntries(vehicle).forEach((cfg) => {
          const dt = parseMonthKey(cfg.date);
          if (!dt) return;

          const daysDiff = Math.floor((dt - today) / 86400000);

          items.push({
            vehicle,
            label: cfg.label,
            date: cfg.date,
            isOverdue: dt < currentMonthStart,
            isSoon: daysDiff >= 0 && daysDiff <= 30
          });
        });
      });

    return items
      .sort((a, b) => monthKeyToSortValue(a.date) - monthKeyToSortValue(b.date))
      .slice(0, limit);
  }

  function exportOfficePlanCsv() {
    const view = getCurrentMonthView();
    const rows = [["Datum", "Wochentag", "Primär", "Sekundär", "Stunden"]];
    getMonthDays(view).forEach((day) => {
      const key = dateKey(day);
      const office = state.officePlan[key] || {};
      rows.push([
        key,
        day.toLocaleDateString("de-DE", { weekday: "long" }),
        employeeNameById(office.primaryEmployeeId),
        employeeNameById(office.secondaryEmployeeId),
        String(day.getDay() === 6 ? 4 : 9)
      ]);
    });
    downloadBlob(csvBlob(rows), `regu-bueroplan-${dateKey(view.start)}.csv`);
  }

  function exportAttendanceCsv() {
    const view = getStatsMonthView();
    const active = state.employees.filter((e) => e.active);
    const rows = [["Datum", "Wochentag", ...active.flatMap((e) => [`${e.name} Status`, `${e.name} Notiz`])]];

    getMonthDays(view).forEach((day) => {
      const key = dateKey(day);
      const row = [key, day.toLocaleDateString("de-DE", { weekday: "long" })];
      active.forEach((emp) => {
        const entry = getAttendanceEntry(emp.id, key);
        const status = entry.status || "";
        if (!status || ["A", "K", "U", "S"].includes(status)) {
          row.push(status, status === "S" ? entry.note || "" : "");
        } else {
          row.push("", "");
        }
      });
      rows.push(row);
    });

    downloadBlob(csvBlob(rows), `regu-anwesenheiten-${dateKey(view.start)}.csv`);
  }

  function exportMonthlyStatsCsv() {
    const view = getStatsMonthView();
    const summary = buildMonthlySummary(view);
    const rows = [["Mitarbeiter", "A", "U", "K", "S", "Resturlaub"]];

    state.employees.filter((e) => e.active).forEach((emp) => {
      const s = summary.employeeStats[emp.id] || emptyStats();
      const rest = getRemainingVacation(emp, view.start.getFullYear());
      rows.push([emp.name, s.A, s.U, s.K, s.S, rest.remaining]);
    });

    downloadBlob(csvBlob(rows), `regu-monatsstatistik-${dateKey(view.start)}.csv`);
  }

  function exportYearlyStatsCsv() {
    const year = Number($("#yearSelect")?.value || new Date().getFullYear());
    const rows = [["Mitarbeiter", "A", "U", "K", "S", "Resturlaub"]];

    state.employees.filter((e) => e.active).forEach((emp) => {
      const s = buildYearlyEmployeeStats(emp.id, year);
      const rest = getRemainingVacation(emp, year);
      rows.push([emp.name, s.A, s.U, s.K, s.S, rest.remaining]);
    });

    downloadBlob(csvBlob(rows), `regu-jahresstatistik-${year}.csv`);
  }

  function exportPersonIcs(personName) {
    const person = state.employees.find((e) => e.name === personName);
    if (!person) {
      showToast(`${personName} wurde nicht gefunden.`, "error");
      return;
    }

    const from = ($("#icsExportFrom")?.value || "").trim();
    const to = ($("#icsExportTo")?.value || "").trim();
    if (from && to && from > to) {
      showToast("Der ICS-Zeitraum ist ungültig.", "error");
      return;
    }

    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//REGU-Personal//DE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];

    Object.entries(state.officePlan)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, office]) => {
        if (from && date < from) return;
        if (to && date > to) return;
        const assigned = [office.primaryEmployeeId, office.secondaryEmployeeId].filter(Boolean);
        if (!assigned.includes(person.id)) return;
        const day = parseDateKey(date);

        lines.push(
          "BEGIN:VEVENT",
          `UID:${uid()}@regu-personal.local`,
          `DTSTAMP:${formatIcsTimestamp(new Date())}`,
          `DTSTART;VALUE=DATE:${formatIcsDate(day)}`,
          `DTEND;VALUE=DATE:${formatIcsDate(addDays(day, 1))}`,
          "SUMMARY:REGU Büro",
          "END:VEVENT"
        );
      });

    lines.push("END:VCALENDAR");
    downloadBlob(
      new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" }),
      sanitizeFilename(person.name.toLowerCase()) + "-regu-buero.ics"
    );
  }

  function exportVehiclesIcs() {
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//REGU-Fahrzeuge//DE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
    let hasEntries = false;

    state.vehicles.forEach((vehicle) => {
      getVehicleDeadlineEntries(vehicle).forEach((cfg) => {
        const date = parseMonthKey(cfg.date);
        if (!date) return;
        hasEntries = true;

        lines.push(
          "BEGIN:VEVENT",
          `UID:${uid()}@regu-fahrzeuge.local`,
          `DTSTAMP:${formatIcsTimestamp(new Date())}`,
          `DTSTART;VALUE=DATE:${formatIcsDate(date)}`,
          `DTEND;VALUE=DATE:${formatIcsDate(addDays(date, 1))}`,
          `SUMMARY:${vehicle.name || "Fahrzeug"} · ${cfg.label}`,
          "END:VEVENT"
        );
      });
    });

    lines.push("END:VCALENDAR");

    if (!hasEntries) {
      showToast("Keine Fahrzeugfristen zum Exportieren vorhanden.", "error");
      return;
    }

    downloadBlob(
      new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" }),
      `regu-fahrzeuge-${dateKey(new Date())}.ics`
    );
  }

  function exportVehiclesCsv() {
    const rows = [["Fahrzeug", "Typ", "Art", "Fälligkeit", "Aktiv"]];

    state.vehicles.forEach((vehicle) => {
      getVehicleDeadlineEntries(vehicle).forEach((cfg) => {
        if (!cfg.date) return;

        rows.push([
          vehicle.name || "Fahrzeug",
          getVehicleTypeMeta(vehicle.type).label,
          cfg.label,
          cfg.date,
          vehicle.active === false ? "Nein" : "Ja"
        ]);
      });
    });

    if (rows.length === 1) {
      showToast("Keine Fahrzeugfristen zum Exportieren vorhanden.", "error");
      return;
    }

    downloadBlob(csvBlob(rows), `regu-fahrzeuge-${dateKey(new Date())}.csv`);
  }

  function exportBackup() {
    downloadBlob(
      new Blob([JSON.stringify(state, null, 2)], { type: "application/json;charset=utf-8" }),
      `regu-personal-backup-${dateKey(new Date())}.json`
    );
  }

  function importBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        state = normalizeState(JSON.parse(String(reader.result)));
        saveState();
        renderAll();
        showToast("Backup erfolgreich importiert.", "success");
      } catch {
        showToast("Backup konnte nicht importiert werden.", "error");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file, "utf-8");
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(defaultData);

      return normalizeState(JSON.parse(raw));
    } catch {
      return structuredClone(defaultData);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

async function loadOfficePlanFromSupabase() {
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_TABLE)
      .select("data")
      .eq("id", SUPABASE_ROW_ID)
      .single();

    if (error) {
      console.error("Fehler beim Laden des Büroplans aus Supabase:", error.message);
      return;
    }

    const payload = data?.data || {};

    if (payload.officePlan && typeof payload.officePlan === "object") {
      state.officePlan = payload.officePlan;
    }

    if (payload.specialOfficeDays && typeof payload.specialOfficeDays === "object") {
      state.specialOfficeDays = payload.specialOfficeDays;
    }

    if (payload.officeSecondPersonEnabled !== undefined) {
      state.settings.officeSecondPersonEnabled = !!payload.officeSecondPersonEnabled;
    }

    if (payload.officeSpecialModeEnabled !== undefined) {
      state.settings.officeSpecialModeEnabled = !!payload.officeSpecialModeEnabled;
    }

    if (payload.sundaysEditable !== undefined) {
      state.settings.sundaysEditable = !!payload.sundaysEditable;
    }

    if (payload.holidaysEditable !== undefined) {
      state.settings.holidaysEditable = !!payload.holidaysEditable;
    }

    saveState();
  } catch (err) {
    console.error("Unerwarteter Fehler beim Laden des Büroplans:", err);
  }
}

async function saveOfficePlanToSupabase() {
  try {
    const payload = {
  officePlan: state.officePlan || {},
  specialOfficeDays: state.specialOfficeDays || {},

  officeSecondPersonEnabled: !!state.settings.officeSecondPersonEnabled,
  officeSpecialModeEnabled: !!state.settings.officeSpecialModeEnabled,
  sundaysEditable: !!state.settings.sundaysEditable,
  holidaysEditable: !!state.settings.holidaysEditable,

  officePeopleMap: buildOfficePeopleMap(),

  // Kompatibilität für die alte abonnierbare Kalender-Funktion
  employees: buildOfficeCalendarPeople()
  
};

    const { error } = await supabaseClient
      .from(SUPABASE_TABLE)
      .update({
        data: payload,
        updated_at: new Date().toISOString()
      })
      .eq("id", SUPABASE_ROW_ID);

    if (error) {
      console.error("Fehler beim Speichern des Büroplans in Supabase:", error.message);
    }
  } catch (err) {
    console.error("Unerwarteter Fehler beim Speichern des Büroplans:", err);
  }
}

function buildOfficeCalendarPeople() {
  return (state.employees || [])
    .filter((employee) => employee.active && isBueroDept(employee.department))
    .map((employee) => ({
      id: employee.id,
      name: employee.name,
      department: employee.department,
      active: true
    }));
}

function buildOfficePeopleMap() {
  return Object.fromEntries(
    (state.employees || [])
      .filter((employee) => employee.active && isBueroDept(employee.department))
      .map((employee) => [
        employee.id,
        {
          name: employee.name,
          calendarSlug: employee.name.toLowerCase().includes("yesim")
            ? "yesim"
            : employee.name.toLowerCase().includes("daniela")
              ? "daniela"
              : normalizeCalendarSlug(employee.name)
        }
      ])
  );
}

function normalizeCalendarSlug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

  function normalizeState(parsed) {
    const normalized = {
      ...structuredClone(defaultData),
      ...(parsed || {}),
      priceList: normalizePriceList((parsed && parsed.priceList) || {}),
      vehicles: normalizeVehicles((parsed && parsed.vehicles) || []),
      employees: normalizeEmployees((parsed && parsed.employees) || structuredClone(defaultData).employees),
      settings: {
        ...structuredClone(defaultData).settings,
        ...((parsed && parsed.settings) || {})
      },
      events: normalizeEvents((parsed && parsed.events) || []),
      notes: (parsed && parsed.notes) || [],
      trashEvents: (parsed && parsed.trashEvents) || [],
      containers: normalizeContainers((parsed && parsed.containers) || [])
    };

    const parsedSettings = (parsed && parsed.settings) || {};
    if (!Object.prototype.hasOwnProperty.call(parsedSettings, "newPricesActive") && normalized.settings.newPricesUntil) {
      const oldUntil = new Date(normalized.settings.newPricesUntil);
      normalized.settings.newPricesActive = !Number.isNaN(oldUntil.getTime()) && oldUntil > new Date();
    }

    if (!Object.prototype.hasOwnProperty.call(parsedSettings, "vacationCarryoverLastProcessedYear")) {
      normalized.settings.vacationCarryoverLastProcessedYear = inferVacationCarryoverBaselineYear(normalized);
    }

    return normalized;
  }

  function normalizePriceList(priceList) {
  const list = priceList && typeof priceList === "object" ? priceList : {};

  return {
    company: String(list.company || ""),
    date: String(list.date || ""),
    excelName: String(list.excelName || ""),
    pdfName: String(list.pdfName || ""),
    pdfStorageId: String(list.pdfStorageId || ""),
    pdfData: "",
    pdfPath: "",
    entries: Array.isArray(list.entries)
      ? list.entries.map((entry) => ({
          id: String(entry.id || uid()),
          material: String(entry.material || ""),
          priceTo: Number(entry.priceTo || 0),
          priceKg: Number(entry.priceKg || Number(entry.priceTo || 0) / 1000),
          unit: String(entry.unit || "€/to"),
          note: String(entry.note || "")
        }))
      : []
  };
}

  function normalizeEmployees(employees) {
    const currentYear = new Date().getFullYear();
    if (!Array.isArray(employees)) return structuredClone(defaultData).employees;

    return employees
      .filter((employee) => employee && typeof employee === "object")
      .map((employee) => {
        const vacationAllowance = Number(employee.vacationAllowance ?? 24);
        const carryoverByYear = normalizeVacationCarryoverByYear(employee.vacationCarryoverByYear);

        if (
          Object.keys(carryoverByYear).length === 0
          && employee.vacationCarryover !== undefined
          && employee.vacationCarryover !== null
          && employee.vacationCarryover !== ""
        ) {
          carryoverByYear[String(currentYear)] = Math.max(0, Number(employee.vacationCarryover) || 0);
        }

        return {
          id: String(employee.id || uid()),
          name: String(employee.name || "Ohne Namen"),
          department: String(employee.department || "Lager"),
          phone: String(employee.phone || ""),
          entryDate: String(employee.entryDate || ""),
          birthday: String(employee.birthday || ""),
          active: employee.active !== false,
          notes: String(employee.notes || ""),
          vacationAllowance: Number.isFinite(vacationAllowance) ? vacationAllowance : 24,
          vacationCarryoverByYear: carryoverByYear,
          vacationCarryover: Number(carryoverByYear[String(currentYear)] || 0)
        };
      });
  }

  function normalizeVehicles(vehicles) {
    if (!Array.isArray(vehicles)) return [];

    return vehicles
      .filter((vehicle) => vehicle && typeof vehicle === "object")
      .map((vehicle) => ({
        id: String(vehicle.id || uid()),
        name: String(vehicle.name || "Ohne Namen"),
        type: normalizeVehicleType(vehicle.type || ""),
        tuv: String(vehicle.tuv || ""),
        sp: String(vehicle.sp || ""),
        tacho: String(vehicle.tacho || ""),
        uvv: String(vehicle.uvv || ""),
        service: String(vehicle.service || ""),
        deregistrationDate: String(vehicle.deregistrationDate || ""),
        registrationPdfName: String(vehicle.registrationPdfName || ""),
        registrationPdfData: String(vehicle.registrationPdfData || ""),
        active: vehicle.active !== false
      }));
  }

  function normalizeVacationCarryoverByYear(map) {
    if (!map || typeof map !== "object") return {};

    return Object.entries(map).reduce((acc, [year, value]) => {
      const parsedYear = Number(year);
      const parsedValue = Number(value);
      if (parsedYear >= 1980 && parsedYear <= 2100 && Number.isFinite(parsedValue)) {
        acc[String(parsedYear)] = Math.max(0, parsedValue);
      }
      return acc;
    }, {});
  }

  function inferVacationCarryoverBaselineYear(snapshot) {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const hasCurrentCarryover = (snapshot.employees || []).some((employee) =>
      hasVacationCarryoverForYear(employee, currentYear)
    );
    if (hasCurrentCarryover) return currentYear;

    const hasPreviousYearVacation = Object.values(snapshot.attendance || {}).some((entries) =>
      Object.entries(entries || {}).some(([key, entry]) =>
        key.startsWith(`${previousYear}-`) && entry?.status === "U"
      )
    );

    return hasPreviousYearVacation ? previousYear : currentYear;
  }

  function ensureVacationCarryoversUpToDate() {
    const currentYear = new Date().getFullYear();
    const lastProcessedYear = Number(state.settings.vacationCarryoverLastProcessedYear || currentYear);
    let changed = false;

    for (let year = lastProcessedYear + 1; year <= currentYear; year++) {
      state.employees.forEach((employee) => {
        if (hasVacationCarryoverForYear(employee, year)) return;
        const previousRemaining = getRemainingVacation(employee, year - 1).remaining;
        setVacationCarryoverForYear(employee, year, Math.max(0, previousRemaining));
        changed = true;
      });
    }

    state.employees.forEach((employee) => {
      const currentCarryover = getVacationCarryoverForYear(employee, currentYear);
      if (Number(employee.vacationCarryover || 0) !== currentCarryover) {
        employee.vacationCarryover = currentCarryover;
        changed = true;
      }
    });

    if (lastProcessedYear !== currentYear) {
      state.settings.vacationCarryoverLastProcessedYear = currentYear;
      changed = true;
    }

    if (changed) saveState();
  }

  function hasVacationCarryoverForYear(employee, year) {
    const carryovers = employee?.vacationCarryoverByYear;
    return !!carryovers && Object.prototype.hasOwnProperty.call(carryovers, String(year));
  }

  function getVacationCarryoverForYear(employee, year) {
    if (!employee) return 0;
    const carryovers = employee.vacationCarryoverByYear || {};
    const raw = carryovers[String(year)];
    const value = Number(raw);
    return Number.isFinite(value) ? value : 0;
  }

  function setVacationCarryoverForYear(employee, year, value) {
    if (!employee.vacationCarryoverByYear || typeof employee.vacationCarryoverByYear !== "object") {
      employee.vacationCarryoverByYear = {};
    }

    const normalizedValue = Math.max(0, Number(value) || 0);
    employee.vacationCarryoverByYear[String(year)] = normalizedValue;

    if (year === new Date().getFullYear()) {
      employee.vacationCarryover = normalizedValue;
    }
  }

  function matchesEmployeeAdminSearch(employee, query) {
    const normalizedQuery = String(query || "").trim().toLocaleLowerCase("de");
    if (!normalizedQuery) return true;

    const haystack = [
      employee.name,
      employee.phone,
      employee.entryDate,
      employee.department,
      employee.birthday
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("de");

    return haystack.includes(normalizedQuery);
  }

  function normalizeEvents(events) {
    if (!Array.isArray(events)) return [];

    return events
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        id: String(item.id || uid()),
        title: String(item.title || "Ohne Titel"),
        date: String(item.date || ""),
        type: String(item.type || "Veranstaltung"),
        notes: String(item.notes || "")
      }));
  }

  function normalizeContainers(containers) {
  if (!Array.isArray(containers)) return [];

  return containers
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      id: String(item.id || uid()),
      number: String(item.number || item.Nummer || item.Containernummer || "").trim(),
      weight: String(item.weight || item.Gewicht || item.Leergewicht || "").trim(),
      inspectionDate: String(item.inspectionDate || item.Pruefdatum || item.Prüfdatum || "").trim(),
      m3: String(item.m3 || item.M3 || item["m³"] || "").trim(),
      year: String(item.year || item.Baujahr || "").trim(),
      note: String(item.note || item.Notiz || "").trim()
    }))
    .filter((item) => item.number);
}

  function bindBirthdayTooltips() {
    // Tooltips are handled via the title attribute on the badge elements.
    // No additional JS click handlers needed.
  }

  function parseIcal(text) {
    const unfolded = text.replace(/\r?\n[ \t]/g, "");
    const events = [];
    const blocks = unfolded.split(/BEGIN:VEVENT/i);
    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      const dtm = block.match(/^DTSTART[^:\r\n]*:(\d{8})/mi);
      const sum = block.match(/^SUMMARY:(.*)/mi);
      if (dtm && sum) {
        const ds = dtm[1];
        const date = `${ds.slice(0, 4)}-${ds.slice(4, 6)}-${ds.slice(6, 8)}`;
        const summary = sum[1].replace(/\\,/g, ",").replace(/\\n/g, " ").trim();
        events.push({ date, summary });
      }
    }
    return events;
  }

  async function fetchTrashIcal(url) {
    const statusEl = $("#trashIcalStatus");
    if (statusEl) statusEl.textContent = "Wird geladen …";

    let text = null;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      text = await res.text();
    } catch {
      try {
        const proxy = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const res2 = await fetch(proxy);
        if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
        text = await res2.text();
      } catch (e2) {
        if (statusEl) statusEl.textContent = `Fehler beim Laden: ${e2.message}`;
        return;
      }
    }

    try {
      state.trashEvents = parseIcal(text);
      state.settings.trashIcalLastLoaded = new Date().toISOString();
      saveState();
      renderOfficeGrid();
      renderSettingsToggles();
    } catch (e) {
      if (statusEl) statusEl.textContent = `Parse-Fehler: ${e.message}`;
    }
  }

  function buildTrashBadgeMap(days, holidays) {
    const map = {};
    const trashEvents = getWasteEntries();
    if (!trashEvents.length) return map;

    trashEvents.forEach(({ date, type, summary }) => {
      let candidate = parseDateKey(date);
      if (!candidate || isNaN(candidate.getTime())) return;
      candidate.setDate(candidate.getDate() - 1);
      const label = type || summary || "";

      for (let i = 0; i < 7; i++) {
        const cKey = dateKey(candidate);
        const dow = candidate.getDay();
        const isHoliday = !!holidays[cKey];
        const isSunday = dow === 0;
        const isClosed = state.specialOfficeDays?.[cKey]?.mode === "closed";
        if (!isSunday && !isHoliday && !isClosed) {
          if (!map[cKey]) map[cKey] = [];
          map[cKey].push(label);
          break;
        }
        candidate.setDate(candidate.getDate() - 1);
      }
    });
    return map;
  }

  function employeeNameById(id) {
    return state.employees.find((e) => e.id === id)?.name || "";
  }

  function nextBirthdayDate(birthday, fromDate) {
    const base = new Date(birthday);
    let next = new Date(fromDate.getFullYear(), base.getMonth(), base.getDate());
    if (dateOnly(next) < dateOnly(fromDate)) {
      next = new Date(fromDate.getFullYear() + 1, base.getMonth(), base.getDate());
    }
    return next;
  }

  function isBirthdayOnDay(birthday, day) {
    if (!birthday) return false;
    const b = new Date(birthday);
    return b.getDate() === day.getDate() && b.getMonth() === day.getMonth();
  }

  function getBirthdayAgeOnDate(birthday, day) {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    if (Number.isNaN(birthDate.getTime())) return null;
    return day.getFullYear() - birthDate.getFullYear();
  }

  function getBirthdayTooltip(person, day) {
    const age = getBirthdayAgeOnDate(person?.birthday, day);
    if (age === null) return person?.name || "Geburtstag";
    return `${person?.name || "Geburtstag"} · ${age} Jahre`;
  }

  /**
   * Sammelt alle Jahre aus dem State für das Jahr-Dropdown.
   * Filtert ungültige/extreme Jahreszahlen (außerhalb 1980–2100),
   * um komische Dropdown-Werte zu vermeiden (Punkt 48).
   */
  function collectYearsWithFallback() {
    const currentYear = new Date().getFullYear();
    const years = new Set([currentYear]);
    const isValidYear = (y) => y >= 1980 && y <= 2100;

    Object.keys(state.officePlan).forEach((k) => {
      const y = Number(k.slice(0, 4));
      if (isValidYear(y)) years.add(y);
    });
    Object.values(state.attendance).forEach((map) =>
      Object.keys(map || {}).forEach((k) => {
        const y = Number(k.slice(0, 4));
        if (isValidYear(y)) years.add(y);
      })
    );
    Object.values(state.managementAttendance || {}).forEach((map) =>
      Object.keys(map || {}).forEach((k) => {
        const y = Number(k.slice(0, 4));
        if (isValidYear(y)) years.add(y);
      })
    );
    state.events.forEach((e) => {
      const y = Number((e.date || "").slice(0, 4));
      if (isValidYear(y)) years.add(y);
    });
    state.externalBirthdays.forEach((e) => {
      // Geburtstage nicht im Dropdown (nur als Datenpunkt), Jahreszahl ignorieren
    });
    state.vehicles.forEach((v) => {
      ["tuv", "uvv", "service"].forEach((field) => {
        if (v[field]) {
          const y = Number(v[field].slice(0, 4));
          if (isValidYear(y)) years.add(y);
        }
      });
    });
    return Array.from(years).sort((a, b) => a - b);
  }

  function emptyStats() {
    return { BLANK: 0, A: 0, U: 0, K: 0, S: 0, F: 0, SO: 0 };
  }

  function uid() {
    return "id-" + Math.random().toString(36).slice(2, 11);
  }

  function dateKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function makeDateKey(y, m, d) {
    return `${y}-${pad(m)}-${pad(d)}`;
  }

  function parseDateKey(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function parseMonthKey(key) {
    if (!key) return null;
    const [y, m] = key.split("-").map(Number);
    if (!y || !m) return null;
    return new Date(y, m - 1, 1);
  }

  function formatMonthKey(key) {
    const d = parseMonthKey(key);
    if (!d) return "";
    return d.toLocaleDateString("de-DE", { month: "long", year: "numeric"});
  }

  function monthKeyToSortValue(key) {
    const d = parseMonthKey(key);
    return d ? d.getTime() : Infinity;
  }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  function formatDate(date) {
    return date.toLocaleDateString("de-DE");
  }

  function pad(v) {
    return String(v).padStart(2, "0");
  }

  function dateOnly(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  function daysUntil(target, fromDate) {
    return Math.max(0, Math.round((dateOnly(target) - dateOnly(fromDate)) / 86400000));
  }

  function formatIcsDate(date) {
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  }

  function formatIcsTimestamp(date) {
    return `${formatIcsDate(date)}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}Z`;
  }

  function csvBlob(rows) {
    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const text = String(cell ?? "");
            return /[;"\n,]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
          })
          .join(";")
      )
      .join("\n");
    return new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function dataUrlToBlob(dataUrl) {
    const [meta, content] = String(dataUrl || "").split(",");
    const mimeMatch = meta.match(/data:(.*?);base64/);
    const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const binary = atob(content || "");
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  }

  function sanitizeFilename(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9äöüß-]+/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function renderGlobalSearchResults() {
    const input = $("#globalSearchInput");
    const resultsEl = $("#globalSearchResults");
    if (!input || !resultsEl) return;

    const query = input.value.trim().toLocaleLowerCase("de");
    if (!query) {
      hideSearchResults();
      return;
    }

    const matches = [
      ...state.employees
        .filter((item) => (item.name || "").toLocaleLowerCase("de").includes(query))
        .slice(0, 4)
        .map((item) => ({ label: item.name, meta: "Mitarbeiter", tab: "mitarbeiterdaten" })),
      ...state.vehicles
        .filter((item) => (item.name || "").toLocaleLowerCase("de").includes(query))
        .slice(0, 4)
        .map((item) => ({ label: item.name, meta: "Fahrzeug", tab: "fahrzeuge" })),
      ...state.events
        .filter((item) => `${item.title || ""} ${item.notes || ""}`.toLocaleLowerCase("de").includes(query))
        .slice(0, 4)
        .map((item) => ({ label: item.title, meta: item.date || "Termin", tab: "notizen" }))
    ].slice(0, 8);

    resultsEl.innerHTML = matches.length
      ? matches.map((item) => `
          <button class="search-result-item" type="button" data-search-tab="${item.tab}">
            <strong>${escapeHtml(item.label || "")}</strong>
            <span>${escapeHtml(item.meta || "")}</span>
          </button>
        `).join("")
      : `<div class="search-result-empty">Keine Treffer gefunden</div>`;

    resultsEl.classList.remove("hidden");

    resultsEl.querySelectorAll("[data-search-tab]").forEach((button) =>
      button.addEventListener("click", () => {
        activateTab(button.dataset.searchTab || "dashboard");
        hideSearchResults();
      })
    );
  }

  function hideSearchResults() {
    $("#globalSearchResults")?.classList.add("hidden");
  }

  function openDetailDrawer(html) {
    const drawer = $("#detailDrawer");
    const content = $("#detailDrawerContent");
    if (!drawer || !content) return;
    content.innerHTML = html;
    drawer.classList.remove("hidden");
    requestAnimationFrame(() => drawer.classList.add("open"));
  }

  function buildOfficePreviewDrawerHtml() {
    const today = new Date();
    const items = [];
    const holidays = buildHolidayMapForRange(today, addDays(today, 6));

    for (let i = 0; i < 7; i += 1) {
      const day = addDays(today, i);
      const key = dateKey(day);
      const office = state.officePlan?.[key] || {};
      const chips = [office.primaryEmployeeId, office.secondaryEmployeeId]
        .filter(Boolean)
        .map((id) => buildOfficePreviewChip(id))
        .filter(Boolean);
      const holidayName = holidays[key] || "";
      const isSunday = day.getDay() === 0;
      const rowClasses = [
        "drawer-list-item",
        holidayName ? "holiday" : "",
        isSunday && !holidayName ? "sunday" : ""
      ].filter(Boolean).join(" ");
      const detailText = chips.length
        ? `<div class="drawer-chip-row">${chips.join("")}</div>`
        : `<span>Niemand eingetragen</span>`;

      items.push(`
        <div class="${rowClasses}">
          <strong>${escapeHtml(day.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "2-digit" }))}</strong>
          ${holidayName ? `<small>${escapeHtml(holidayName)}</small>` : ""}
          ${detailText}
        </div>
      `);
    }

    return `
      <div class="drawer-section">
        <div class="drawer-eyebrow">Büroplan Vorschau</div>
        <h3>Nächste 7 Tage</h3>
        <p>Übersicht der eingetragenen Personen im Büroplan.</p>
        <div class="drawer-list">${items.join("")}</div>
        <button class="ghost" type="button" data-drawer-tab="buero">Zum Büroplan</button>
      </div>
    `;
  }

  function buildOfficePreviewChip(employeeId) {
    if (!employeeId) return "";
    const employee = state.employees.find((item) => item.id === employeeId);
    if (!employee) return "";
    const cls = employee.name.includes("Daniela")
      ? "daniela"
      : employee.name.includes("Yesim")
        ? "yesim"
        : "other";
    return `<span class="drawer-person-chip ${cls}">${escapeHtml(employee.name.split(" ")[0])}</span>`;
  }

  function buildHoursBillingDrawerHtml() {
    const currentPayroll = getCurrentPayrollPeriod();
    const recentHoursBillingDone = getRecentHoursBillingDoneForDashboard();
    const currentDone = isHoursBillingDoneForDashboard(currentPayroll);
    const statusLabel = currentDone ? "Erledigt" : "Offen";
    const statusText = currentDone
      ? "Die Stundenabrechnung für den aktuellen Zeitraum ist bereits als erledigt markiert."
      : "Für diesen Zeitraum ist die Stundenabrechnung aktuell noch offen.";
    const openPeriod = currentDone ? (recentHoursBillingDone || currentPayroll) : currentPayroll;
    const openPeriodLabel = `${formatDate(openPeriod.start)} - ${formatDate(openPeriod.end)}`;
    const currentPeriodLabel = `${formatDate(currentPayroll.start)} - ${formatDate(currentPayroll.end)}`;
    const doneAtText = recentHoursBillingDone
      ? formatDate(new Date(recentHoursBillingDone.doneAt))
      : "";

    return `
      <div class="drawer-section">
        <div class="drawer-eyebrow">Stundenabrechnung</div>
        <h3>Abrechnungszeitraum</h3>
        <div class="drawer-list">
          <div class="drawer-list-item ${currentDone ? "" : "holiday"}">
            <strong>Status: ${escapeHtml(statusLabel)}</strong>
            <span>${escapeHtml(statusText)}</span>
          </div>
          <div class="drawer-list-item">
            <strong>Aktueller Zeitraum</strong>
            <span>${escapeHtml(currentPeriodLabel)}</span>
          </div>
          <div class="drawer-list-item">
            <strong>${escapeHtml(currentDone ? "Zuletzt erledigter Zeitraum" : "Offener Zeitraum")}</strong>
            <span>${escapeHtml(openPeriodLabel)}</span>
            ${doneAtText ? `<small>Markiert am ${escapeHtml(doneAtText)}</small>` : ""}
          </div>
        </div>
        <button class="ghost" type="button" data-drawer-tab="stundenabrechnung">Zur Stundenabrechnung</button>
      </div>
    `;
  }

  function getNotesAndEventsPreviewItems(limit = Infinity) {
    const in30Days = addDays(new Date(), 30);
    const notes = (state.notes || [])
      .filter((note) => note.showInDashboard !== false)
      .map((note) => ({
        kind: "Notiz",
        title: note.title || "Ohne Titel",
        date: note.date || "",
        sortKey: note.date || "9999-99-99",
        meta: note.date ? formatDate(parseDateKey(note.date)) : "Ohne Datum"
      }));

    const events = getUpcomingEvents(20)
      .filter((event) => parseDateKey(event.date) <= in30Days)
      .map((event) => ({
        kind: event.type || "Termin",
        title: event.title || "Ohne Titel",
        date: event.date || "",
        sortKey: event.date || "9999-99-99",
        meta: event.date ? formatDate(parseDateKey(event.date)) : "Ohne Datum"
      }));

    return [...notes, ...events]
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(0, limit);
  }

  function getBirthdayPreviewItems(limit = Infinity) {
    const now = new Date();
    const in30Days = addDays(now, 30);
    const employees = getUpcomingBirthdays(20)
      .filter(({ next }) => next <= in30Days)
      .map(({ emp, next }) => ({
        kind: "Geburtstag",
        title: emp.name,
        date: next,
        meta: getBirthdayAgeOnDate(emp.birthday, next)
      }));
    const externals = getUpcomingExternalBirthdays(20)
      .filter(({ next }) => next <= in30Days)
      .map(({ item, next }) => ({
        kind: "Externer Geburtstag",
        title: item.name,
        date: next,
        meta: getBirthdayAgeOnDate(item.birthday, next)
      }));

    return [...employees, ...externals]
      .sort((a, b) => a.date - b.date)
      .slice(0, limit);
  }

  function buildNotesPreviewDrawerHtml() {
    const itemsData = getNotesAndEventsPreviewItems(8);

    const items = itemsData.length
      ? itemsData.map((item) => `
          <div class="drawer-list-item">
            <strong>${escapeHtml(item.title || "Ohne Titel")}</strong>
            <span>${escapeHtml(item.kind)} · ${escapeHtml(item.meta)}</span>
          </div>
        `).join("")
      : `
          <div class="drawer-list-item">
            <strong>Keine sichtbaren Eintraege</strong>
            <span>Aktuell ist kein Hinweis, Termin oder keine Notiz fuer das Dashboard freigegeben.</span>
          </div>
        `;

    return `
      <div class="drawer-section">
        <div class="drawer-eyebrow">Notizen & Termine</div>
        <h3>Vorschau der Ueberschriften</h3>
        <p>Sichtbare Notizen, Hinweise und Termine aus dem Dashboard auf einen Blick.</p>
        <div class="drawer-list">${items}</div>
        <button class="ghost" type="button" data-drawer-tab="notizen">Zu den Notizen</button>
      </div>
    `;
  }

  function buildVehicleDeadlinesDrawerHtml() {
    const deadlines = getUpcomingVehicleDeadlines(8);
    const items = deadlines.length
      ? deadlines.map((item) => {
          const date = parseMonthKey(item.date);
          const label = date
            ? date.toLocaleDateString("de-DE", { month: "long", year: "numeric" })
            : item.date;
          const rowClass = item.isOverdue ? "holiday" : item.isSoon ? "sunday" : "";
          return `
            <div class="drawer-list-item ${rowClass}">
              <strong>${escapeHtml(item.vehicle.name || "Ohne Bezeichnung")}</strong>
              <span>${escapeHtml(item.label)} · ${escapeHtml(label || "")}</span>
              ${item.isOverdue ? "<small>Ueberfaellig</small>" : item.isSoon ? "<small>Demnaechst faellig</small>" : ""}
            </div>
          `;
        }).join("")
      : `
          <div class="drawer-list-item">
            <strong>Keine offenen Fahrzeugfristen</strong>
            <span>Aktuell sind keine anstehenden Pruefungen oder Services eingetragen.</span>
          </div>
        `;

    return `
      <div class="drawer-section">
        <div class="drawer-eyebrow">Fahrzeugfristen</div>
        <h3>Naechste Fristen</h3>
        <p>Die naechsten Pruefungen und Services aus dem Fahrzeugbestand.</p>
        <div class="drawer-list">${items}</div>
        <button class="ghost" type="button" data-drawer-tab="fahrzeuge">Zu den Fahrzeugen</button>
      </div>
    `;
  }

  function buildYesimHoursDrawerHtml() {
    const currentPayroll = getCurrentPayrollPeriod();
    const yesimActual = calculateOfficeCounters(currentPayroll)["Yesim Kröll"] || { shifts: 0, hours: 0 };
    const periodLabel = `${currentPayroll.start.toLocaleDateString("de-DE", { month: "long" })} / ${currentPayroll.end.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}`;

    return `
      <div class="drawer-section">
        <div class="drawer-eyebrow">Yesims Stunden</div>
        <h3>Aktueller Stand</h3>
        <div class="drawer-list">
          <div class="drawer-list-item ${yesimActual.hours >= 80 ? "holiday" : ""}">
            <strong>${escapeHtml(periodLabel)}</strong>
            <span>${escapeHtml(`${yesimActual.shifts} Tage · ${yesimActual.hours} Std.`)}</span>
          </div>
        </div>
        <button class="ghost" type="button" data-drawer-tab="dashboard">Zum Dashboard</button>
      </div>
    `;
  }

  function buildWastePreviewDrawerHtml() {
    const entries = (state.wasteCalendar?.entries || [])
      .filter((item) => item.date >= dateKey(new Date()))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6);
    const items = entries.length
      ? entries.map((item) => `
          <div class="drawer-list-item">
            <strong>${escapeHtml(item.type || "Müll")}</strong>
            <span>${escapeHtml(formatDate(parseDateKey(item.date)))}</span>
          </div>
        `).join("")
      : `
          <div class="drawer-list-item">
            <strong>Keine Mülltermine vorhanden</strong>
            <span>Aktuell sind keine kommenden Abholungen im Kalender gespeichert.</span>
          </div>
        `;

    return `
      <div class="drawer-section">
        <div class="drawer-eyebrow">Müllkalender</div>
        <h3>Nächste Abholungen</h3>
        <div class="drawer-list">${items}</div>
        <button class="ghost" type="button" data-drawer-tab="einstellungen">Zu den Einstellungen</button>
      </div>
    `;
  }

  function buildBirthdaysPreviewDrawerHtml() {
    const now = new Date();
    const itemsData = getBirthdayPreviewItems(8);
    const items = itemsData.length
      ? itemsData.map((item) => `
          <div class="drawer-list-item">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.kind)} · ${escapeHtml(formatDate(item.date))}${item.meta !== null ? ` · ${escapeHtml(String(item.meta))} Jahre` : ""}</span>
            <small>In ${escapeHtml(String(daysUntil(item.date, now)))} Tagen</small>
          </div>
        `).join("")
      : `
          <div class="drawer-list-item">
            <strong>Keine Geburtstage vorhanden</strong>
            <span>In den nächsten 30 Tagen steht kein Geburtstag an.</span>
          </div>
        `;

    return `
      <div class="drawer-section">
        <div class="drawer-eyebrow">Geburtstage</div>
        <h3>Nächste Geburtstage</h3>
        <div class="drawer-list">${items}</div>
        <button class="ghost" type="button" data-drawer-tab="einstellungen">Zu den Einstellungen</button>
      </div>
    `;
  }

  function closeDetailDrawer() {
    const drawer = $("#detailDrawer");
    if (!drawer) return;
    drawer.classList.remove("open");
    setTimeout(() => drawer.classList.add("hidden"), 180);
  }

  function showToast(message, tone = "neutral") {
    const stack = $("#toastStack");
    if (!stack) return;
    const id = `toast-${toastCounter += 1}`;
    const toast = document.createElement("div");
    toast.className = `toast ${tone}`;
    toast.id = id;
    toast.textContent = message;
    stack.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("visible"));
    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => toast.remove(), 220);
    }, 2600);
  }

  function animateDashboardNumbers(scope = document) {
    (scope || document).querySelectorAll("[data-animate-number]").forEach((el) => {
      const raw = el.dataset.animateNumber || "";
      if (raw === "") return;
      const target = Number(raw);
      if (!Number.isFinite(target) || target < 0) return;
      if (el.dataset.animated === raw) return;
      el.dataset.animated = raw;

      const duration = 650;
      const start = performance.now();
      const suffix = String(el.textContent || "").replace(/^[\d.,]+/, "");

      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
        el.textContent = `${value}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });
  }

  function extractLeadingNumber(text) {
    const match = String(text || "").match(/^(\d+)/);
    return match ? match[1] : "";
  }

  function getFaStatusIconHtml(iconName) {
    const safe = String(iconName || "").replace(/[^a-z0-9-]/gi, "");
    return `<img src="assets/${safe}.svg" alt="">`;
  }

  function setField(node, field, value) {
    const el = node.querySelector(`[data-field="${field}"]`);
    if (el) el.value = value;
  }

  function getField(node, field) {
    const el = node.querySelector(`[data-field="${field}"]`);
    return el ? el.value : "";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function escapeHtmlAttr(value) {
    return escapeHtml(value);
  }


  function importWasteCalendarFile(event) {
    const file = event.target.files?.[0];
    const info = document.getElementById("wasteLastUpdate");

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = String(reader.result || "");

        if (!text.includes("BEGIN:VCALENDAR")) {
          showToast("Die Datei ist kein gültiger ICS-Kalender", "error");
          return
        }

        const entries = parseWasteIcal(text);

        state.wasteCalendar = {
          url: "",
          entries,
          lastUpdate: new Date().toISOString()
        };

        saveState();
        renderAll();

        if (info) {
          info.textContent =
            "Zuletzt geladen: " + formatDate(new Date(state.wasteCalendar.lastUpdate));
        }

        showToast("Müllkalender geladen!", "success");
      } catch (e) {
        console.error("Waste file import error:", e);
        showToast("Fehler beim Laden der ICS-Datei", "error");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file, "utf-8");
  }

  function parseWasteIcal(text) {
    const lines = text.split(/\r?\n/);
    const events = [];
    let current = null;

    lines.forEach((line) => {
      line = line.trim();

      if (line === "BEGIN:VEVENT") {
        current = {};
        return;
      }

      if (!current) return;

      if (line.startsWith("DTSTART")) {
        const raw = line.split(":")[1] || "";
        const date = raw.slice(0, 8);
        if (date.length === 8) {
          const y = date.slice(0, 4);
          const m = date.slice(4, 6);
          const d = date.slice(6, 8);
          current.date = `${y}-${m}-${d}`;
        }
        return;
      }

      if (line.startsWith("SUMMARY")) {
        current.type = line.split(":").slice(1).join(":");
        return;
      }

      if (line === "END:VEVENT") {
        if (current.date && current.type) {
          events.push(current);
        }
        current = null;
      }
    });

    return events;
  }


  function normalizeWasteType(summary) {
    const text = String(summary || "").toLowerCase();

    if (text.includes("bio")) return "Biotonne";
    if (text.includes("rest")) return "Restmülltonne";
    if (text.includes("papier")) return "Papiertonne";
    if (text.includes("wertstoff")) return "Wertstoff";
    if (text.includes("gelb")) return "Gelber Sack";
    if (text.includes("problem")) return "Problemstoff";
    return summary || "Müll";
  }

  function getWasteEntries() {
    return (state.wasteCalendar?.entries || [])
      .filter((e) => e.date)
      .map((e) => ({
        ...e,
        type: normalizeWasteType(e.type)
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  function getWasteMarkersForMonthGrid(days) {
    const firstKey = dateKey(days[0]);
    const lastKey = dateKey(days[days.length - 1]);
    const markers = {};

    getWasteEntries().forEach((entry) => {
      const markerKey = getWasteMarkerDate(entry.date);

      if (markerKey >= firstKey && markerKey <= lastKey) {
        if (!markers[markerKey]) markers[markerKey] = [];
        markers[markerKey].push(entry);
      }
    });

    return markers;
  }

function getTrashBadgeClass(summary) {
  const text = (summary || "").toLowerCase();
  if (text.includes("bio")) return "trash-bio";
  if (text.includes("papier")) return "trash-paper";
  if (text.includes("rest")) return "trash-rest";
  if (text.includes("gelb")) return "trash-yellow";
  if (text.includes("wertstoff")) return "trash-value";
  return "trash-generic";
}
})();
