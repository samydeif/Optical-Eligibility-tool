// ===============================
// Date Pickers
// ===============================

flatpickr("#policyStart", {
  dateFormat: "d/m/Y",
  allowInput: false
});

flatpickr("#lastGlasses", {
  dateFormat: "d/m/Y",
  allowInput: false
});

// ===============================
// Buttons
// ===============================

document.getElementById("checkBtn").addEventListener("click", () => {
  showSpinner();
  setTimeout(calculateEligibility, 600);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  location.reload();
});

// ===============================
// Language
// ===============================

let currentLang = "en";
let agentData = null;

function generateCaseId() {

  const now = new Date();

  const datePart =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  const random =
    Math.floor(1000 + Math.random() * 9000);

  return `CASE-${datePart}-${random}`;
}

document.getElementById("langToggle").addEventListener("click", () => {

  const html = document.documentElement;

  if (html.dir === "ltr") {

    currentLang = "ar";

    html.dir = "rtl";

    document.getElementById("title").innerHTML =
      "👓 أداة حساب أهلية النظارات";

    document.getElementById("policyLabel").childNodes[0].textContent =
      "تاريخ بداية البوليصة";

    document.getElementById("cycleLabel").childNodes[0].textContent =
      "دورة الاستحقاق";

    document.getElementById("lastLabel").childNodes[0].textContent =
      "تاريخ آخر نظارة";

    document.getElementById("checkBtn").innerHTML =
      "✔️ تحقق";

    document.getElementById("resetBtn").innerHTML =
      "🔄 إعادة ضبط";

  } else {

    currentLang = "en";

    html.dir = "ltr";

    document.getElementById("title").innerHTML =
      "👓 Glasses Eligibility Tool";

    document.getElementById("policyLabel").childNodes[0].textContent =
      "Policy Start Date";

    document.getElementById("cycleLabel").childNodes[0].textContent =
      "Cycle Rule (Years)";

    document.getElementById("lastLabel").childNodes[0].textContent =
      "Last Glasses Date";

    document.getElementById("checkBtn").innerHTML =
      "✔️ CHECK";

    document.getElementById("resetBtn").innerHTML =
      "🔄 RESET";
  }

  updateDateTime();
});

// ===============================
// Dark Mode
// ===============================

document.getElementById("modeToggle").addEventListener("click", () => {

  document.body.classList.toggle("dark");

  const btn = document.getElementById("modeToggle");

  btn.innerHTML =
    document.body.classList.contains("dark")
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
});

// ===============================
// Spinner
// ===============================

function showSpinner() {

  document
    .getElementById("spinner")
    .classList.remove("hidden");

  document.getElementById("output").innerHTML = "";
}

function hideSpinner() {

  document
    .getElementById("spinner")
    .classList.add("hidden");
}

// ===============================
// Date Formatting
// ===============================

function formatDate(date) {

  const day =
    String(date.getDate()).padStart(2, "0");

  const month =
    String(date.getMonth() + 1).padStart(2, "0");

  const year =
    date.getFullYear();

  return `${day}/${month}/${year}`;
}

// ===============================
// Parse DD/MM/YYYY
// ===============================

function parseDate(value) {

  const parts = value.split("/");

  if (parts.length !== 3) return null;

  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const year = parseInt(parts[2]);

  const date = new Date(year, month, day);

  if (
    date.getDate() !== day ||
    date.getMonth() !== month ||
    date.getFullYear() !== year
  ) {
    return null;
  }

  return date;
}

// ===============================
// Excel Logic
// ===============================
let latestResult = null;
function calculateEligibility() {

  hideSpinner();

  const policyInput =
    document.getElementById("policyStart").value;

  const lastInput =
    document.getElementById("lastGlasses").value;

  const cycleRule =
    parseInt(
      document.getElementById("cycleRule").value
    );

  const output =
    document.getElementById("output");

  // Validation

  if (
    !policyInput ||
    !lastInput ||
    !cycleRule
  ) {

    output.innerHTML = `
      <div class="result-not">
        <h2>⚠️ Error</h2>
        <p>
          ${
            currentLang === "ar"
              ? "برجاء إدخال جميع البيانات المطلوبة"
              : "Please complete all fields"
          }
        </p>
      </div>
    `;

    return;
  }

  const policyStart =
    parseDate(policyInput);

  const lastGlasses =
    parseDate(lastInput);

  if (!policyStart || !lastGlasses) {

    output.innerHTML = `
      <div class="result-not">
        <h2>⚠️ Error</h2>
        <p>
          ${
            currentLang === "ar"
              ? "صيغة التاريخ غير صحيحة"
              : "Invalid date format"
          }
        </p>
      </div>
    `;

    return;
  }

  const today = new Date();

  if (lastGlasses > today) {

    output.innerHTML = `
      <div class="result-not">
        <h2>⚠️ Error</h2>
        <p>
          ${
            currentLang === "ar"
              ? "تاريخ آخر نظارة لا يمكن أن يكون في المستقبل"
              : "Last glasses date cannot be in the future"
          }
        </p>
      </div>
    `;

    return;
  }

  // ==========================
  // Excel Formula
  // ==========================

  let glassesPolicyStart;

  if (lastGlasses >= policyStart) {

    glassesPolicyStart =
      new Date(policyStart);

  } else {

    glassesPolicyStart =
      new Date(
        lastGlasses.getFullYear(),
        policyStart.getMonth(),
        policyStart.getDate()
      );
  }

  const nextEligibleDate =
    new Date(glassesPolicyStart);

  nextEligibleDate.setFullYear(
    nextEligibleDate.getFullYear() +
    cycleRule
  );

  const status =
    today >= nextEligibleDate
      ? "Eligible"
      : "Not Eligible";
  let progressPercent = 100;

if (status === "Not Eligible") {

  const totalCycleDays =
    cycleRule * 365;

  const elapsedDays =
    Math.max(
      0,
      totalCycleDays -
      Math.ceil(
        (nextEligibleDate - today) /
        (1000 * 60 * 60 * 24)
      )
    );

  progressPercent =
    Math.min(
      100,
      Math.round(
        (elapsedDays / totalCycleDays) * 100
      )
    );
}

  const reason =
    status === "Eligible"
      ? (
        currentLang === "ar"
          ? "الدورة مكتملة"
          : "Cycle Completed"
      )
      : (
        currentLang === "ar"
          ? "الدورة لم تكتمل بعد"
          : "Cycle Not Completed Yet"
      );

  const caseId = generateCaseId();

  document.getElementById("caseId").textContent =
    caseId;
   
 

  // Remaining

  const diff =
    nextEligibleDate - today;

  const remainingDays =
    Math.max(
      0,
      Math.ceil(
        diff /
        (1000 * 60 * 60 * 24)
      )
    );
  latestResult = {
  caseId,
  status,
  cycleRule,
  policyStart,
  lastGlasses,
  glassesPolicyStart,
  nextEligibleDate,
  remainingDays,
  reason
 };  

  output.innerHTML = `
    <div class="${
      status === "Eligible"
        ? "result-eligible"
        : "result-not"
    }">

      <h2>
        ${
          status === "Eligible"
            ? "✅"
            : "❌"
        }

        ${
          currentLang === "ar"
            ? (
              status === "Eligible"
                ? "مؤهل"
                : "غير مؤهل"
            )
            : status
        }
      </h2>

      <p>
        ${
          currentLang === "ar"
            ? "بداية البوليصة"
            : "Policy Start"
        }
        :
        ${formatDate(policyStart)}
      </p>

      <p>
        ${
          currentLang === "ar"
            ? "بداية دورة النظارة"
            : "Glasses Policy Start"
        }
        :
        ${formatDate(glassesPolicyStart)}
      </p>

      <p>
        ${
          currentLang === "ar"
            ? "تاريخ الاستحقاق القادم"
            : "Next Eligible Date"
        }
        :
        ${formatDate(nextEligibleDate)}
      </p>

      <p>
        ${
          currentLang === "ar"
            ? "السبب"
            : "Reason"
        }
        :
        ${reason}
      </p>

      <p>
        ${
          currentLang === "ar"
            ? "الأيام المتبقية"
            : "Remaining Days"
        }
        :
        ${remainingDays}
      </p>
      <div class="progress-container">

        <div
          class="progress-bar"
          style="width:${progressPercent}%">

       </div>

</div>

<p>
  Progress:
  ${progressPercent}%
</p>
<div class="timeline">

  <div class="timeline-item">
    Policy Start:
    ${formatDate(policyStart)}
  </div>

  <div class="timeline-item">
    Last Glasses:
    ${formatDate(lastGlasses)}
  </div>

  <div class="timeline-item">
    Today:
    ${formatDate(today)}
  </div>

  <div class="timeline-item">
    Next Eligible:
    ${formatDate(nextEligibleDate)}
  </div>

 </div>

    </div>
  `;
  document
  .getElementById("auditSection")
  .classList.remove("hidden");

document
  .getElementById("auditContent")
  .innerHTML = `

  <p>
    <strong>Cycle Rule:</strong>
    ${cycleRule}
    ${currentLang === "ar" ? "سنة" : "Year(s)"}
  </p>

  <p>
    <strong>Glasses Policy Start:</strong>
    ${formatDate(glassesPolicyStart)}
  </p>

  <p>
    <strong>Next Eligible Date:</strong>
    ${formatDate(nextEligibleDate)}
  </p>

  <p>
    <strong>Status:</strong>
    ${status}
  </p>

  <p>
    <strong>Case ID:</strong>
    ${caseId}
  </p>
`;
} 

// ===============================
// Live Date & Time
// ===============================

function updateDateTime() {

  const now = new Date();

  const options = {

    weekday: "short",

    day: "2-digit",

    month: "short",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",

    second: "2-digit"
  };

  const element =
    document.getElementById("dateTime");

  if (element) {

    element.textContent =
      now.toLocaleString(
        currentLang === "ar"
          ? "ar-EG"
          : "en-GB",
        options
      );
  }
}

updateDateTime();
setInterval(updateDateTime, 1000);
// ===============================
// Export PDF
// ===============================

document
  .getElementById("exportPdfBtn")
  ?.addEventListener("click", exportPDF);

function exportPDF() {

  if (!latestResult) {

    alert(
      currentLang === "ar"
        ? "قم بعمل Check أولاً"
        : "Please run eligibility check first"
    );

    return;
  }

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  doc.setDrawColor(0,163,224);
  doc.line(15,30,195,30);

  doc.setFontSize(18);

  doc.text(
    "MetLife Egypt - Glasses Eligibility Report",
    20,
    20
  );

  doc.setFontSize(12);

  let y = 75;

  doc.text(
  `Agent: ${agentData?.name || "N/A"}`,
  20,
  45
);

doc.text(
  `Department: ${agentData?.department || "N/A"}`,
  20,
  55
);

doc.text(
  `Case ID: ${latestResult.caseId}`,
  20,
  65
);

  y += 10;

  doc.text(
    `Status: ${latestResult.status}`,
    20,
    y
  );

  y += 10;

  doc.text(
    `Cycle Rule: ${latestResult.cycleRule} Year(s)`,
    20,
    y
  );

  y += 10;

  doc.text(
    `Policy Start: ${formatDate(latestResult.policyStart)}`,
    20,
    y
  );

  y += 10;

  doc.text(
    `Last Glasses: ${formatDate(latestResult.lastGlasses)}`,
    20,
    y
  );

  y += 10;

  doc.text(
    `Glasses Policy Start: ${formatDate(latestResult.glassesPolicyStart)}`,
    20,
    y
  );

  y += 10;

  doc.text(
    `Next Eligible Date: ${formatDate(latestResult.nextEligibleDate)}`,
    20,
    y
  );

  y += 10;

  doc.text(
    `Remaining Days: ${latestResult.remainingDays}`,
    20,
    y
  );

  y += 10;

  doc.text(
    `Reason: ${latestResult.reason}`,
    20,
    y
  );

  y += 20;

  doc.setFontSize(10);

  doc.text(
    `Generated: ${new Date().toLocaleString()}`,
    20,
    y
  );

  y += 10;

  doc.text(
    "MetLife Egypt - Internal Use Only",
    20,
    y
  );

  doc.save(
    `${latestResult.caseId}.pdf`
  );
}

// =======================
// Agent Popup
// =======================

window.addEventListener("load", () => {

  const savedAgent =
    sessionStorage.getItem("agentData");

  if(savedAgent){

    agentData =
      JSON.parse(savedAgent);

    showAgentInfo();

    document
      .getElementById("agentModal")
      .style.display = "none";
  }
});

const saveBtn =
  document.getElementById("saveAgentBtn");

if (saveBtn) {
  saveBtn.addEventListener(
    "click",
    saveAgent
  );
}

function saveAgent(){

  const name =
    document
      .getElementById("agentName")
      .value
      .trim();

  const department =
    document
      .getElementById("agentDepartment")
      .value;

  if(!name || !department){

    alert(
    currentLang === "ar"
    ? "برجاء إدخال الاسم والقسم"
    : "Please enter Agent Name and Department"
    );

    return;
  }

  agentData = {
    name,
    department
  };

  sessionStorage.setItem(
    "agentData",
    JSON.stringify(agentData)
  );

  document
    .getElementById("agentModal")
    .style.display = "none";

  showAgentInfo();
}

function showAgentInfo(){

  const box =
    document.getElementById("agentInfo");

  box.classList.remove("hidden");

  box.innerHTML = `
    <i class="fa-solid fa-user"></i>

    <strong>${agentData.name}</strong>

    <br>

    <small>
      ${agentData.department}
    </small>
  `;
}


