"use strict";

const STORAGE_KEY = "schoolErpDataV2";
const classNames = [
  "Nursery",
  "LKG",
  "UKG",
  "Class I",
  "Class II",
  "Class III",
  "Class IV",
  "Class V",
  "Class VI",
  "Class VII",
  "Class VIII",
  "Class IX",
  "Class X",
  "Class XI",
  "Class XII"
];
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = ["08:00–09:00", "09:00–10:00", "10:30–11:30", "11:30–12:30", "12:30–01:30"];
const defaultStudents = [];
const defaultTeachers = [];
const defaultFees = [];
const defaultExams = [];
const defaultNotices = [];
const emptyWeek = () => weekdays.map(() => periods.map(() => ""));
const defaultTimetable = Object.fromEntries(classNames.map(name => [name, emptyWeek()]));
const emptyDatabase = () => ({
  students: defaultStudents.map(student => ({ ...student })),
  teachers: defaultTeachers.map(teacher => ({ ...teacher })),
  fees: defaultFees.map(fee => ({ ...fee })),
  exams: defaultExams.map(exam => ({ ...exam })),
  notices: defaultNotices.map(notice => ({ ...notice })),
  attendance: {},
  timetable: JSON.parse(JSON.stringify(defaultTimetable)),
  settings: { schoolName: "", session: "", email: "" }
});

const toastElement = document.getElementById("toast");
let toastTimer;
let activeModal = null;
let database = loadDatabase();

function toast(message) {
  toastElement.textContent = message;
  toastElement.style.display = "block";
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { toastElement.style.display = "none"; }, 3200);
}

function readLocalStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    toast(`Browser storage is unavailable: ${error.message}`);
    return null;
  }
}

function loadDatabase() {
  const saved = readLocalStorage(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const defaults = emptyDatabase();
      return {
        ...defaults,
        ...parsed,
        students: Array.isArray(parsed.students) ? parsed.students : defaults.students,
        teachers: Array.isArray(parsed.teachers) ? parsed.teachers : defaults.teachers,
        fees: Array.isArray(parsed.fees) ? parsed.fees : defaults.fees,
        exams: Array.isArray(parsed.exams) ? parsed.exams : defaults.exams,
        notices: Array.isArray(parsed.notices) ? parsed.notices : defaults.notices,
        attendance: parsed.attendance && typeof parsed.attendance === "object" ? parsed.attendance : {},
        timetable: parsed.timetable && typeof parsed.timetable === "object"
          ? { ...defaults.timetable, ...parsed.timetable }
          : defaults.timetable,
        settings: parsed.settings && typeof parsed.settings === "object" ? { ...defaults.settings, ...parsed.settings } : defaults.settings
      };
    } catch (error) {
      toast(`Saved data could not be read; loading a clean database instead. ${error.message}`);
    }
  }

  return emptyDatabase();
}

function updateDatabase(change, successMessage) {
  const next = JSON.parse(JSON.stringify(database));
  change(next);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    toast(`Could not save your change in this browser: ${error.message}`);
    return false;
  }
  database = next;
  renderAll();
  if (successMessage) toast(successMessage);
  return true;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? escapeHtml(value) : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function initials(name) {
  return String(name || "?").trim().split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toUpperCase();
}

function personMarkup(name, subtitle) {
  return `<div class="person"><div class="mini-avatar">${escapeHtml(initials(name))}</div><div><b>${escapeHtml(name)}</b>${subtitle ? `<small>${escapeHtml(subtitle)}</small>` : ""}</div></div>`;
}

function actionButtons(type, id, extraAction, extraLabel) {
  return `<div class="row-actions"><button type="button" class="link-btn" data-action="edit-${type}" data-id="${escapeHtml(id)}">Edit</button>${extraAction ? `<button type="button" class="link-btn" data-action="${extraAction}" data-id="${escapeHtml(id)}">${escapeHtml(extraLabel)}</button>` : ""}<button type="button" class="link-btn danger" data-action="delete-${type}" data-id="${escapeHtml(id)}">Delete</button></div>`;
}

function renderStudents() {
  const query = document.getElementById("studentSearch").value.trim().toLowerCase();
  const filtered = database.students.filter(student =>
    [student.name, student.cls, student.adm, student.guardian, student.status].join(" ").toLowerCase().includes(query)
  );
  document.getElementById("studentRows").innerHTML = filtered.map(student => `
    <tr>
      <td>${personMarkup(student.name, "Student")}</td><td>${escapeHtml(student.cls)}</td>
      <td>${escapeHtml(student.adm)}</td><td>${escapeHtml(student.guardian || "—")}</td>
      <td><span class="pill ${student.status === "Active" ? "paid" : "pending"}">${escapeHtml(student.status)}</span></td>
      <td>${actionButtons("student", student.id)}</td>
    </tr>`).join("") || '<tr><td colspan="6" class="empty">No students found.</td></tr>';
  document.getElementById("studentTotal").textContent = `${filtered.length} of ${database.students.length} records`;
  document.getElementById("recentStudents").innerHTML = [...database.students].slice(-5).reverse().map(student => `
    <tr><td>${personMarkup(student.name)}</td><td>${escapeHtml(student.cls)}</td><td>${escapeHtml(student.adm)}</td>
    <td><span class="pill ${student.status === "Active" ? "paid" : "pending"}">${escapeHtml(student.status)}</span></td></tr>`).join("");
}

function renderTeachers() {
  const query = document.getElementById("teacherSearch").value.trim().toLowerCase();
  const filtered = database.teachers.filter(teacher =>
    [teacher.name, teacher.subject, teacher.employeeId, teacher.contact, teacher.status].join(" ").toLowerCase().includes(query)
  );
  document.getElementById("teacherRows").innerHTML = filtered.map(teacher => `
    <tr><td>${personMarkup(teacher.name, "Teacher")}</td><td>${escapeHtml(teacher.subject)}</td>
    <td>${escapeHtml(teacher.employeeId)}</td><td>${escapeHtml(teacher.contact)}</td>
    <td><span class="pill ${teacher.status === "Active" ? "paid" : "pending"}">${escapeHtml(teacher.status)}</span></td>
    <td>${actionButtons("teacher", teacher.id)}</td></tr>`).join("") ||
    '<tr><td colspan="6" class="empty">No teachers found.</td></tr>';
  document.getElementById("teacherTotal").textContent = `${filtered.length} of ${database.teachers.length} staff members`;
}

function selectedDateAttendance() {
  const date = document.getElementById("attendanceDate").value || todayKey();
  if (!database.attendance[date]) database.attendance[date] = {};
  return database.attendance[date];
}

function renderAttendance() {
  const dateInput = document.getElementById("attendanceDate");
  if (!dateInput.value) dateInput.value = todayKey();
  const attendance = selectedDateAttendance();
  const counts = { Present: 0, Absent: 0, "On Leave": 0, "Not marked": 0 };
  database.students.forEach(student => {
    const status = attendance[student.id] || "Not marked";
    counts[status] = (counts[status] || 0) + 1;
  });
  const markedCount = counts.Present + counts.Absent + counts["On Leave"];
  const rate = markedCount ? Math.round((counts.Present / markedCount) * 100) : 0;
  document.getElementById("presentCount").textContent = counts.Present;
  document.getElementById("absentCount").textContent = counts.Absent;
  document.getElementById("unmarkedCount").textContent = counts["Not marked"];
  document.getElementById("attendanceRate").textContent = `${rate}%`;
  document.getElementById("attendanceRows").innerHTML = database.students.map(student => {
    const status = attendance[student.id] || "Not marked";
    return `<tr><td>${personMarkup(student.name)}</td><td>${escapeHtml(student.cls)}</td><td>
      <select class="search attendance-select" data-student-id="${escapeHtml(student.id)}" aria-label="Attendance for ${escapeHtml(student.name)}">
      ${["Not marked", "Present", "Absent", "On Leave"].map(option => `<option${status === option ? " selected" : ""}>${option}</option>`).join("")}</select></td></tr>`;
  }).join("") || '<tr><td colspan="3" class="empty">Add students to start recording attendance.</td></tr>';
  const dashboardRing = document.querySelector(".ring");
  dashboardRing.style.setProperty("--attendance-rate", `${rate}%`);
  document.getElementById("dashboardAttendanceRate").textContent = `${rate}%`;
  document.getElementById("dashboardRingRate").textContent = `${rate}%`;
  document.getElementById("dashboardPresent").textContent = counts.Present;
  document.getElementById("dashboardAbsent").textContent = counts.Absent;
  document.getElementById("dashboardLeave").textContent = counts["On Leave"];
  document.getElementById("dashboardUnmarked").textContent = counts["Not marked"];
}

function studentName(studentId) {
  return database.students.find(student => student.id === studentId)?.name || "Former student";
}

function renderFees() {
  const paidTotal = database.fees.filter(fee => fee.status === "Paid").reduce((sum, fee) => sum + Number(fee.amount), 0);
  const pendingTotal = database.fees.filter(fee => fee.status !== "Paid").reduce((sum, fee) => sum + Number(fee.amount), 0);
  const total = paidTotal + pendingTotal;
  document.getElementById("feesCollected").textContent = formatMoney(paidTotal);
  document.getElementById("feesPending").textContent = formatMoney(pendingTotal);
  document.getElementById("feesRate").textContent = `${total ? Math.round((paidTotal / total) * 100) : 0}%`;
  document.getElementById("dashboardFees").textContent = formatMoney(paidTotal);
  document.getElementById("feeRows").innerHTML = database.fees.map(fee => `
    <tr><td>${escapeHtml(studentName(fee.studentId))}</td>
    <td>${escapeHtml(database.students.find(student => student.id === fee.studentId)?.cls || "—")}</td>
    <td>${formatMoney(fee.amount)}</td><td>${formatDate(fee.dueDate)}</td>
    <td><span class="pill ${fee.status === "Paid" ? "paid" : "pending"}">${escapeHtml(fee.status)}</span></td>
    <td>${actionButtons("fee", fee.id, fee.status === "Paid" ? "" : "mark-paid", fee.status === "Paid" ? "" : "Mark paid")}</td></tr>`).join("") ||
    '<tr><td colspan="6" class="empty">No fee records yet.</td></tr>';
}

function renderExams() {
  const sorted = [...database.exams].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.find(exam => exam.status !== "Completed" && exam.date >= todayKey());
  document.getElementById("upcomingExam").textContent = upcoming?.title || "None scheduled";
  document.getElementById("upcomingExamDate").textContent = upcoming ? `Starts ${formatDate(upcoming.date)}` : "Add an exam to see the next date";
  document.getElementById("completedExams").textContent = database.exams.filter(exam => exam.status === "Completed").length;
  document.getElementById("subjectCount").textContent = new Set(database.exams.map(exam => exam.subject.trim()).filter(Boolean)).size;
  document.getElementById("examRows").innerHTML = sorted.map(exam => `
    <tr><td>${escapeHtml(exam.title)}</td><td>${escapeHtml(exam.cls)}</td><td>${formatDate(exam.date)}</td>
    <td>${escapeHtml(exam.subject)}</td><td><span class="pill ${exam.status === "Completed" ? "paid" : "pending"}">${escapeHtml(exam.status)}</span></td>
    <td>${actionButtons("exam", exam.id)}</td></tr>`).join("") ||
    '<tr><td colspan="6" class="empty">No examinations scheduled.</td></tr>';
}

function noticeMarkup(notice, showActions) {
  return `<div class="notice"><div class="notice-title"><b>${escapeHtml(notice.title)}</b>${showActions ? actionButtons("notice", notice.id) : ""}</div>
    <p>${escapeHtml(notice.body)}</p><small>${formatDate(notice.date)}</small></div>`;
}

function renderNotices() {
  const sorted = [...database.notices].sort((a, b) => b.date.localeCompare(a.date));
  document.getElementById("noticePreview").innerHTML = sorted.slice(0, 2).map(notice => noticeMarkup(notice, false)).join("") ||
    '<p class="empty">No notices published.</p>';
  document.getElementById("allNotices").innerHTML = sorted.map(notice => noticeMarkup(notice, true)).join("") ||
    '<p class="empty">No notices published yet.</p>';
}

function renderTimetable() {
  const selector = document.getElementById("timetableClass");
  const selectedClass = selector.value || selector.options[0].value;
  selector.innerHTML = Object.keys(database.timetable).map(name =>
    `<option value="${escapeHtml(name)}"${name === selectedClass ? " selected" : ""}>${escapeHtml(name)}</option>`
  ).join("");
  const schedule = database.timetable[selector.value] || [];
  document.getElementById("timetableRows").innerHTML = weekdays.map((day, dayIndex) => `
    <tr><td>${day}</td>${periods.map((period, periodIndex) =>
      `<td><input class="timetable-input" data-day="${dayIndex}" data-period="${periodIndex}" value="${escapeHtml(schedule[dayIndex]?.[periodIndex] || "")}" aria-label="${day} ${period}"></td>`
    ).join("")}</tr>`).join("");
}

function renderSettings() {
  document.getElementById("settingSchoolName").value = database.settings.schoolName;
  document.getElementById("settingSession").value = database.settings.session;
  document.getElementById("settingEmail").value = database.settings.email;
}

function renderDashboard() {
  document.getElementById("studentCount").textContent = database.students.length.toLocaleString("en-IN");
  document.getElementById("teacherCount").textContent = database.teachers.length.toLocaleString("en-IN");
  const classes = [...new Set([...classNames, ...database.students.map(student => student.cls)])];
  const counts = classes.map(name => database.students.filter(student => student.cls === name).length);
  const maxCount = Math.max(1, ...counts);
  document.getElementById("classChart").innerHTML = classes.map((name, index) => {
    const count = counts[index];
    const height = count ? Math.max(8, (count / maxCount) * 100) : 2;
    return `<div class="bar-group" title="${escapeHtml(name)}: ${count} student${count === 1 ? "" : "s"}">
      <div class="bar dark" style="height:${height}%"></div><span class="bar-label">${escapeHtml(name.replace("Class ", ""))}</span></div>`;
  }).join("");
  document.getElementById("today").textContent = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
}

function renderAll() {
  renderDashboard();
  renderStudents();
  renderTeachers();
  renderAttendance();
  renderFees();
  renderExams();
  renderNotices();
  renderTimetable();
  renderSettings();
}

const fieldDefinitions = {
  student: [
    { name: "name", label: "Student full name", required: true },
    { name: "cls", label: "Class", type: "select", options: classNames, required: true },
    { name: "adm", label: "Admission number", required: true, placeholder: "e.g. ADM-2026-101" },
    { name: "guardian", label: "Guardian name", placeholder: "Parent / guardian name" },
    { name: "status", label: "Status", type: "select", options: ["Active", "Inactive"], required: true }
  ],
  teacher: [
    { name: "name", label: "Teacher full name", required: true },
    { name: "subject", label: "Subject", required: true },
    { name: "employeeId", label: "Employee ID", required: true },
    { name: "contact", label: "Contact number", type: "tel", required: true },
    { name: "status", label: "Status", type: "select", options: ["Active", "Inactive"], required: true }
  ],
  fee: [
    { name: "studentId", label: "Student", type: "select", options: [], required: true },
    { name: "amount", label: "Amount (INR)", type: "number", min: "1", step: "0.01", required: true },
    { name: "dueDate", label: "Due date", type: "date", required: true },
    { name: "status", label: "Status", type: "select", options: ["Pending", "Paid"], required: true }
  ],
  exam: [
    { name: "title", label: "Examination name", required: true },
    { name: "cls", label: "Class / grades", required: true, placeholder: "e.g. Classes VI–X" },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "subject", label: "Subject", required: true },
    { name: "status", label: "Status", type: "select", options: ["Upcoming", "Completed"], required: true }
  ],
  notice: [
    { name: "title", label: "Notice title", required: true },
    { name: "body", label: "Message", type: "textarea", required: true },
    { name: "date", label: "Publish date", type: "date", required: true }
  ]
};

function openModal(type, id) {
  const record = id ? database[`${type}s`].find(item => item.id === id) : null;
  if (id && !record) {
    toast("That record could not be found. Refresh and try again.");
    return;
  }
  const definitions = fieldDefinitions[type];
  if (!definitions) {
    toast("This form is not available.");
    return;
  }
  activeModal = { type, id: id || null };
  const title = `${record ? "Edit" : "Add"} ${type === "fee" ? "Fee Record" : type.charAt(0).toUpperCase() + type.slice(1)}`;
  const fields = definitions.map(field => {
    const value = record?.[field.name] ?? (field.name === "date" || field.name === "dueDate" ? todayKey() : field.name === "status" ? (field.options?.[0] || "") : "");
    const required = field.required ? " required" : "";
    let input;
    if (field.type === "select") {
      const options = field.name === "studentId"
        ? database.students.map(student => [student.id, `${student.name} (${student.adm})`])
        : field.options.map(option => [option, option]);
      input = `<select name="${field.name}"${required}>${options.map(([optionValue, label]) =>
        `<option value="${escapeHtml(optionValue)}"${String(value) === String(optionValue) ? " selected" : ""}>${escapeHtml(label)}</option>`
      ).join("")}</select>`;
    } else if (field.type === "textarea") {
      input = `<textarea name="${field.name}" rows="4"${required} placeholder="${escapeHtml(field.placeholder || "")}">${escapeHtml(value)}</textarea>`;
    } else {
      input = `<input name="${field.name}" type="${field.type || "text"}"${required} placeholder="${escapeHtml(field.placeholder || "")}" value="${escapeHtml(value)}"${field.min ? ` min="${field.min}"` : ""}${field.step ? ` step="${field.step}"` : ""}>`;
    }
    return `<div class="field"><label>${escapeHtml(field.label)}${field.required ? " *" : ""}</label>${input}</div>`;
  }).join("");
  document.getElementById("modalContent").innerHTML = `
    <h3 id="modalTitle">${escapeHtml(title)}</h3>
    <form id="entityForm" novalidate>
      ${fields}
      <div class="modal-actions"><button type="button" class="btn secondary" data-action="close-modal">Cancel</button>
      <button class="btn" type="submit">${record ? "Save changes" : "Save"}</button></div>
    </form>`;
  const modal = document.getElementById("entityModal");
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  modal.querySelector("input, select, textarea")?.focus();
}

function closeModal() {
  const modal = document.getElementById("entityModal");
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  activeModal = null;
}

function submitEntityForm(event) {
  event.preventDefault();
  if (!event.target.reportValidity() || !activeModal) return;
  const { type, id } = activeModal;
  const values = Object.fromEntries(new FormData(event.target).entries());
  const collection = `${type}s`;
  const existing = id ? database[collection].find(item => item.id === id) : null;
  const nextRecord = { ...values, id: existing?.id || makeId(type) };
  if (type === "fee") nextRecord.amount = Number(values.amount);
  if (type === "student") {
    nextRecord.adm = values.adm.trim();
    nextRecord.name = values.name.trim();
    nextRecord.guardian = values.guardian.trim();
    const duplicate = database.students.some(student => student.id !== id && student.adm.toLowerCase() === nextRecord.adm.toLowerCase());
    if (duplicate) {
      toast("That admission number is already in use.");
      return;
    }
  }
  if (type === "teacher") {
    nextRecord.employeeId = values.employeeId.trim();
    nextRecord.name = values.name.trim();
    const duplicate = database.teachers.some(teacher => teacher.id !== id && teacher.employeeId.toLowerCase() === nextRecord.employeeId.toLowerCase());
    if (duplicate) {
      toast("That employee ID is already in use.");
      return;
    }
  }
  const saved = updateDatabase(next => {
    if (existing) {
      next[collection] = next[collection].map(item => item.id === id ? nextRecord : item);
    } else {
      next[collection].push(nextRecord);
    }
  }, `${type === "fee" ? "Fee record" : type.charAt(0).toUpperCase() + type.slice(1)} ${existing ? "updated" : "added"}.`);
  if (saved) closeModal();
}

function deleteRecord(type, id) {
  const collection = `${type}s`;
  const record = database[collection]?.find(item => item.id === id);
  if (!record) {
    toast("That record could not be found. Refresh and try again.");
    return;
  }
  const description = type === "student" ? record.name : type === "teacher" ? record.name : type === "notice" ? record.title : type === "exam" ? record.title : "this fee record";
  if (!window.confirm(`Delete ${description}? This cannot be undone.`)) return;
  updateDatabase(next => {
    next[collection] = next[collection].filter(item => item.id !== id);
    if (type === "student") {
      Object.values(next.attendance).forEach(day => { delete day[id]; });
    }
  }, "Record deleted.");
}

function showPage(name) {
  const page = document.getElementById(`page-${name}`);
  const button = document.querySelector(`.nav [data-page="${name}"]`);
  if (!page || !button) return;
  document.querySelectorAll(".page").forEach(section => section.classList.toggle("active", section === page));
  document.querySelectorAll(".nav [data-page]").forEach(navButton => navButton.classList.toggle("active", navButton === button));
  const icon = button.querySelector(".ico")?.textContent || "";
  const label = button.textContent.replace(icon, "").trim();
  document.getElementById("pageTitle").textContent = label;
  document.getElementById("crumb").textContent = label;
  document.getElementById("sidebar").classList.remove("open");
}

document.addEventListener("click", event => {
  const navButton = event.target.closest("[data-page]");
  if (navButton) {
    showPage(navButton.dataset.page);
    return;
  }
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  const { action, id } = actionButton.dataset;
  if (action === "close-modal") closeModal();
  else if (action === "add-student") openModal("student");
  else if (action === "add-teacher") openModal("teacher");
  else if (action === "add-fee") openModal("fee");
  else if (action === "add-exam") openModal("exam");
  else if (action === "add-notice") openModal("notice");
  else if (action.startsWith("edit-")) openModal(action.slice(5), id);
  else if (action.startsWith("delete-")) deleteRecord(action.slice(7), id);
  else if (action === "mark-paid") updateDatabase(next => {
    next.fees = next.fees.map(fee => fee.id === id ? { ...fee, status: "Paid" } : fee);
  }, "Payment marked as paid.");
});

document.addEventListener("submit", event => {
  if (event.target.id === "entityForm") submitEntityForm(event);
  if (event.target.id === "settingsForm") {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.target).entries());
    updateDatabase(next => { next.settings = values; }, "School settings saved on this browser.");
  }
});

document.addEventListener("input", event => {
  if (event.target.id === "studentSearch") renderStudents();
  if (event.target.id === "teacherSearch") renderTeachers();
});

document.addEventListener("change", event => {
  if (event.target.id === "attendanceDate") {
    renderAttendance();
    return;
  }
  if (event.target.id === "timetableClass") {
    renderTimetable();
    return;
  }
  if (event.target.matches(".attendance-select")) {
    const { studentId } = event.target.dataset;
    const date = document.getElementById("attendanceDate").value;
    const saved = updateDatabase(next => {
      next.attendance[date] = next.attendance[date] || {};
      next.attendance[date][studentId] = event.target.value;
    }, "Attendance saved.");
    if (!saved) renderAttendance();
    return;
  }
  if (event.target.matches(".timetable-input")) {
    const className = document.getElementById("timetableClass").value;
    const day = Number(event.target.dataset.day);
    const period = Number(event.target.dataset.period);
    updateDatabase(next => {
      next.timetable[className][day][period] = event.target.value.trim();
    }, "Timetable saved.");
  }
});

document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

document.getElementById("entityModal").addEventListener("click", event => {
  if (event.target.id === "entityModal") closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && activeModal) closeModal();
});

renderAll();
