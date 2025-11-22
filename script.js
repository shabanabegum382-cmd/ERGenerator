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

const FIXED_HOLIDAYS_2025 = ["01-01","14-03","31-03","18-04","15-08","27-08","05-09","02-10","20-10","21-10","01-11","25-12"];

function isFixedHoliday(dateStr) {
  const [d, m] = dateStr.split("-");
  return FIXED_HOLIDAYS_2025.includes(`${d}-${m}`);
}

function getRandomStore() {
  let available = STORES.filter(s => s !== lastStore);
  const store = available[Math.floor(Math.random() * available.length)] || STORES[0];
  lastStore = store;
  return store;
}

function createDefaultEntry(dateStr) {
  const [d, m, y] = dateStr.split("-");
  const dateObj = new Date(`20${y}`, m - 1, d);
  const dayName = dateObj.toLocaleString('en-us', { weekday: 'short' });

  const isSunday = dayName === "Sun";
  const isHoliday = isFixedHoliday(dateStr);

  if (isSunday) {
    return { date: dateStr, day: "Week Off", store: "Week Off", daily: 0, travel: 0, local: 0, fare: 0, meals: 0, hotel: 0, mobile: 0, courier: 0, others: 0 };
  } else if (isHoliday) {
    return { date: dateStr, day: "Holiday", store: "Holiday", daily: 0, travel: 0, local: 0, fare: 0, meals: 0, hotel: 0, mobile: 0, courier: 0, others: 0 };
  } else {
    return { date: dateStr, day: dayName, store: getRandomStore(), daily: 300, travel: 0, local: 0, fare: 0, meals: 0, hotel: 0, mobile: 0, courier: 0, others: 0 };
  }
}

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

function renderTable() {
  const tbody = document.getElementById("tableBody");
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

  const t = Object.values(entries).reduce((a, e) => ({
    daily: a.daily + e.daily, travel: a.travel + e.travel, local: a.local + e.local,
    fare: a.fare + e.fare, meals: a.meals + e.meals, hotel: a.hotel + e.hotel,
    mobile: a.mobile + e.mobile, courier: a.courier + e.courier, others: a.others + e.others
  }), {daily:0, travel:0, local:0, fare:0, meals:0, hotel:0, mobile:0, courier:0, others:0});

  document.getElementById("tDaily").textContent = t.daily;
  document.getElementById("tTravel").textContent = t.travel;
  document.getElementById("tLocal").textContent = t.local;
  document.getElementById("tFare").textContent = t.fare;
  document.getElementById("tMeals").textContent = t.meals;
  document.getElementById("tHotel").textContent = t.hotel;
  document.getElementById("tMobile").textContent = t.mobile;
  document.getElementById("tCourier").textContent = t.courier;
  document.getElementById("tOthers").textContent = t.others;
  document.getElementById("totalClaim").value = t.daily + t.meals + t.hotel + t.mobile + t.courier;
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
  document.querySelector('.controls').style.display = 'none';
  document.querySelector('.print-btn').style.display = 'none';
  setTimeout(() => {
    const opt = {
      margin: [0.1, 0.1, 0.1, 0.1],
      filename: `ER_${document.getElementById('empName').value.replace(/ /g, '_')}_${document.getElementById('monthYear').value}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2.2 },
      jsPDF: { unit: 'in', format: [11, 8.5], orientation: 'landscape' }
    };
    html2pdf().set(opt).from(document.querySelector('.container')).save().then(() => {
      document.querySelector('.controls').style.display = 'flex';
      document.querySelector('.print-btn').style.display = 'block';
    });
  }, 100);
}

// Mobile & Other Modals (same as before - working)
function openMobileModal() { /* same code as before */ }
function submitMobile() { /* same */ }
function openExpenseModal(type) { /* same */ }
function submitModal() { /* same */ }

window.onload = () => {
  document.getElementById("monthYear").value = "2025-11";
  generateER();
};
