const STORES = [
"SHOPPERS STOP - L&T MALL, HYD",
"HEALTH & GLOW - ALKAPURI, HYD",
"HEALTH & GLOW-TOWLICHOWKI,HYD",
"HEALTH & GLOW-INORBIT MALL,HDY",
"BEAUTY & BEYOND - GSM MALL, HYD",
"HEALTH & GLOW - NIZAMPET , HYD",
"HEALTH & GLOW - GVK MALL, HYD",
"HEALTH & GLOW - GSM MALL, HYD",
"HEALTH & GLOW - SUJANA FORUM MALL, HYD",
"LIFESTYLE - CYBERABAD , HYD",
"NYKAA ON TREND - BANJARA HILLS, HYD",
"SHOPPERS STOP - GVK ROAD , HYD",
"SHOPPERS STOP-INORBIT MALL,HYD",
"CENTRO - KUKATPALLY, HYD",
"HEALTH & GLOW - BANJARA HILLS, HYD",
"KATHIAVAR - JUBILEE HILLS, HYD",
"KATHIAWAR - GACHIBOWLI, HYD",
"GOWTHAM ENTERPRISES - YOUSUFGUDA, HYD",
"SREEJA COSMETICS - AMEERPET, HYD"
];

let entries = {};
let lastStore = "";
let modalType = "";
let modalDate = "";

function getRandomStore() {
  let available = STORES.filter(s => s !== lastStore);
  const store = available[Math.floor(Math.random() * available.length)] || STORES[0];
  lastStore = store;
  return store;
}

// Open Modal with Date + Amount
function openExpenseModal(type) {
  const monthYear = document.getElementById("monthYear").value;
  if (!monthYear) return alert("Select Month & Year!");

  modalType = type;
  const [year, month] = monthYear.split("-");
  const days = new Date(year, month, 0).getDate();

  const modal = document.getElementById("inputModal");
  const title = document.getElementById("modalTitle");
  const body = document.getElementById("modalBody");

  title.textContent = getTitle(type);
  body.innerHTML = `
    <label>Date (1-${days}):</label>
    <input type="number" id="modalDateInput" min="1" max="${days}" placeholder="e.g. 15" />
    ${getAmountField(type, year, month)}
  `;

  modal.style.display = "flex";
  document.getElementById("modalDateInput").focus();
}

function openHolidayModal() {
  const monthYear = document.getElementById("monthYear").value;
  if (!monthYear) return alert("Select Month & Year!");

  modalType = "holiday";
  const [year, month] = monthYear.split("-");
  const days = new Date(year, month, 0).getDate();

  const modal = document.getElementById("inputModal");
  const title = document.getElementById("modalTitle");
  const body = document.getElementById("modalBody");

  title.textContent = "Add Holiday/Leave";
  body.innerHTML = `
    <label>Date (1-${days}):</label>
    <input type="number" id="modalDateInput" min="1" max="${days}" placeholder="e.g. 15" />
    <label>Remark:</label>
    <input type="text" id="modalRemark" placeholder="Holiday / Leave" value="Holiday" />
  `;

  modal.style.display = "flex";
  document.getElementById("modalDateInput").focus();
}

function getTitle(type) {
  switch(type) {
    case 'mobile': return 'Add Mobile Expense';
    case 'courier': return 'Add Courier Expense';
    case 'meals': return 'Add Meals (₹400)';
    case 'hotel': return 'Add Hotel Expense';
    default: return 'Add Expense';
  }
}

function getAmountField(type, year, month) {
  if (type === 'meals') {
    return `<input type="hidden" id="modalAmount" value="400" />`;
  }
  if (type === 'mobile') {
    const total = Object.values(entries).reduce((a, e) => a + e.mobile, 0);
    const remaining = 1500 - total;
    return `
      <label>Amount (Max ₹${remaining}):</label>
      <input type="number" id="modalAmount" min="1" max="${remaining}" value="${remaining}" />
    `;
  }
  if (type === 'hotel') {
    return `
      <label>Amount (e.g. 1770):</label>
      <input type="number" id="modalAmount" placeholder="1500 + tax" value="1770" />
    `;
  }
  return `
    <label>Amount:</label>
    <input type="number" id="modalAmount" placeholder="e.g. 120" />
  `;
}

function closeModal() {
  document.getElementById("inputModal").style.display = "none";
  modalType = "";
  modalDate = "";
}

function submitModal() {
  const dateInput = document.getElementById("modalDateInput").value;
  const monthYear = document.getElementById("monthYear").value;
  if (!dateInput || !monthYear) return alert("Enter valid date!");

  const [year, month] = monthYear.split("-");
  const date = parseInt(dateInput);
  if (date < 1 || date > new Date(year, month, 0).getDate()) return alert("Invalid date!");

  const dateStr = `${date.toString().padStart(2,'0')}-${month}-${year.slice(2)}`;
  const dayName = new Date(year, month-1, date).toLocaleString('en-us', {weekday: 'short'});

  if (dayName === "Sun" && modalType !== "holiday") return alert("Sunday = Week Off!");

  if (!entries[dateStr]) {
    entries[dateStr] = {
      date: dateStr,
      day: dayName,
      store: modalType === "holiday" ? "Week Off" : getRandomStore(),
      daily: modalType === "holiday" ? 0 : 300,
      travel: 0, local: 0, fare: 0,
      meals: 0, hotel: 0, mobile: 0, courier: 0, others: 0
    };
  }

  const entry = entries[dateStr];

  if (modalType === "mobile") {
    const amt = parseInt(document.getElementById("modalAmount").value) || 0;
    const totalMobile = Object.values(entries).reduce((a, e) => a + e.mobile, 0);
    const remaining = 1500 - totalMobile + entry.mobile;
    if (amt > remaining) return alert(`Max allowed: ₹${remaining}`);
    entry.mobile = amt;
  } else if (modalType === "courier") {
    entry.courier = parseInt(document.getElementById("modalAmount").value) || 0;
  } else if (modalType === "meals") {
    entry.meals = 400;
  } else if (modalType === "hotel") {
    entry.hotel = parseInt(document.getElementById("modalAmount").value) || 0;
  } else if (modalType === "holiday") {
    entry.day = "Week Off";
    entry.store = document.getElementById("modalRemark").value || "Holiday";
    entry.daily = 0;
  }

  closeModal();
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  const sortedDates = Object.keys(entries).sort();
  sortedDates.forEach(dateStr => {
    const e = entries[dateStr];
    const tr = document.createElement("tr");
    if (e.day === "Week Off") tr.classList.add("weekoff");

    tr.innerHTML = `
      <td>${e.date}</td>
      <td>${e.day}</td>
      <td>${e.store}</td>
      <td></td>
      <td>${e.daily}</td>
      <td>${e.travel}</td>
      <td>${e.local}</td>
      <td>${e.fare}</td>
      <td>${e.meals}</td>
      <td>${e.hotel}</td>
      <td>${e.mobile}</td>
      <td>${e.courier}</td>
      <td>${e.others}</td>
    `;
    tbody.appendChild(tr);
  });

  const totals = Object.values(entries).reduce((a, e) => ({
    daily: a.daily + e.daily,
    travel: a.travel + e.travel,
    local: a.local + e.local,
    fare: a.fare + e.fare,
    meals: a.meals + e.meals,
    hotel: a.hotel + e.hotel,
    mobile: a.mobile + e.mobile,
    courier: a.courier + e.courier,
    others: a.others + e.others
  }), {daily:0, travel:0, local:0, fare:0, meals:0, hotel:0, mobile:0, courier:0, others:0});

  document.getElementById("tDaily").textContent = totals.daily;
  document.getElementById("tTravel").textContent = totals.travel;
  document.getElementById("tLocal").textContent = totals.local;
  document.getElementById("tFare").textContent = totals.fare;
  document.getElementById("tMeals").textContent = totals.meals;
  document.getElementById("tHotel").textContent = totals.hotel;
  document.getElementById("tMobile").textContent = totals.mobile;
  document.getElementById("tCourier").textContent = totals.courier;
  document.getElementById("tOthers").textContent = totals.others;

  const totalClaim = totals.daily + totals.mobile + totals.courier + totals.meals + totals.hotel;
  document.getElementById("totalClaim").textContent = totalClaim;
}

function generateER() {
  const monthYear = document.getElementById("monthYear").value;
  if (!monthYear) return alert("Select Month!");

  const [year, month] = monthYear.split("-");
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = new Date(year, month-1).toLocaleString('en-us', {month: 'short'});

  entries = {};
  let workingDays = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month-1, d);
    const dayName = dateObj.toLocaleString('en-us', {weekday: 'short'});
    const dateStr = `${d.toString().padStart(2,'0')}-${month}-${year.slice(2)}`;

    if (dayName === "Sun") {
      entries[dateStr] = {date: dateStr, day: "Week Off", store: "Week Off", daily:0, travel:0, local:0, fare:0, meals:0, hotel:0, mobile:0, courier:0, others:0};
    } else {
      workingDays++;
      entries[dateStr] = {date: dateStr, day: dayName, store: getRandomStore(), daily:300, travel:0, local:0, fare:0, meals:0, hotel:0, mobile:0, courier:0, others:0};
    }
  }

  document.getElementById("claimPeriod").value = `01-${monthName}-${year.slice(2)} to ${daysInMonth}-${monthName}-${year.slice(2)}`;
  document.getElementById("workingDays").value = workingDays;
  renderTable();
}

function downloadPDF() {
  const controls = document.querySelector('.controls');
  const btn = document.querySelector('.print-btn');
  const modal = document.getElementById('inputModal');
  controls.style.display = 'none';
  btn.style.display = 'none';
  modal.style.display = 'none';

  const element = document.querySelector('.container');

  const opt = {
    margin: [0.05, 0.05, 0.05, 0.05],
    filename: `ER_${document.getElementById('empName').value.replace(/ /g, '_')}_${document.getElementById('monthYear').value}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2.2,
      useCORS: true,
      letterRendering: true,
      width: 1080,
      height: 780
    },
    jsPDF: { 
      unit: 'in', 
      format: [10.8, 7.8],
      orientation: 'landscape'
    }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    controls.style.display = 'flex';
    btn.style.display = 'block';
  });
}

window.onload = () => {
  document.getElementById("monthYear").value = "2025-11";
};
