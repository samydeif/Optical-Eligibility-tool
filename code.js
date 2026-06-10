// زرار CHECK
document.getElementById("checkBtn").addEventListener("click", () => {
  showSpinner();
  setTimeout(calculateEligibility, 1000);
});
document.getElementById("resetBtn").addEventListener("click", () => location.reload());

// Light/Dark Mode toggle
document.getElementById("modeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const btn = document.getElementById("modeToggle");
  btn.innerHTML = document.body.classList.contains("dark")
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
});

// Language toggle
let currentLang = "en"; // default English
document.getElementById("langToggle").addEventListener("click", () => {
  const htmlTag = document.querySelector("html");
  const currentDir = htmlTag.getAttribute("dir");

  if (currentDir === "ltr") {
    currentLang = "ar";
    htmlTag.setAttribute("dir", "rtl");
    document.getElementById("title").innerText = "أداة حساب أهلية النظارات";
    document.getElementById("policyLabel").innerText = "تاريخ بداية البوليصة:";
    document.getElementById("cycleLabel").innerText = "دورة الاستحقاق (بالسنوات):";
    document.getElementById("lastLabel").innerText = "تاريخ آخر نظارة:";
    document.getElementById("checkBtn").innerText = "✔️ تحقق";
    document.getElementById("resetBtn").innerText = "🔄 إعادة ضبط";
    updateDateTime();
  } else {
    currentLang = "en";
    htmlTag.setAttribute("dir", "ltr");
    document.getElementById("title").innerText = "Glasses Eligibility Tool";
    document.getElementById("policyLabel").innerText = "Policy Start Date:";
    document.getElementById("cycleLabel").innerText = "Cycle Rule (years):";
    document.getElementById("lastLabel").innerText = "Last Glasses Date:";
    document.getElementById("checkBtn").innerText = "✔️ CHECK";
    document.getElementById("resetBtn").innerText = "🔄 RESET";
    
  }
});

// Spinner
function showSpinner() {
  document.getElementById("spinner").classList.remove("hidden");
  document.getElementById("output").innerHTML = "";
}
function hideSpinner() {
  document.getElementById("spinner").classList.add("hidden");
}
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

// Eligibility calculation
function calculateEligibility() {
  hideSpinner();

  const policyStartInput = document.getElementById("policyStart").value;
  const cycleRuleInput = document.getElementById("cycleRule").value;
  const lastGlassesInput = document.getElementById("lastGlasses").value;

  const output = document.getElementById("output");

  if (!policyStartInput || !cycleRuleInput) {
    output.innerHTML = `<div class="result-not"><h2>⚠️ ${
      currentLang === "ar" ? "خطأ" : "Error"
    }</h2><p>${currentLang === "ar" ? "بداية البوليصة" : "Policy Start"}: ${formatDate(policyStart)}</p>

<p>${currentLang === "ar" ? "تاريخ الاستحقاق القادم" : "Next Eligible Date"}: ${formatDate(nextEligibleDate)}</p></div>`;
    return;
  }

  const policyStart = new Date(policyStartInput);
  const cycleRule = parseInt(cycleRuleInput);
  const lastGlasses = lastGlassesInput ? new Date(lastGlassesInput) : null;

  let nextEligibleDate, status, reason;

  if (!lastGlasses || isNaN(lastGlasses.getTime())) {
    status = "Eligible";
    reason = currentLang === "ar" ? "لم يتم عمل نظارة من قبل" : "No glasses claimed before";
    nextEligibleDate = policyStart;
  } else {
    if (lastGlasses < policyStart) {
      if (cycleRule === 1) {
        status = "Eligible";
        reason =
          currentLang === "ar"
            ? "آخر نظارة كانت قبل بداية البوليصة ودورة الاستحقاق سنة واحدة"
            : "Last glasses before policy start, cycle = 1 year";
        nextEligibleDate = policyStart;
      } else {
        status = "Not Eligible";
        reason =
          currentLang === "ar"
            ? "آخر نظارة كانت قبل بداية البوليصة ودورة الاستحقاق سنتين"
            : "Last glasses before policy start, cycle = 2 years";
        nextEligibleDate = new Date(policyStart);
        nextEligibleDate.setFullYear(nextEligibleDate.getFullYear() + 1);
      }
    } else {
      nextEligibleDate = new Date(lastGlasses);
      nextEligibleDate.setFullYear(nextEligibleDate.getFullYear() + cycleRule);

      if (new Date() >= nextEligibleDate) {
        status = "Eligible";
        reason = currentLang === "ar" ? "الدورة انتهت" : "Cycle completed";
      } else {
        status = "Not Eligible";
        reason = currentLang === "ar" ? "الدورة لم تنته بعد" : "Cycle not completed yet";
      }
    }
  }

  const remaining = Math.max(0, nextEligibleDate - new Date());
  const months = Math.floor(remaining / (1000 * 60 * 60 * 24 * 30));
  const days = Math.floor((remaining / (1000 * 60 * 60 * 24)) % 30);

  output.innerHTML = `
    <div class="${status === 'Eligible' ? 'result-eligible' : 'result-not'}">
      <h2>${status === 'Eligible' ? '✅' : '❌'} ${
    currentLang === "ar" ? "الحالة" : "Status"
  }: ${currentLang === "ar" ? (status === "Eligible" ? "مؤهل" : "غير مؤهل") : status}</h2>
      <p>${currentLang === "ar" ? "بداية البوليصة" : "Policy Start"}: ${policyStart.toDateString()}</p>
      <p>${currentLang === "ar" ? "تاريخ الاستحقاق القادم" : "Next Eligible Date"}: ${nextEligibleDate.toDateString()}</p>
      <p>${currentLang === "ar" ? "السبب" : "Reason"}: ${reason}</p>
      <p>${currentLang === "ar" ? "الوقت المتبقي" : "Remaining Time"}: ${months} ${
    currentLang === "ar" ? "شهور" : "months"
  } ${days} ${currentLang === "ar" ? "أيام" : "days"}</p>
    </div>
  `;
}
// ===============================
// Live Date & Time
// ===============================
function updateDateTime() {
  const now = new Date();

  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  };

  const dateTimeElement = document.getElementById("dateTime");

  if (dateTimeElement) {
    dateTimeElement.textContent = now.toLocaleString(
      currentLang === "ar" ? "ar-EG" : "en-US",
      options
    );
  }
}

// تشغيل أول مرة
updateDateTime();

// تحديث كل ثانية
setInterval(updateDateTime, 1000);

