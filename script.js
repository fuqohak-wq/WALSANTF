```javascript
// ==========================================
// GANTI DENGAN URL WEB APP APPS SCRIPT ANDA
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycbz4WIiha9JSemWqoC4603207orwCm3eYd3XlMwXzNZBTLHvWsITLlyecHnjB4hvr-i03w/exec";

// ==========================================
// ELEMENT HTML
// ==========================================
const loadingBox   = document.getElementById("loading");
const formTransfer = document.getElementById("formTransfer");

const santriSelect = document.getElementById("santriSelect");
const santriInfo   = document.getElementById("santriInfo");

const infoNik  = document.getElementById("infoNik");
const infoKode = document.getElementById("infoKode");

const inputNominal = document.getElementById("inputNominal");
const inputHp      = document.getElementById("inputHp");

const previewBox = document.getElementById("previewBox");

const viewPokok = document.getElementById("viewPokok");
const viewKode  = document.getElementById("viewKode");
const viewTotal = document.getElementById("viewTotal");

const btnSubmit = document.getElementById("btnSubmit");

const invoiceBox   = document.getElementById("invoiceBox");
const invoiceTotal = document.getElementById("invoiceTotal");

const btnWA    = document.getElementById("btnWA");
const btnReset = document.getElementById("btnReset");

// ==========================================
// DATA GLOBAL
// ==========================================
let dataSantri = [];
let santriAktif = null;
let totalTransfer = 0;

// ==========================================
// FORMAT RUPIAH
// ==========================================
function rupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(angka);
}

// ==========================================
// LOAD DATA SANTRI DARI APPS SCRIPT
// ==========================================
async function loadSantri() {

    try {

        const response = await fetch(API_URL);
        const result = await response.json();

        if (!result.success) {
            throw new Error("Gagal mengambil data");
        }

        dataSantri = result.data;

        dataSantri.forEach((item, index) => {

            const option = document.createElement("option");

            option.value = index;
            option.textContent = item.nama;

            santriSelect.appendChild(option);
        });

        loadingBox.classList.add("hidden");
        formTransfer.classList.remove("hidden");

    } catch (err) {

        loadingBox.innerHTML =
            "❌ Gagal memuat data santri";

        console.error(err);
    }
}

// ==========================================
// SAAT PILIH SANTRI
// ==========================================
santriSelect.addEventListener("change", () => {

    const index = santriSelect.value;

    if (index === "") {
        return;
    }

    santriAktif = dataSantri[index];

    infoNik.textContent  = santriAktif.nik;
    infoKode.textContent = santriAktif.kode;

    santriInfo.classList.remove("hidden");

    inputNominal.disabled = false;
    inputHp.disabled      = false;

    hitungTotal();
});

// ==========================================
// HITUNG TOTAL TRANSFER
// ==========================================
function hitungTotal() {

    if (!santriAktif) return;

    const nominal = parseInt(inputNominal.value || 0);

    if (nominal < 10000) {

        previewBox.classList.add("hidden");
        btnSubmit.disabled = true;

        return;
    }

    const kodeUnik = parseInt(santriAktif.kode);

    totalTransfer = nominal + kodeUnik;

    viewPokok.textContent = rupiah(nominal);
    viewKode.textContent  = "+" + santriAktif.kode;
    viewTotal.textContent = rupiah(totalTransfer);

    previewBox.classList.remove("hidden");

    cekForm();
}

// ==========================================
// VALIDASI FORM
// ==========================================
function cekForm() {

    const nominal = parseInt(inputNominal.value || 0);
    const hp = inputHp.value.trim();

    if (
        nominal >= 10000 &&
        hp.length >= 10 &&
        santriAktif
    ) {
        btnSubmit.disabled = false;
    } else {
        btnSubmit.disabled = true;
    }
}

inputNominal.addEventListener("input", () => {
    hitungTotal();
});

inputHp.addEventListener("input", () => {
    cekForm();
});

// ==========================================
// SUBMIT FORM
// ==========================================
formTransfer.addEventListener("submit", async (e) => {

    e.preventDefault();

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = "⏳ Memproses...";

    try {

        const payload = {

            nik: santriAktif.nik,
            nama: santriAktif.nama,
            kode: santriAktif.kode,

            nominalPokok: parseInt(inputNominal.value),
            nominalTotal: totalTransfer,

            hp: inputHp.value
        };

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error("Gagal menyimpan data");
        }

        formTransfer.classList.add("hidden");

        invoiceTotal.textContent = rupiah(totalTransfer);

        invoiceBox.classList.remove("hidden");

        // ==================================
        // TOMBOL WHATSAPP
        // ==================================

        const pesan = encodeURIComponent(
`Assalamu'alaikum Admin Yayasan Yahyawiyyah

Saya telah membuat permintaan transfer uang saku.

Nama Santri : ${santriAktif.nama}
NIK          : ${santriAktif.nik}
Nominal      : ${rupiah(totalTransfer)}

Mohon dicek. Terima kasih.`
        );

        btnWA.onclick = () => {

            window.open(
                `https://wa.me/6281234567890?text=${pesan}`,
                "_blank"
            );
        };

    } catch (err) {

        alert("❌ Gagal mengirim data");

        console.error(err);

    } finally {

        btnSubmit.disabled = false;
        btnSubmit.innerHTML =
            "Dapatkan Instruksi Transfer";
    }
});

// ==========================================
// RESET FORM
// ==========================================
btnReset.addEventListener("click", () => {

    location.reload();
});

// ==========================================
// JALANKAN
// ==========================================
loadSantri();
```
