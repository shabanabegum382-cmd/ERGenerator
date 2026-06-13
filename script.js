const STORES = [
  "SHOPPERS STOP - L&T MALL, HYD","HEALTH & GLOW - ALKAPURI, HYD","HEALTH & GLOW-TOWLICHOWKI,HYD",
  "HEALTH & GLOW-INORBIT MALL,HDY","BEAUTY & BEYOND - GSM MALL, HYD","HEALTH & GLOW - NIZAMPET , HYD",
  "HEALTH & GLOW - GVK MALL, HYD","HEALTH & GLOW - GSM MALL, HYD","HEALTH & GLOW - SUJANA FORUM MALL, HYD",
  "LIFESTYLE - CYBERABAD , HYD","NYKAA ON TREND - BANJARA HILLS, HYD","SHOPPERS STOP - GVK ROAD , HYD",
  "SHOPPERS STOP-INORBIT MALL,HYD","CENTRO - KUKATPALLY, HYD","HEALTH & GLOW - BANJARA HILLS, HYD",
  "KATHIAVAR - JUBILEE HILLS, HYD","KATHIAWAR - GACHIBOWLI, HYD","GOWTHAM ENTERPRISES - YOUSUFGUDA, HYD",
  "SREEJA COSMETICS - AMEERPET, HYD"
];

let entries = {};
let lastStore = "";

// Fixed holidays by year (DD-MM). Add more years here as needed.
const FIXED_HOLIDAYS_BY_YEAR = {
  2025: ["01-01","14-03","31-03","18-04","15-08","27-08","05-09","02-10","20-10","21-10","01-11","25-12"],
  2026: ["01-01","03-03","21-03","27-03","03-04","01-05","15-08","26-08","02-10","21-10","22-10","25-12"]
};

function isFixedHoliday(dateStr, fullYear) {
  const [d, m] = dateStr.split("-");
  const list = FIXED_HOLIDAYS_BY_YEAR[fullYear] || [];
  return list.includes(`${d}-${m}`);
}

function getRandomStore() {
  let available = STORES.filter(s => s !== lastStore);
  const store = available[Math.floor(Math.random() * available.length)] || STORES[0];
  lastStore = store;
  return store;
}

function createDefaultEntry(dateStr, fullYear) {
  const [d, m, y] = dateStr.split("-");
  const dateObj = new Date(fullYear, m - 1, d);
  const dayName = dateObj.toLocaleString('en-us', { weekday: 'short' });

  const isSunday = dayName === "Sun";
  const isHoliday = isFixedHoliday(dateStr, fullYear);

  let dayLabel = "";
  let storeLabel = "";
  let dailyAmount = 0;

  if (isSunday) {
    dayLabel = "Week Off";
    storeLabel = "Week Off";
  } else if (isHoliday) {
    dayLabel = "Holiday";
    storeLabel = "Holiday";
  } else {
    dayLabel = dayName;
    storeLabel = getRandomStore();
    dailyAmount = 300;
  }

  return {
    date: dateStr,
    day: dayLabel,
    store: storeLabel,
    daily: dailyAmount,
    travel: 0, local: 0, fare: 0, meals: 0, hotel: 0, mobile: 0, courier: 0, others: 0
  };
}

// Generate ER
function generateER() {
  const monthYear = document.getElementById("monthYear").value;
  if (!monthYear) return alert("Select Month & Year!");

  const [year, month] = monthYear.split("-");
  const fullYear = parseInt(year);
  const daysInMonth = new Date(fullYear, month, 0).getDate();
  const monthName = new Date(fullYear, month - 1).toLocaleString('en-us', { month: 'short' });

  entries = {};
  let workingDays = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${d.toString().padStart(2, '0')}-${month}-${year.slice(2)}`;
    entries[dateStr] = createDefaultEntry(dateStr, fullYear);
    if (entries[dateStr].daily === 300) workingDays++;
  }

  document.getElementById("claimPeriod").value = `01-${monthName}-${year.slice(2)} to ${daysInMonth}-${monthName}-${year.slice(2)}`;
  document.getElementById("workingDays").value = workingDays;
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  Object.keys(entries).sort((a, b) => {
    // sort by DD-MM-YY chronologically
    const [da, ma, ya] = a.split("-");
    const [db, mb, yb] = b.split("-");
    return new Date(`20${ya}`, ma - 1, da) - new Date(`20${yb}`, mb - 1, db);
  }).forEach(dateStr => {
    const e = entries[dateStr];
    const tr = document.createElement("tr");

    if (e.day === "Week Off") tr.classList.add("weekoff");
    else if (e.day === "Holiday") tr.classList.add("holiday");

    tr.innerHTML = `
      <td>${e.date}</td>
      <td>${e.day}</td>
      <td class="editable" ondblclick="editCell('${dateStr}', 'store')">${e.store}</td>
      <td class="editable" ondblclick="editCell('${dateStr}', 'daily')">${e.daily}</td>
      <td class="editable" ondblclick="editCell('${dateStr}', 'travel')">${e.travel}</td>
      <td class="editable" ondblclick="editCell('${dateStr}', 'local')">${e.local}</td>
      <td class="editable" ondblclick="editCell('${dateStr}', 'fare')">${e.fare}</td>
      <td class="editable" ondblclick="editCell('${dateStr}', 'meals')">${e.meals}</td>
      <td class="editable" ondblclick="editCell('${dateStr}', 'hotel')">${e.hotel}</td>
      <td class="editable" ondblclick="editCell('${dateStr}', 'mobile')">${e.mobile}</td>
      <td class="editable" ondblclick="editCell('${dateStr}', 'courier')">${e.courier}</td>
      <td class="editable" ondblclick="editCell('${dateStr}', 'others')">${e.others}</td>
    `;
    tbody.appendChild(tr);
  });

  const t = Object.values(entries).reduce((a, e) => ({
    daily: a.daily + e.daily,
    travel: a.travel + e.travel,
    local: a.local + e.local,
    fare: a.fare + e.fare,
    meals: a.meals + e.meals,
    hotel: a.hotel + e.hotel,
    mobile: a.mobile + e.mobile,
    courier: a.courier + e.courier,
    others: a.others + e.others
  }), { daily: 0, travel: 0, local: 0, fare: 0, meals: 0, hotel: 0, mobile: 0, courier: 0, others: 0 });

  document.getElementById("tDaily").textContent = t.daily;
  document.getElementById("tTravel").textContent = t.travel;
  document.getElementById("tLocal").textContent = t.local;
  document.getElementById("tFare").textContent = t.fare;
  document.getElementById("tMeals").textContent = t.meals;
  document.getElementById("tHotel").textContent = t.hotel;
  document.getElementById("tMobile").textContent = t.mobile;
  document.getElementById("tCourier").textContent = t.courier;
  document.getElementById("tOthers").textContent = t.others;

  const grandTotal = t.daily + t.travel + t.local + t.fare + t.meals + t.hotel + t.mobile + t.courier + t.others;
  document.getElementById("totalClaim").textContent = grandTotal;
}

function editCell(dateStr, field) {
  const current = entries[dateStr][field];
  const value = prompt(`Edit ${field}:`, current);
  if (value !== null) {
    entries[dateStr][field] = isNaN(value) || value.trim() === "" ? value.trim() : parseInt(value) || 0;
    renderTable();
  }
}

// Mobile expense modal
function openMobileModal() {
  const monthYear = document.getElementById("monthYear").value;
  if (!monthYear) return alert("Select Month & Year!");
  if (Object.keys(entries).length === 0) return alert("Click 'Generate ER' first!");

  const [year, month] = monthYear.value ? monthYear.value.split("-") : monthYear.split("-");
  const days = new Date(year, month, 0).getDate();
  const select = document.getElementById("mobileDate");
  select.innerHTML = "<option value=''>-- Select Date --</option>";

  for (let d = 1; d <= days; d++) {
    const dateStr = `${d.toString().padStart(2,'0')}-${month}-${year.slice(2)}`;
    const opt = document.createElement("option");
    opt.value = dateStr;
    opt.textContent = dateStr;
    if (entries[dateStr] && (entries[dateStr].day === "Week Off" || entries[dateStr].day === "Holiday")) opt.disabled = true;
    select.appendChild(opt);
  }

  const used = Object.values(entries).reduce((a, e) => a + (e.mobile || 0), 0);
  document.getElementById("mobileRemaining").textContent = 1500 - used;
  document.getElementById("mobileModal").style.display = "flex";
}

function closeMobileModal() { document.getElementById("mobileModal").style.display = "none"; }

function submitMobile() {
  const dateStr = document.getElementById("mobileDate").value;
  const amount = parseInt(document.getElementById("mobileAmount").value) || 0;
  if (!dateStr) return alert("Select a date!");
  if (amount <= 0) return alert("Enter a valid amount!");

  const used = Object.values(entries).reduce((a, e) => a + (e.mobile || 0), 0);
  const current = entries[dateStr]?.mobile || 0;
  if (used - current + amount > 1500) return alert(`Max ₹1500! Remaining: ₹${1500 - (used - current)}`);

  entries[dateStr].mobile = amount;
  closeMobileModal();
  document.getElementById("mobileAmount").value = "";
  renderTable();
}

function openExpenseModal(type) {
  const monthYear = document.getElementById("monthYear").value;
  if (!monthYear) return alert("Select Month & Year!");
  if (Object.keys(entries).length === 0) return alert("Click 'Generate ER' first!");

  const [year, month] = monthYear.split("-");
  const days = new Date(year, month, 0).getDate();

  document.getElementById("modalTitle").textContent =
    type === 'meals' ? 'Add Meals ₹400' : type === 'hotel' ? 'Add Hotel Stay' : type === 'courier' ? 'Add Courier' : 'Add Activity / Others';

  document.getElementById("modalBody").innerHTML = `
    <label>Date:</label>
    <select id="modalDateSelect">
      <option value="">-- Select Date --</option>
      ${Array.from({length: days}, (_, i) => {
        const d = i+1;
        const dateStr = `${d.toString().padStart(2,'0')}-${month}-${year.slice(2)}`;
        const disabled = entries[dateStr] && (entries[dateStr].day === "Week Off" || entries[dateStr].day === "Holiday") ? "disabled" : "";
        return `<option value="${dateStr}" ${disabled}>${dateStr}</option>`;
      }).join('')}
    </select>
    ${type === 'meals' ? '<input type="hidden" id="modalAmount" value="400" />' :
      `<label>Amount:</label><input type="number" id="modalAmount" min="1" ${type==='hotel' ? 'value="1770"' : ''} placeholder="Enter amount" />`}
  `;

  document.getElementById("modalType").value = type;
  document.getElementById("inputModal").style.display = "flex";
}

function closeModal() { document.getElementById("inputModal").style.display = "none"; }

function submitModal() {
  const dateStr = document.getElementById("modalDateSelect").value;
  if (!dateStr) return alert("Select a date!");

  const type = document.getElementById("modalType").value;
  const amountInput = document.getElementById("modalAmount");
  const amount = amountInput ? (parseInt(amountInput.value) || 0) : 400;

  if (type !== "meals" && amount <= 0) return alert("Enter a valid amount!");

  if (type === "meals") entries[dateStr].meals = 400;
  else if (type === "hotel") entries[dateStr].hotel = amount;
  else if (type === "courier") entries[dateStr].courier = amount;
  else entries[dateStr].others = amount;

  closeModal();
  renderTable();
}

// Download as A4 landscape PDF, fit to one page
function downloadPDF() {
  if (Object.keys(entries).length === 0) {
    return alert("Click 'Generate ER' first!");
  }

  const controls = document.querySelector('.controls');
  const printBtn = document.querySelector('.print-btn');
  const container = document.querySelector('.container');

  controls.style.display = 'none';
  printBtn.style.display = 'none';

  // Temporarily switch to fixed pixel size matching A4 landscape @ 96dpi
  // A4 landscape = 297mm x 210mm = 11.69in x 8.27in
  const prevWidth = container.style.width;
  const prevMinHeight = container.style.minHeight;
  const prevMaxHeight = container.style.maxHeight;

  container.style.width = '11.69in';
  container.style.minHeight = '8.27in';
  container.style.maxHeight = '8.27in';

  setTimeout(() => {
    const opt = {
      margin: 0,
      filename: `ER_${(document.getElementById('empName').value || 'Employee').replace(/ /g, '_')}_${document.getElementById('monthYear').value || ''}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: container.scrollWidth,
        windowHeight: container.scrollHeight
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'landscape'
      },
      pagebreak: { mode: ['avoid-all'] }
    };

    html2pdf().set(opt).from(container).save().then(() => {
      controls.style.display = 'flex';
      printBtn.style.display = 'block';
      container.style.width = prevWidth;
      container.style.minHeight = prevMinHeight;
      container.style.maxHeight = prevMaxHeight;
    });
  }, 100);
}
