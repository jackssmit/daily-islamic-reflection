/* =========================================================
   EDIT ME — everything gym-specific lives in this one object.
   Change these and the whole site (countdown, dropdowns,
   checkboxes, WhatsApp message) updates itself.
   ========================================================= */
const CONFIG = {
  tournamentName: "Gym Nation Open Championship",
  tournamentDate: "2026-11-15T09:00:00+05:30", // ISO date, gym's local time
  tournamentDateLabel: "15 Nov 2026, 9:00 AM",
  entryFee: "Free for members · ₹200 walk-in",

  // Leave entryFeeAmount at 0 until the fee is decided — the payment
  // block stays hidden and shows "pay at the gym counter" instead.
  // Once you set an amount and a UPI ID, a QR + pay button appear
  // automatically in step 3 of the form. No payment gateway needed.
  entryFeeAmount: 0,       // e.g. 200
  upiId: "",               // e.g. "gymnation@okaxis"
  payeeName: "Gym Nation Mysuru",

  // Leave empty until winners are decided — the prizes line stays hidden.
  // Fill in later, e.g. ["1st: ₹5,000", "2nd: ₹3,000", "3rd: ₹1,500"]
  prizes: [],

  categories: [
    "Men's Powerlifting",
    "Women's Powerlifting",
    "Bodybuilding",
    "Calisthenics",
    "Strongman",
    "Open Fitness Challenge"
  ],

  exercises: [
    "Bench Press",
    "Squat",
    "Deadlift",
    "Pull-Ups",
    "Push-Ups (max reps)",
    "Plank Hold",
    "Clean & Jerk",
    "100m Sprint"
  ],

  // Leave WHATSAPP_NUMBER empty ("") to open WhatsApp's contact picker,
  // so whoever applies chooses the Gym Nation group themselves and hits send.
  // WhatsApp does not allow a group message to be sent silently by a
  // website — this is the closest thing to "one tap" that WhatsApp permits.
  // If you'd rather every application go straight to one phone (e.g. the
  // gym owner), put that number here in international format, no + or spaces:
  whatsappNumber: "" // e.g. "919876543210"
};

/* ========================= Nav ========================= */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

document.getElementById('year').textContent = new Date().getFullYear();

/* ================== Populate tournament ================== */
document.getElementById('tournamentName').textContent = CONFIG.tournamentName;
document.getElementById('tournamentDate').textContent = CONFIG.tournamentDateLabel;
document.getElementById('tournamentEntry').textContent = CONFIG.entryFee;

const chipsEl = document.getElementById('categoryChips');
CONFIG.categories.forEach(c => {
  const span = document.createElement('span');
  span.className = 'plate-chip';
  span.textContent = c;
  chipsEl.appendChild(span);
});

if (CONFIG.prizes.length){
  document.getElementById('prizesRow').hidden = false;
  const prizeChips = document.getElementById('prizeChips');
  CONFIG.prizes.forEach(p => {
    const span = document.createElement('span');
    span.className = 'plate-chip';
    span.textContent = p;
    prizeChips.appendChild(span);
  });
}

const categorySelect = document.getElementById('fCategory');
CONFIG.categories.forEach(c => {
  const opt = document.createElement('option');
  opt.value = c; opt.textContent = c;
  categorySelect.appendChild(opt);
});

const exerciseGrid = document.getElementById('exerciseGrid');
CONFIG.exercises.forEach((ex, i) => {
  const id = 'ex' + i;
  const label = document.createElement('label');
  label.innerHTML = `<input type="checkbox" name="exercises" value="${ex}" id="${id}"> ${ex}`;
  exerciseGrid.appendChild(label);
});

/* ===================== Payment (UPI) ===================== */
const paymentReady = CONFIG.entryFeeAmount > 0 && CONFIG.upiId;
if (paymentReady){
  const upiUri = `upi://pay?pa=${encodeURIComponent(CONFIG.upiId)}&pn=${encodeURIComponent(CONFIG.payeeName)}&am=${CONFIG.entryFeeAmount}&cu=INR&tn=${encodeURIComponent('Tournament Entry Fee')}`;
  document.getElementById('paymentBlock').hidden = false;
  document.getElementById('paymentAmount').textContent = `₹${CONFIG.entryFeeAmount}`;
  document.getElementById('paymentUpi').textContent = CONFIG.upiId;
  document.getElementById('payButton').href = upiUri;
  document.getElementById('paymentQr').src =
    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUri)}`;
} else {
  document.getElementById('paymentNotePlain').hidden = false;
}

/* ===================== Countdown timer ===================== */
const target = new Date(CONFIG.tournamentDate).getTime();
function tickCountdown(){
  const now = Date.now();
  let diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  document.getElementById('cdDays').textContent = String(d).padStart(2,'0');
  document.getElementById('cdHours').textContent = String(h).padStart(2,'0');
  document.getElementById('cdMins').textContent = String(m).padStart(2,'0');
  document.getElementById('cdSecs').textContent = String(s).padStart(2,'0');
}
tickCountdown();
setInterval(tickCountdown, 1000);

/* =================== Scroll reveal =================== */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

/* =================== Multi-step form =================== */
const form = document.getElementById('applyForm');
const steps = [...form.querySelectorAll('.step')];
const fpSteps = [...document.querySelectorAll('.fp-step')];
let currentStep = 1;

function goToStep(n){
  steps.forEach(s => s.classList.toggle('active', Number(s.dataset.step) === n));
  fpSteps.forEach(s => {
    const stepNum = Number(s.dataset.step);
    s.classList.toggle('active', stepNum === n);
    s.classList.toggle('done', stepNum < n);
  });
  currentStep = n;
  document.getElementById('applyForm').scrollIntoView({ behavior:'smooth', block:'start' });
}

function validateStep(n){
  const fieldset = steps.find(s => Number(s.dataset.step) === n);
  const inputs = fieldset.querySelectorAll('input[required], select[required]');
  for (const el of inputs){
    if (!el.value){
      el.focus();
      el.style.outline = '2px solid #e0554d';
      return false;
    }
    el.style.outline = '';
  }
  if (n === 2){
    const anyExercise = form.querySelectorAll('input[name="exercises"]:checked').length > 0;
    if (!anyExercise){
      exerciseGrid.scrollIntoView({ behavior:'smooth', block:'center' });
      return false;
    }
  }
  return true;
}

form.querySelectorAll('[data-next]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (validateStep(currentStep)){
      if (currentStep === 2) fillReview();
      goToStep(currentStep + 1);
    }
  });
});
form.querySelectorAll('[data-prev]').forEach(btn => {
  btn.addEventListener('click', () => goToStep(currentStep - 1));
});

function fillReview(){
  const name = form.name.value.trim();
  const age = form.age.value;
  const gender = form.gender.value;
  const phone = form.phone.value.trim();
  const member = form.member.value;
  const category = form.category.value;
  const level = form.level.value;
  const notes = form.notes.value.trim();
  const exercises = [...form.querySelectorAll('input[name="exercises"]:checked')].map(c => c.value);

  document.getElementById('rvName').textContent = name;
  document.getElementById('rvAgeGender').textContent = `${age} / ${gender}`;
  document.getElementById('rvPhone').textContent = phone;
  document.getElementById('rvMember').textContent = member;
  document.getElementById('rvCategory').textContent = category;
  document.getElementById('rvLevel').textContent = level;
  document.getElementById('rvExercises').textContent = exercises.join(', ');
  document.getElementById('rvNotes').textContent = notes || '—';
}

/* =================== Submit → WhatsApp =================== */
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateStep(3) && false) return; // step 3 has no required fields, kept for symmetry

  const data = {
    name: form.name.value.trim(),
    age: form.age.value,
    gender: form.gender.value,
    phone: form.phone.value.trim(),
    member: form.member.value,
    category: form.category.value,
    level: form.level.value,
    notes: form.notes.value.trim(),
    exercises: [...form.querySelectorAll('input[name="exercises"]:checked')].map(c => c.value)
  };

  const message =
`*New Tournament Application — ${CONFIG.tournamentName}*
Name: ${data.name}
Age / Gender: ${data.age} / ${data.gender}
WhatsApp: ${data.phone}
Membership: ${data.member}
Category: ${data.category}
Level: ${data.level}
Exercises: ${data.exercises.join(', ')}
Notes: ${data.notes || '—'}`;

  const encoded = encodeURIComponent(message);
  const waUrl = CONFIG.whatsappNumber
    ? `https://wa.me/${CONFIG.whatsappNumber}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;

  document.getElementById('resendWa').href = waUrl;
  window.open(waUrl, '_blank');

  // confirmation screen
  document.getElementById('confirmName').textContent = data.name || 'athlete';
  document.getElementById('confirmCategory').textContent = data.category;
  const list = document.getElementById('confirmExercises');
  list.innerHTML = '';
  data.exercises.forEach((ex, i) => {
    const li = document.createElement('li');
    li.textContent = ex;
    li.style.animationDelay = `${0.15 + i * 0.08}s`;
    list.appendChild(li);
  });

  form.style.display = 'none';
  document.getElementById('formProgress').style.display = 'none';
  const confirm = document.getElementById('confirmScreen');
  confirm.classList.add('active');
});

document.getElementById('editAgain').addEventListener('click', () => {
  document.getElementById('confirmScreen').classList.remove('active');
  form.style.display = '';
  document.getElementById('formProgress').style.display = '';
  goToStep(1);
});
