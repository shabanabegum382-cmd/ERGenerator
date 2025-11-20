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

// Festival Holidays (Month-Day)
const FESTIVAL_HOLIDAYS = {
  "01-01": "Happy New Year",
  "03-25": "Holi",           // Approx, changes yearly
  "04-18": "Good Friday",    // 2025
  "04-10": "Eid Ul Fitr",    // Approx
  "08-15": "Independence Day",
  "09-07": "Ganesh Chaturthi", // Approx
  "09-16": "Eid e Milad",     // Approx
  "10-02": "Gandhi Jayanti",
  "10-31": "Diwali",          // Approx
  "11-01": "Diwali/Govardhan Puja",
  "11-01": "Karnataka Day",
  "12-25": "Christmas Day"
};

function isFestival(dateStr) {  // dateStr = "DD-MM-YYYY"
  const [day, month] = dateStr.split("-");
  const key = `${month}-${day}`;
  return FESTIVAL_HOLIDAYS[key];
}

function getRandomStore() {
  let available = STORES.filter(s => s !== lastStore);
  const store = available[Math.floor(Math.random() * available.length)] || STORES[0];
  lastStore = store;
  return store;
}

// Mobile Modal
function openMobileModal() {
  const monthYear = document.getElementById("monthYear").value;
  if (!monthYear) return alert("Select Month & Year!");

  const [year, month] = monthYear.split("-");
  const days = new Date(year, month, 0).getDate();
  const select = document.getElementById("mobileDate");
  select.innerHTML = "";

  for (let d = 1; d <= days; d++) {
    const dateStr = `${d.toString().padStart(2,'0')}-${month}-${year.slice(2)}`;
    const opt = document.createElement("option");
    opt.value = dateStr;
    opt.textContent = dateStr;
    if (entries[dateStr] && entries[dateStr].day === "Week Off") opt.disabled = true;
    select.appendChild(opt);
  }

  const used = Object.values(entries).reduce((a, e) => a + e.mobile, 0);
  document.getElementById("mobileRemaining").textContent = 1500 - used;
  document.getElementById("mobileModal").style.display = "flex";
}

function closeMobileModal() {
  document.getElementById("mobileModal").style.display = "none";
}

function submitMobile() {
  const dateStr = document.getElementById("mobileDate").value;
  const amount = parseInt(document.getElementById("mobileAmount").value) || 0;
  if (!dateStr || amount <= 0) return alert("Enter valid amount!");

  const totalUsed = Object.values(entries).reduce((a, e) => a + e.mobile, 0) - (entries[dateStr]?.mobile || 0);
  if (totalUsed + amount > 1500) return alert(`Max ₹1500 allowed! Remaining: ₹${1500 - totalUsed}`);

  if (!entries[dateStr]) entries[dateStr] = createDefaultEntry(dateStr);
  entries[dateStr].mobile = amount;

  closeMobileModal();
  renderTable();
}

// Other Expenses Modal
function openExpenseModal(type) {
  const monthYear = document.getElementById("monthYear").value;
  if (!monthYear) return alert("Select Month & Year!");

  const [year, month] = monthYear.split("-");
  const days = new Date(year, month, 0).getDate();

  const modal = document.getElementById("inputModal");
  const title = document.getElementById("modalTitle");
  const body = document.getElementById("modalBody");

  title.textContent = type === 'meals' ? 'Add Meals ₹400' : type === 'hotel' ? 'Add Hotel Stay' : 'Add Courier';
  body.innerHTML = `
    <label>Date:</label>
    <select id="modalDateSelect">
      ${Array.from({length: days}, (_, i) => {
        const d = i+1;
        const dateStr = `${d.toString().padStart(2,'0')}-${month}-${year.slice(2)}`;
        const disabled = entries[dateStr]?.day === "Week Off" ? "disabled" : "";
        return `<option value="${dateStr}" ${disabled}>${dateStr}</option>`;
      }).join('')}
    </select>
    ${type === 'meals' ? '<input type="hidden" id="modalAmount" value="400" />' : 
     type === 'hotel' ? '<label>Amount:</label><input type="number" id="modalAmount" value="1770" placeholder="1500 + tax" />' :
     '<label>Amount:</label><input type="number" id="modalAmount" placeholder="e.g. 120" />'}
  `;

  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("inputModal").style.display = "none";
}

function submitModal() {
  const dateStr = document.getElementById("modalDateSelect").value;
  const amount = parseInt(document.getElementById("modalAmount").value) || 0;

  if (!entries[dateStr]) entries[dateStr] = createDefaultEntry(dateStr);

  if (document.getElementById("modalTitle").textContent.includes("Meals")) {
    entries[dateStr].meals = 400;
  } else if (document.getElementById("modalTitle").textContent.includes("Hotel")) {
    entries[dateStr].hotel = amount;
  } else {
    entries[dateStr].courier = amount;
  }

  closeModal();
  renderTable();
}

function createDefaultEntry(dateStr) {
  const [d, m, y] = dateStr.split("-");
  const dateObj = new Date(`20${y}`, m-1, d);
  const dayName = dateObj.toLocaleString('en-us', {weekday: 'short'});
  return {
    date: dateStr,
    day: dayName === "Sun" || isFestival(dateStr) ? "Week Off" : dayName,
    store: dayName === "Sun" || isFestival(dateStr) ? (isFestival(dateStr) || "Week Off") : getRandomStore(),
    daily: dayName === "Sun" || isFestival(dateStr) ? 0 : 300,
    travel: 0, local: 0, fare: 0, meals: 0, hotel: 0, mobile: 0, courier: 0, others: 0
  };
}

// Generate ER
function generateER() {
  const monthYear = document.getElementById("monthYear").value;
  if (!monthYear) return alert("Select Month!");

  const [year, month] = monthYear.split("-");
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = new Date(year, month-1).toLocaleString('en-us', {month: 'short'});

  entries = {};
  let workingDays = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${d.toString().padStart(2,'0')}-${month}-${year.slice(2)}`;
    entries[dateStr] = createDefaultEntry(dateStr);
    if (entries[dateStr].daily > 0) workingDays++;
  }

  document.getElementById("claimPeriod").value = `01-${monthName}-${year.slice(2)} to ${daysInMonth}-${monthName}-${year.slice(2)}`;
  document.getElementById("workingDays").value = workingDays;
  renderTable();
}

// Render Table + Editable
function renderTable() {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  Object.keys(entries).sort().forEach(dateStr => {
    const e = entries[dateStr];
    const tr = document.createElement("tr");
    if (e.day === "Week Off") tr.classList.add("weekoff");

    tr.innerHTML = `
      <td ondblclick="editCell('${dateStr}', 'date')">${e.date}</td>
      <td>${e.day}</td>
      <td ondblclick="editCell('${dateStr}', 'store')" class="editable">${e.store}</td>
      <td></td>
      <td ondblclick="editCell('${dateStr}', 'daily')">${e.daily}</td>
      <td ondblclick="editCell('${dateStr}', 'travel')">${e.travel}</td>
      <td ondblclick="editCell('${dateStr}', 'local')">${e.local}</td>
      <td ondblclick="editCell('${dateStr}', 'fare')">${e.fare}</td>
      <td ondblclick="editCell('${dateStr}', 'meals')">${e.meals}</td>
      <td ondblclick="editCell('${dateStr}', 'hotel')">${e.hotel}</td>
      <td ondblclick="editCell('${dateStr}', 'mobile')">${e.mobile}</td>
      <td ondblclick="editCell('${dateStr}', 'courier')">${e.courier}</td>
      <td ondblclick="editCell('${dateStr}', 'others')">${e.others}</td>
    `;
    tbody.appendChild(tr);
  });

  const totals = Object.values(entries).reduce((a, e) => ({
    daily: a.daily + e.daily, travel: a.travel + e.travel, local: a.local + e.local,
    fare: a.fare + e.fare, meals: a.meals + e.meals, hotel: a.hotel + e.hotel,
    mobile: a.mobile + e.mobile, courier: a.courier + e.courier, others: a.others + e.others
  }), {daily:0, travel:0, local:0, fare:0, meals:0, hotel:0, mobile:0, courier:0, others:0});

  document.getElementById("tDaily").textContent = totals.daily;
  document.getElementById("tMeals").textContent = totals.meals;
  document.getElementById("tHotel").textContent = totals.hotel;
  document.getElementById("tMobile").textContent = totals.mobile;
  document.getElementById("tCourier").textContent = totals.courier;

  const totalClaim = totals.daily + totals.mobile + totals.courier + totals.meals + totals.hotel;
  document.getElementById("totalClaim").textContent = totalClaim;
}

// Double click edit
function editCell(dateStr, field) {
  if (field === "date") return;
  const value = prompt(`Edit ${field}`, entries[dateStr][field]);
  if (value !== null) {
    entries[dateStr][field] = isNaN(value) ? value : parseInt(value) || 0;
    renderTable();
  }
}

function downloadPDF() {
  const opt = {
    margin: [0.05, 0.05, 0.05, 0.05],
    filename: `ER_${document.getElementById('empName').value.replace(/ /g, '_')}_${document.getElementById('monthYear').value}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2.2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'in', format: [10.8, 7.8], orientation: 'landscape' }
  };
  html2pdf().set(opt).from(document.querySelector('.container')).save();
}

window.onload = () => {
  document.getElementById("monthYear").value = "2025-11";
};
