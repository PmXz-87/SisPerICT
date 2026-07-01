/* ===========================
   DATA STORE
=========================== */
const store = {
  peralatan: JSON.parse(localStorage.getItem('ict_peralatan') || '[]'),
  dokumen:   JSON.parse(localStorage.getItem('ict_dokumen')   || '[]'),
  aduan:     JSON.parse(localStorage.getItem('ict_aduan')     || '[]'),

  save() {
    localStorage.setItem('ict_peralatan', JSON.stringify(this.peralatan));
    localStorage.setItem('ict_dokumen',   JSON.stringify(this.dokumen));
    localStorage.setItem('ict_aduan',     JSON.stringify(this.aduan));
  }
};

/* ===========================
   UTILITY
=========================== */
function genId(prefix) {
  const d = new Date();
  const yr = d.getFullYear();
  return `${prefix}-${yr}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
}

function today() {
  return new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  t.innerHTML = `${icon} ${msg}`;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3500);
}

function validate(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(el => {
    const err = el.nextElementSibling;
    if (!el.value.trim()) {
      el.classList.add('error');
      if (err && err.classList.contains('error-msg')) err.classList.add('visible');
      valid = false;
    } else {
      el.classList.remove('error');
      if (err && err.classList.contains('error-msg')) err.classList.remove('visible');
    }
  });
  // email validation
  const email = form.querySelector('[type="email"]');
  if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    email.classList.add('error');
    const err = email.nextElementSibling;
    if (err) err.classList.add('visible');
    valid = false;
  }
  return valid;
}

function clearErrors(form) {
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.error-msg.visible').forEach(el => el.classList.remove('visible'));
}

function updateStats() {
  document.getElementById('totalPeralatan').textContent = store.peralatan.length;
  document.getElementById('totalDokumen').textContent   = store.dokumen.length;
  document.getElementById('totalAduan').textContent     = store.aduan.length;
  document.getElementById('countPeralatan').textContent = store.peralatan.length;
  document.getElementById('countDokumen').textContent   = store.dokumen.length;
  document.getElementById('countAduan').textContent     = store.aduan.length;
}

/* ===========================
   STATUS BADGE HELPER
=========================== */
function statusBadge(status) {
  const map = {
    'Aktif':           ['badge-aktif',      '🟢'],
    'Rosak':           ['badge-rosak',      '🔴'],
    'Penyelenggaraan': ['badge-selenggara', '🔧'],
    'Lupus':           ['badge-lupus',      '⚫'],
    'Baru':            ['badge-baru',       '🆕'],
    'Dalam Proses':    ['badge-proses',     '⚙️'],
    'Menunggu':        ['badge-menunggu',   '⏳'],
    'Selesai':         ['badge-selesai',    '✅'],
    'Ditutup':         ['badge-tutup',      '🔒'],
  };
  const [cls, emoji] = map[status] || ['badge-baru', '•'];
  return `<span class="badge ${cls}">${emoji} ${status}</span>`;
}

function keutamaanBadge(k) {
  const map = {
    'Kritikal':  'badge-kritikal',
    'Tinggi':    'badge-tinggi',
    'Sederhana': 'badge-sederhana',
    'Rendah':    'badge-rendah',
  };
  return `<span class="badge ${map[k] || 'badge-sederhana'}">${k}</span>`;
}

/* ===========================
   RENDER TABLES
=========================== */
function renderPeralatan(data) {
  const tbody = document.getElementById('bodyPeralatan');
  if (!data.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="8"><i class="fas fa-inbox"></i> Tiada rekod peralatan</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${r.noSiri}</strong></td>
      <td>${r.namaPeralatan}</td>
      <td>${r.jenisPeralatan}</td>
      <td>${r.jabatan}</td>
      <td>${statusBadge(r.statusPeralatan)}</td>
      <td>${r.tarikhDaftar}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn action-btn-view" onclick="viewPeralatan('${r.id}')">
            <i class="fas fa-eye"></i> Lihat
          </button>
          <button class="action-btn action-btn-del" onclick="deleteRecord('peralatan','${r.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderDokumen(data) {
  const tbody = document.getElementById('bodyDokumen');
  if (!data.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="7"><i class="fas fa-inbox"></i> Tiada rekod dokumen</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${r.tajukDokumen}</td>
      <td>${r.jenisDokumen}</td>
      <td>${r.asetBerkaitan || '—'}</td>
      <td>${r.tarikhDokumen || '—'}</td>
      <td>${r.failNama ? `<i class="fas fa-file-alt" style="color:var(--primary)"></i> ${r.failNama}` : '—'}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn action-btn-view" onclick="viewDokumen('${r.id}')">
            <i class="fas fa-eye"></i> Lihat
          </button>
          <button class="action-btn action-btn-del" onclick="deleteRecord('dokumen','${r.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderAduan(data) {
  const tbody = document.getElementById('bodyAduan');
  if (!data.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="8"><i class="fas fa-inbox"></i> Tiada rekod aduan</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${r.noAduan || '—'}</strong></td>
      <td>${r.namaPengadu}</td>
      <td>${r.kategoriAduan}</td>
      <td>${keutamaanBadge(r.tahapKeutamaan)}</td>
      <td>${statusBadge(r.statusAduan)}</td>
      <td>${r.tarikhRespon || '—'}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn action-btn-view" onclick="viewAduan('${r.id}')">
            <i class="fas fa-eye"></i> Lihat
          </button>
          <button class="action-btn action-btn-del" onclick="deleteRecord('aduan','${r.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function refreshAll() {
  renderPeralatan(store.peralatan);
  renderDokumen(store.dokumen);
  renderAduan(store.aduan);
  updateStats();
}

/* ===========================
   FORM: PERALATAN
=========================== */
document.getElementById('formPeralatan').addEventListener('submit', function(e) {
  e.preventDefault();
  if (!validate(this)) return;

  const record = {
    id:               genId('P'),
    noSiri:           document.getElementById('noSiri').value.trim(),
    namaPeralatan:    document.getElementById('namaPeralatan').value.trim(),
    jenisPeralatan:   document.getElementById('jenisPeralatan').value,
    jenama:           document.getElementById('jenama').value.trim(),
    jabatan:          document.getElementById('jabatan').value.trim(),
    lokasi:           document.getElementById('lokasi').value.trim(),
    penggunaSemasa:   document.getElementById('penggunaSemasa').value.trim(),
    statusPeralatan:  document.getElementById('statusPeralatan').value,
    tarikhPerolehan:  document.getElementById('tarikhPerolehan').value,
    nilaiPerolehan:   document.getElementById('nilaiPerolehan').value,
    catatanPeralatan: document.getElementById('catatanPeralatan').value.trim(),
    tarikhDaftar:     today(),
  };

  store.peralatan.push(record);
  store.save();
  refreshAll();
  this.reset();
  clearErrors(this);
  showToast('Peralatan berjaya didaftarkan! 🎉');
  document.getElementById('tabPeralatan').scrollIntoView({ behavior: 'smooth', block: 'start' });
  switchTab('tabPeralatan');
});

document.getElementById('formPeralatan').addEventListener('reset', function() {
  clearErrors(this);
});

/* ===========================
   FORM: DOKUMEN
=========================== */
let selectedFiles = [];

const uploadZone   = document.getElementById('uploadZone');
const fileInput    = document.getElementById('fileDokumen');
const fileListEl   = document.getElementById('fileList');

uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', e => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));

uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  handleFiles([...e.dataTransfer.files]);
});

fileInput.addEventListener('change', () => handleFiles([...fileInput.files]));

function handleFiles(files) {
  files.forEach(f => {
    if (f.size > 10 * 1024 * 1024) {
      showToast(`Fail "${f.name}" melebihi 10MB.`, 'error');
      return;
    }
    if (!selectedFiles.find(x => x.name === f.name)) {
      selectedFiles.push(f);
    }
  });
  renderFileList();
}

function renderFileList() {
  fileListEl.innerHTML = selectedFiles.map((f, i) => {
    const size = f.size < 1024 * 1024
      ? (f.size / 1024).toFixed(1) + ' KB'
      : (f.size / 1024 / 1024).toFixed(1) + ' MB';
    return `
      <div class="file-item">
        <i class="fas fa-file-alt"></i>
        <span>${f.name} <small>(${size})</small></span>
        <button class="remove-file" onclick="removeFile(${i})" type="button">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  }).join('');
}

function removeFile(idx) {
  selectedFiles.splice(idx, 1);
  renderFileList();
}

document.getElementById('formDokumen').addEventListener('submit', function(e) {
  e.preventDefault();
  if (!validate(this)) return;

  const record = {
    id:            genId('D'),
    tajukDokumen:  document.getElementById('tajukDokumen').value.trim(),
    jenisDokumen:  document.getElementById('jenisDokumen').value,
    asetBerkaitan: document.getElementById('asetBerkaitan').value.trim(),
    tarikhDokumen: document.getElementById('tarikhDokumen').value,
    tarikhTamat:   document.getElementById('tarikhTamat').value,
    catatanDokumen: document.getElementById('catatanDokumen').value.trim(),
    failNama:      selectedFiles.length ? selectedFiles.map(f => f.name).join(', ') : '',
    failBilangan:  selectedFiles.length,
    tarikhMuat:    today(),
  };

  store.dokumen.push(record);
  store.save();
  refreshAll();
  this.reset();
  selectedFiles = [];
  renderFileList();
  clearErrors(this);
  showToast('Dokumen berjaya dimuat naik! 📄');
  switchTab('tabDokumen');
});

document.getElementById('resetDokumen').addEventListener('click', function() {
  selectedFiles = [];
  renderFileList();
  clearErrors(document.getElementById('formDokumen'));
});

/* ===========================
   FORM: RESPON / ADUAN
=========================== */
// Set today's date for respon
document.getElementById('tarikhRespon').valueAsDate = new Date();

document.getElementById('formRespon').addEventListener('submit', function(e) {
  e.preventDefault();
  if (!validate(this)) return;

  const record = {
    id:               genId('A'),
    namaPengadu:      document.getElementById('namaPengadu').value.trim(),
    emailPengadu:     document.getElementById('emailPengadu').value.trim(),
    noTelPengadu:     document.getElementById('noTelPengadu').value.trim(),
    jabatanPengadu:   document.getElementById('jabatanPengadu').value.trim(),
    noAduan:          document.getElementById('noAduan').value.trim() || genId('ADU'),
    peralatanTerlibat: document.getElementById('peralatanTerlibat').value.trim(),
    kategoriAduan:    document.getElementById('kategoriAduan').value,
    tahapKeutamaan:   document.getElementById('tahapKeutamaan').value,
    perihalAduan:     document.getElementById('perihalAduan').value.trim(),
    responPihakIT:    document.getElementById('responPihakIT').value.trim(),
    statusAduan:      document.getElementById('statusAduan').value,
    tarikhRespon:     document.getElementById('tarikhRespon').value,
    maklumBalas:      document.getElementById('maklumBalas').value.trim(),
    tarikhRekod:      today(),
  };

  store.aduan.push(record);
  store.save();
  refreshAll();
  this.reset();
  document.getElementById('tarikhRespon').valueAsDate = new Date();
  clearErrors(this);
  showToast('Respon pengadu berjaya dihantar! 💬');
  switchTab('tabAduan');
});

document.getElementById('formRespon').addEventListener('reset', function() {
  clearErrors(this);
});

/* ===========================
   TAB SWITCHING
=========================== */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('active', c.id === tabId);
  });
}

/* ===========================
   SEARCH / FILTER
=========================== */
document.getElementById('cariPeralatan').addEventListener('input', function() {
  const q = this.value.toLowerCase();
  const filtered = store.peralatan.filter(r =>
    [r.noSiri, r.namaPeralatan, r.jenisPeralatan, r.jabatan, r.statusPeralatan]
      .some(v => v && v.toLowerCase().includes(q))
  );
  renderPeralatan(filtered);
});

document.getElementById('cariDokumen').addEventListener('input', function() {
  const q = this.value.toLowerCase();
  const filtered = store.dokumen.filter(r =>
    [r.tajukDokumen, r.jenisDokumen, r.asetBerkaitan]
      .some(v => v && v.toLowerCase().includes(q))
  );
  renderDokumen(filtered);
});

document.getElementById('cariAduan').addEventListener('input', function() {
  const q = this.value.toLowerCase();
  const filtered = store.aduan.filter(r =>
    [r.namaPengadu, r.noAduan, r.kategoriAduan, r.statusAduan]
      .some(v => v && v.toLowerCase().includes(q))
  );
  renderAduan(filtered);
});

/* ===========================
   VIEW MODALS
=========================== */
function viewPeralatan(id) {
  const r = store.peralatan.find(x => x.id === id);
  if (!r) return;
  document.getElementById('modalTitle').textContent = `📦 ${r.namaPeralatan}`;
  document.getElementById('modalBody').innerHTML = `
    <div class="detail-grid">
      <div class="detail-item"><label>No. Aset / Siri</label><p>${r.noSiri}</p></div>
      <div class="detail-item"><label>Jenis</label><p>${r.jenisPeralatan}</p></div>
      <div class="detail-item"><label>Jenama / Model</label><p>${r.jenama || '—'}</p></div>
      <div class="detail-item"><label>Status</label><p>${statusBadge(r.statusPeralatan)}</p></div>
      <div class="detail-item"><label>Jabatan</label><p>${r.jabatan}</p></div>
      <div class="detail-item"><label>Lokasi</label><p>${r.lokasi || '—'}</p></div>
      <div class="detail-item"><label>Pengguna Semasa</label><p>${r.penggunaSemasa || '—'}</p></div>
      <div class="detail-item"><label>Tarikh Perolehan</label><p>${r.tarikhPerolehan || '—'}</p></div>
      <div class="detail-item"><label>Nilai Perolehan</label><p>${r.nilaiPerolehan ? 'RM ' + parseFloat(r.nilaiPerolehan).toFixed(2) : '—'}</p></div>
      <div class="detail-item"><label>Tarikh Daftar</label><p>${r.tarikhDaftar}</p></div>
      <div class="detail-item detail-full"><label>Catatan</label><p>${r.catatanPeralatan || '—'}</p></div>
    </div>
  `;
  openModal();
}

function viewDokumen(id) {
  const r = store.dokumen.find(x => x.id === id);
  if (!r) return;
  document.getElementById('modalTitle').textContent = `📄 ${r.tajukDokumen}`;
  document.getElementById('modalBody').innerHTML = `
    <div class="detail-grid">
      <div class="detail-item"><label>Jenis Dokumen</label><p>${r.jenisDokumen}</p></div>
      <div class="detail-item"><label>No. Aset Berkaitan</label><p>${r.asetBerkaitan || '—'}</p></div>
      <div class="detail-item"><label>Tarikh Dokumen</label><p>${r.tarikhDokumen || '—'}</p></div>
      <div class="detail-item"><label>Tarikh Tamat</label><p>${r.tarikhTamat || '—'}</p></div>
      <div class="detail-item"><label>Fail Dilampirkan</label><p>${r.failNama || '—'}</p></div>
      <div class="detail-item"><label>Tarikh Muat Naik</label><p>${r.tarikhMuat}</p></div>
      <div class="detail-item detail-full"><label>Catatan</label><p>${r.catatanDokumen || '—'}</p></div>
    </div>
  `;
  openModal();
}

function viewAduan(id) {
  const r = store.aduan.find(x => x.id === id);
  if (!r) return;
  document.getElementById('modalTitle').textContent = `💬 Aduan ${r.noAduan}`;
  document.getElementById('modalBody').innerHTML = `
    <div class="detail-grid">
      <div class="detail-item"><label>Pengadu</label><p>${r.namaPengadu}</p></div>
      <div class="detail-item"><label>E-mel</label><p>${r.emailPengadu}</p></div>
      <div class="detail-item"><label>No. Telefon</label><p>${r.noTelPengadu || '—'}</p></div>
      <div class="detail-item"><label>Jabatan</label><p>${r.jabatanPengadu}</p></div>
      <div class="detail-item"><label>Peralatan Terlibat</label><p>${r.peralatanTerlibat || '—'}</p></div>
      <div class="detail-item"><label>Kategori</label><p>${r.kategoriAduan}</p></div>
      <div class="detail-item"><label>Keutamaan</label><p>${keutamaanBadge(r.tahapKeutamaan)}</p></div>
      <div class="detail-item"><label>Status</label><p>${statusBadge(r.statusAduan)}</p></div>
      <div class="detail-item"><label>Tarikh Respon</label><p>${r.tarikhRespon || '—'}</p></div>
      <div class="detail-item detail-full"><label>Perihal Aduan</label><p>${r.perihalAduan}</p></div>
      <div class="detail-item detail-full"><label>Respon Pihak IT</label><p>${r.responPihakIT}</p></div>
      <div class="detail-item detail-full"><label>Maklum Balas Pengadu</label><p>${r.maklumBalas || '—'}</p></div>
    </div>
  `;
  openModal();
}

function openModal()  { document.getElementById('modal').removeAttribute('hidden'); }
function closeModal() { document.getElementById('modal').setAttribute('hidden', ''); }

document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

/* ===========================
   DELETE RECORD
=========================== */
function deleteRecord(type, id) {
  if (!confirm('Adakah anda pasti untuk memadam rekod ini?')) return;
  store[type] = store[type].filter(r => r.id !== id);
  store.save();
  refreshAll();
  showToast('Rekod berjaya dipadam.', 'info');
}

/* ===========================
   EXPORT CSV
=========================== */
function exportCSV(type) {
  const data = store[type];
  if (!data.length) { showToast('Tiada data untuk dieksport.', 'error'); return; }

  let headers, rows;

  if (type === 'peralatan') {
    headers = ['No.', 'No. Aset', 'Nama Peralatan', 'Jenis', 'Jenama', 'Jabatan', 'Lokasi', 'Pengguna', 'Status', 'Tarikh Perolehan', 'Nilai (RM)', 'Tarikh Daftar'];
    rows = data.map((r, i) => [i+1, r.noSiri, r.namaPeralatan, r.jenisPeralatan, r.jenama, r.jabatan, r.lokasi, r.penggunaSemasa, r.statusPeralatan, r.tarikhPerolehan, r.nilaiPerolehan, r.tarikhDaftar]);
  } else if (type === 'dokumen') {
    headers = ['No.', 'Tajuk Dokumen', 'Jenis', 'No. Aset', 'Tarikh Dokumen', 'Tarikh Tamat', 'Fail', 'Tarikh Muat Naik'];
    rows = data.map((r, i) => [i+1, r.tajukDokumen, r.jenisDokumen, r.asetBerkaitan, r.tarikhDokumen, r.tarikhTamat, r.failNama, r.tarikhMuat]);
  } else {
    headers = ['No.', 'No. Aduan', 'Pengadu', 'E-mel', 'Jabatan', 'Kategori', 'Keutamaan', 'Status', 'Peralatan', 'Tarikh Respon'];
    rows = data.map((r, i) => [i+1, r.noAduan, r.namaPengadu, r.emailPengadu, r.jabatanPengadu, r.kategoriAduan, r.tahapKeutamaan, r.statusAduan, r.peralatanTerlibat, r.tarikhRespon]);
  }

  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `senarai_${type}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Data ${type} berjaya dieksport.`);
}

/* ===========================
   INIT
=========================== */
refreshAll();
