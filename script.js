const eventStart = new Date("2026-09-26T09:00:00+05:30").getTime();
const registrationDeadline = new Date("2026-09-21T23:59:59+05:30").getTime();
const registrationsKey = "prismtechRegistrations";

const defaultAnnouncements = [
  "Registration closes on 21 September 2026 at 11:59 PM.",
  "Problem statements will be released during the opening ceremony.",
  "Teams must bring college ID, laptop, charger, and required software."
];

const $ = (selector) => document.querySelector(selector);
const getRegistrations = () => JSON.parse(localStorage.getItem(registrationsKey) || "[]");
const setRegistrations = (items) => localStorage.setItem(registrationsKey, JSON.stringify(items));

function updateCountdown() {
  const distance = Math.max(0, eventStart - Date.now());
  const parts = {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance % 86400000) / 3600000),
    minutes: Math.floor((distance % 3600000) / 60000),
    seconds: Math.floor((distance % 60000) / 1000)
  };
  Object.entries(parts).forEach(([id, value]) => {
    const node = document.getElementById(id);
    if (node) node.textContent = String(value).padStart(2, "0");
  });
}

function renderAnnouncements() {
  const list = $("#announcementList");
  if (!list) return;
  const announcements = JSON.parse(localStorage.getItem("prismtechAnnouncements") || JSON.stringify(defaultAnnouncements));
  list.innerHTML = announcements.map((item) => `<li>${item}</li>`).join("");
}

function makeRegistrationId() {
  return `PRISM-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function receiptFor(registration) {
  return [
    "IEEE PRISMTECH Hackathon Confirmation Receipt",
    `Registration ID: ${registration.id}`,
    `Team: ${registration.teamName}`,
    `Participant: ${registration.participantName}`,
    `Email: ${registration.email}`,
    `Domain: ${registration.domain}`,
    `Status: ${registration.status}`,
    "Venue: KLH Aziz Nagar Campus",
    "Date: 26 September 2026",
    "Duration: 24 hours"
  ].join("\n");
}

function renderAdminTable(filter = "") {
  const rows = getRegistrations().filter((item) => JSON.stringify(item).toLowerCase().includes(filter.toLowerCase()));
  const tbody = $("#registrationTable");
  if (tbody) {
    tbody.innerHTML = rows.map((item) => `
      <tr>
        <td>${item.id}</td>
        <td>${item.teamName}</td>
        <td>${item.email}</td>
        <td>${item.domain}</td>
        <td>${item.status}</td>
        <td><button class="btn secondary approve-btn" data-id="${item.id}" type="button">${item.status === "Approved" ? "Approved" : "Approve"}</button></td>
      </tr>
    `).join("") || `<tr><td colspan="6">No registrations yet.</td></tr>`;
  }
  const teamCount = $("#teamCount");
  if (teamCount) teamCount.textContent = `${getRegistrations().length} teams`;
}

function setupRegistration() {
  const form = $("#registrationForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const output = $("#registrationOutput");
    if (Date.now() > registrationDeadline) {
      output.textContent = "Registration deadline has passed.";
      return;
    }
    const data = formToObject(form);
    const registrations = getRegistrations();
    const duplicate = registrations.some((item) => item.email.toLowerCase() === data.email.toLowerCase() || item.roll.toLowerCase() === data.roll.toLowerCase());
    if (duplicate) {
      output.textContent = "Duplicate registration detected for this email or roll number.";
      return;
    }
    const registration = { ...data, id: makeRegistrationId(), status: "Submitted", createdAt: new Date().toISOString(), project: {} };
    registrations.push(registration);
    setRegistrations(registrations);
    output.textContent = `Registration submitted. ID: ${registration.id}. Confirmation email queued for ${registration.email}.`;
    form.reset();
    renderAdminTable();
  });
}

function setupDashboard() {
  const form = $("#dashboardLogin");
  const panel = $("#dashboardPanel");
  if (!form || !panel) return;
  let activeRegistration = null;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const loginId = formToObject(form).loginId.toLowerCase();
    activeRegistration = getRegistrations().find((item) => item.email.toLowerCase() === loginId || item.id.toLowerCase() === loginId);
    if (!activeRegistration) {
      alert("No team found for that email or registration ID.");
      return;
    }
    panel.hidden = false;
    $("#dashTitle").textContent = `${activeRegistration.teamName} Dashboard`;
    $("#dashStatus").textContent = `Registration ID ${activeRegistration.id} | Status: ${activeRegistration.status}`;
    $("#projectTitle").value = activeRegistration.project?.title || "";
    $("#presentationLink").value = activeRegistration.project?.presentation || "";
    $("#githubLink").value = activeRegistration.project?.github || "";
    $("#demoLink").value = activeRegistration.project?.demo || "";
  });
  $("#saveProject").addEventListener("click", () => {
    if (!activeRegistration) return;
    const registrations = getRegistrations().map((item) => item.id === activeRegistration.id ? {
      ...item,
      project: {
        title: $("#projectTitle").value,
        presentation: $("#presentationLink").value,
        github: $("#githubLink").value,
        demo: $("#demoLink").value
      }
    } : item);
    setRegistrations(registrations);
    alert("Project submission saved.");
    renderAdminTable();
  });
  $("#downloadReceipt").addEventListener("click", () => {
    if (activeRegistration) downloadText(`${activeRegistration.id}-receipt.txt`, receiptFor(activeRegistration));
  });
}

function setupAdmin() {
  const form = $("#adminLogin");
  const panel = $("#adminPanel");
  if (!form || !panel) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (formToObject(form).password !== "admin123") {
      alert("Incorrect admin password.");
      return;
    }
    panel.hidden = false;
    renderAdminTable();
  });
  $("#adminSearch").addEventListener("input", (event) => renderAdminTable(event.target.value));
  $("#registrationTable").addEventListener("click", (event) => {
    if (!event.target.matches(".approve-btn")) return;
    const registrations = getRegistrations().map((item) => item.id === event.target.dataset.id ? { ...item, status: "Approved" } : item);
    setRegistrations(registrations);
    renderAdminTable($("#adminSearch").value);
  });
  $("#exportCsv").addEventListener("click", () => {
    const registrations = getRegistrations();
    const headers = ["id", "teamName", "participantName", "email", "phone", "college", "department", "year", "branch", "domain", "status"];
    const csv = [headers.join(","), ...registrations.map((item) => headers.map((key) => `"${String(item[key] || "").replaceAll('"', '""')}"`).join(","))].join("\n");
    downloadText("prismtech-registrations.csv", csv);
  });
  $("#publishAnnouncement").addEventListener("click", () => {
    const message = prompt("Announcement text");
    if (!message) return;
    const announcements = JSON.parse(localStorage.getItem("prismtechAnnouncements") || JSON.stringify(defaultAnnouncements));
    announcements.unshift(message);
    localStorage.setItem("prismtechAnnouncements", JSON.stringify(announcements));
    renderAnnouncements();
  });
  $("#generateCertificates").addEventListener("click", () => alert("Certificate generation queued for approved participants."));
}

function setupSimpleForms() {
  ["contactForm", "sponsorForm"].forEach((id) => {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      alert("Thank you. Your enquiry has been recorded for follow-up.");
      form.reset();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  $(".nav-toggle").addEventListener("click", (event) => {
    const nav = $(".site-nav");
    nav.classList.toggle("open");
    event.currentTarget.setAttribute("aria-expanded", nav.classList.contains("open"));
  });
  document.querySelectorAll(".site-nav a").forEach((link) => link.addEventListener("click", () => $(".site-nav").classList.remove("open")));
  updateCountdown();
  setInterval(updateCountdown, 1000);
  renderAnnouncements();
  setupRegistration();
  setupDashboard();
  setupAdmin();
  setupSimpleForms();
  renderAdminTable();
});
