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

// Only these dates are Holiday in 2025 (DD-MM)
const FIXED_HOLIDAYS_2025 = [
  "01-01","14-03","31-03","18-04","15-08","27-08",
  "05-09","02-10","20-10","21-10","01-11","25-12"
];

function isHoliday(dateStr) {
  const [d, m] = dateStr.split("-");
  const key = `${d}-${m}`;
  return FIXED_HOLIDAYS_2025.includes(key);
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
  select.innerHTML = "<option value=''>-- Select Date --</option>";

  for (let d = 1; d <= days; d++) {
    const dateStr = `${d.toString().padStart(2,'0')}-${month}-${year.slice(2)}`;
    const opt = document.createElement("option");
    opt.value = dateStr;
    opt.textContent = dateStr;
    if (entries[dateStr] && entries[dateStr].day === "Holiday") opt.disabled = true;
    select.appendChild(opt);
  }

  const used = Object.values(entries).reduce((a, e) => a + (e.mobile || 0), 0);
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

  const used = Object.values(entries).reduce((a, e) => a + (e.mobile || 0), 0);
  const current = entries[dateStr]?.mobile || 0;
  if (used - current + amount > 1500) return alert(`Max ₹1500! Remaining: ₹${1500 - (used - current)}`);

  if (!entries[dateStr]) entries[dateStr] = createDefaultEntry(dateStr);
  entries[dateStr].mobile = amount;

  closeMobileModal();
  renderTable();
}

// Other Expenses
function openExpenseModal(type) {
  const monthYear = document.getElementById("monthYear").value;
  if (!monthYear) return alert("Select Month & Year!");

  const [year, month] = monthYear.split("-");
  const days = new Date(year, month, 0).getDate();

  document.getElementById("modalTitle").textContent = 
    type === 'meals' ? 'Add Meals ₹400' : 
    type === 'hotel' ? 'Add Hotel Stay' : 'Add Courier';

  const body = document.getElementById("modalBody");
  body.innerHTML = `
    <label>Date:</label>
    <select id="modalDateSelect">
      <option value="">-- Select Date --</option>
      ${Array.from({length: days}, (_, i) => {
        const d = i+1;
        const dateStr = `${d.toString().padStart(2,'0')}-${month}-${year.slice(2)}`;
        const disabled = entries[dateStr]?.day === "Holiday" ? "disabled" : "";
        return `<option value="${dateStr}" ${disabled}>${dateStr}</option>`;
      }).join('')}
    </select>
    ${type === 'meals' ? '<input type="hidden" id="modalAmount" value="400" />' : 
      `<label>Amount:</label><input type="number" id="modalAmount" ${type==='hotel' ? 'value="1770"' : ''} placeholder="Enter amount" />`}
  `;

  document.getElementById("inputModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("inputModal").style.display = "none";
}

function submitModal() {
  const dateStr = document.getElementById("modalDateSelect").value;
  if (!dateStr) return alert("Select a date!");

  const amount = document.getElementById("modalAmount") 
    ? parseInt(document.getElementById("modalAmount").value) || 0 
    : 400;

  if (!entries[dateStr]) entries[dateStr] = createDefaultEntry(dateStr);

  const title = document.getElementById("modalTitle").textContent;
  if (title.includes("Meals")) entries[dateStr].meals = 400;
  else if (title.includes("Hotel")) entries[dateStr].hotel = amount;
  else entries[dateStr].courier = amount;

  closeModal();
  renderTable();
}

function createDefaultEntry(dateStr) {
  const [d, m, y] = dateStr.split("-");
  const dateObj = new Date(`20${y}`, m-1, d);
  const dayName = dateObj.toLocaleString('en-us', {weekday: 'short'});
  
  const holiday = isHoliday(dateStr) || dayName === "Sun";

  return {
    date: dateStr,
    day: holiday ? "Holiday" : dayName,
    store: holiday ? "Holiday" : getRandomStore(),
    daily: holiday ? 0 : 300,
    travel: 0, local: 0, fare: 0, meals: 0, hotel: 0, mobile: 0, courier: 0, others: 0
  };
}

// Generate ER
function generateER() {
  const monthYear = document.getElementById("monthYear").value;
  if (!monthYear) return alert("Select Month & Year!");

  const [year, month] = monthYear.split("-");
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = new Date(year, month-1).toLocaleString('en-us', {month: 'short'});

  entries = {};
  let workingDays = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${d.toString().padStart(2,'0')}-${month}-${year.slice(2)}`;
    entries[dateStr] = createDefaultEntry(dateStr);
    if (entries[dateStr].daily === 300) workingDays++;
  }

  document.getElementById("claimPeriod").value = `01-${monthName}-${year.slice(2)} to ${daysInMonth}-${monthName}-${year.slice(2)}`;
  document.getElementById("workingDays").value = workingDays;
  renderTable();
}

// Render Table
function renderTable() {
  const tbody = document.getElementById("tableBody");  // ← YEH LINE THIK KI HAI AB
  tbody.innerHTML = "";

  Object.keys(entries).sort().forEach(dateStr => {
    const e = entries[dateStr];
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td ondblclick="editCell('${dateStr}', 'date')">${e.date}</td>
      <td ondblclick="editCell('${dateStr}', 'day')">${e.day}</td>
      <td ondblclick="editCell('${dateStr}', 'store')">${e.store}</td>
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

  // Totals
  const t = Object.values(entries).reduce((a, e) => ({
    daily: a.daily + e.daily,
    meals: a.meals + e.meals,
    hotel: a.hotel + e.hotel,
    mobile: a.mobile + e.mobile,
    courier: a.courier + e.courier
  }), {daily:0, meals:0, hotel:0, mobile:0, courier:0});

  document.getElementById("tDaily").textContent = t.daily;
  document.getElementById("tMeals").textContent = t.meals;
  document.getElementById("tHotel").textContent = t.hotel;
  document.getElementById("tMobile").textContent = t.mobile;
  document.getElementById("tCourier").textContent = t.courier;

  document.getElementById("totalClaim").textContent = t.daily + t.meals + t.hotel + t.mobile + t.courier;
}

function editCell(dateStr, field) {
  const current = entries[dateStr][field];
  const value = prompt(`Edit ${field}:`, current);
  if (value !== null) {
    entries[dateStr][field] = isNaN(value) ? value.trim() : parseInt(value) || 0;
    renderTable();
  }
}

function downloadPDF() {
  const opt = {
    margin: 0.05,
    filename: `ER_${document.getElementById('empName').value.replace(/ /g, '_')}_${document.getElementById('monthYear').value}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2.2 },
    jsPDF: { unit: 'in', format: [10.8, 7.8], orientation: 'landscape' }
  };
  html2pdf().set(opt).from(document.querySelector('.container')).save();
}

window.onload = () => {
  document.getElementById("monthYear").value = "2025-11";
};
