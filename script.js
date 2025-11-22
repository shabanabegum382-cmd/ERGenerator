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

// Tere diye hue 12 dates → Holiday (DD-MM format)
const FIXED_HOLIDAYS_2025 = [
  "01-01","14-03","31-03","18-04","15-08","27-08",
  "05-09","02-10","20-10","21-10","01-11","25-12"
];

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
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = new Date(year, month - 1).toLocaleString('en-us', { month: 'short' });

  entries = {};
  let workingDays = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${d.toString().padStart(2, '0')}-${month}-${year.slice(2)}`;
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
      <td ondblclick="editCell('${dateStr}', 'daily')">${e.daily > 0 ? e.daily : ''}</td>
      <td ondblclick="editCell('${dateStr}', 'travel')">${e.travel > 0 ? e.travel : ''}</td>
      <td ondblclick="editCell('${dateStr}', 'local')">${e.local > 0 ? e.local : ''}</td>
      <td ondblclick="editCell('${dateStr}', 'fare')">${e.fare > 0 ? e.fare : ''}</td>
      <td ondblclick="editCell('${dateStr}', 'meals')">${e.meals > 0 ? e.meals : ''}</td>
      <td ondblclick="editCell('${dateStr}', 'hotel')">${e.hotel > 0 ? e.hotel : ''}</td>
      <td ondblclick="editCell('${dateStr}', 'mobile')">${e.mobile > 0 ? e.mobile : ''}</td>
      <td ondblclick="editCell('${dateStr}', 'courier')">${e.courier > 0 ? e.courier : ''}</td>
      <td ondblclick="editCell('${dateStr}', 'others')">${e.others > 0 ? e.others : ''}</td>
    `;
    tbody.appendChild(tr);
  });

  const t = Object.values(entries).reduce((a, e) => ({
    daily: a.daily + e.daily,
    meals: a.meals + e.meals,
    hotel: a.hotel + e.hotel,
    mobile: a.mobile + e.mobile,
    courier: a.courier + e.courier
  }), { daily: 0, meals: 0, hotel: 0, mobile: 0, courier: 0 });

  document.getElementById("tDaily").textContent = t.daily > 0 ? t.daily : '';
  document.getElementById("tMeals").textContent = t.meals > 0 ? t.meals : '';
  document.getElementById("tHotel").textContent = t.hotel > 0 ? t.hotel : '';
  document.getElementById("tMobile").textContent = t.mobile > 0 ? t.mobile : '';
  document.getElementById("tCourier").textContent = t.courier > 0 ? t.courier : '';
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

// Mobile, Meals, Hotel, Courier – same as before (working fine)
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
  if (!dateStr || amount <= 0) return alert("Enter valid amount!");

  const used = Object.values(entries).reduce((a, e) => a + (e.mobile || 0), 0);
  const current = entries[dateStr]?.mobile || 0;
  if (used - current + amount > 1500) return alert(`Max ₹1500! Remaining: ₹${1500 - (used - current)}`);

  if (!entries[dateStr]) entries[dateStr] = createDefaultEntry(dateStr);
  entries[dateStr].mobile = amount;
  closeMobileModal();
  renderTable();
}

function openExpenseModal(type) {
  const monthYear = document.getElementById("monthYear").value;
  if (!monthYear) return alert("Select Month & Year!");

  const [year, month] = monthYear.split("-");
  const days = new Date(year, month, 0).getDate();

  document.getElementById("modalTitle").textContent = 
    type === 'meals' ? 'Add Meals ₹400' : type === 'hotel' ? 'Add Hotel Stay' : 'Add Courier';

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
      `<label>Amount:</label><input type="number" id="modalAmount" ${type==='hotel' ? 'value="1770"' : ''} placeholder="Enter amount" />`}
  `;

  document.getElementById("inputModal").style.display = "flex";
}

function closeModal() { document.getElementById("inputModal").style.display = "none"; }

function submitModal() {
  const dateStr = document.getElementById("modalDateSelect").value;
  if (!dateStr) return alert("Select a date!");

  const amount = document.getElementById("modalAmount") ? parseInt(document.getElementById("modalAmount").value) || 0 : 400;

  if (!entries[dateStr]) entries[dateStr] = createDefaultEntry(dateStr);

  const title = document.getElementById("modalTitle").textContent;
  if (title.includes("Meals")) entries[dateStr].meals = 400;
  else if (title.includes("Hotel")) entries[dateStr].hotel = amount;
  else entries[dateStr].courier = amount;

  closeModal();
  renderTable();
}

function downloadPDF() {
  // Pehle sab buttons aur controls hide kar do
  document.querySelector('.controls').style.display = 'none';
  document.querySelector('.print-btn').style.display = 'none';

  // Thoda wait karo taaki hide ho jaye properly
  setTimeout(() => {
    const opt = {
      margin: [0.05, 0.05, 0.05, 0.05],
      filename: `ER_${document.getElementById('empName').value.replace(/ /g, '_')}_${document.getElementById('monthYear').value}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2.2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        windowWidth: document.documentElement.offsetWidth
      },
      jsPDF: { 
        unit: 'in', 
        format: [10.8, 7.8], 
        orientation: 'landscape' 
      }
    };

    html2pdf().set(opt).from(document.querySelector('.container')).save().then(() => {
      // PDF ban gaya → ab wapas dikhao buttons
      document.querySelector('.controls').style.display = 'flex';
      document.querySelector('.print-btn').style.display = 'block';
    });
  }, 100);
}
