<style type="text/css">
  .katalog-container { 
    width: 100%; 
    max-width: 1200px; 
    margin: 0 auto 40px auto; 
    padding: 0 15px; 
    box-sizing: border-box; 
    font-family: 'Arial', sans-serif;
  }
  .katalog-header { text-align: center; margin-bottom: 35px; }
  .katalog-header h2 { 
    font-family: 'Oswald', sans-serif; font-size: 28px; color: #112A46; 
    margin: 0 0 8px 0 !important; letter-spacing: 1px; text-transform: uppercase;
  }
  .katalog-header p { color: #555; font-size: 15px; margin: 0; line-height: 1.5; }
  
  /* Grid 4 Kolom Rapi */
  .katalog-grid { 
    display: grid; 
    grid-template-columns: repeat(4, 1fr); 
    gap: 20px; 
  }
  
  /* Kartu Produk Kompak */
  .katalog-card {
    background: rgba(255, 255, 255, 0.85); 
    backdrop-filter: blur(12px); 
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.6); 
    border-radius: 12px; 
    overflow: hidden;
    box-shadow: 0 6px 20px rgba(0,0,0,0.05); 
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex; 
    flex-direction: column;
  }
  .katalog-card:hover {
    transform: translateY(-5px); 
    box-shadow: 0 12px 25px rgba(237, 60, 48, 0.15);
  }
  
  .katalog-img {
    width: 100%; 
    height: 160px; 
    object-fit: cover; 
    border-bottom: 1px solid rgba(255,255,255,0.4);
  }
  
  .katalog-info { padding: 15px; display: flex; flex-direction: column; flex-grow: 1; }
  .katalog-info h4 { margin: 0 0 4px 0 !important; font-size: 15px !important; color: #112A46; font-weight: bold; }
  
  .katalog-harga { 
    display: block; font-size: 14px !important; font-weight: bold; color: #ED3C30; margin-bottom: 8px; 
  }
  
  .katalog-info p { margin: 0 0 15px 0 !important; font-size: 12px !important; color: #555; line-height: 1.4 !important; flex-grow: 1; }
  
  /* Tombol WhatsApp */
  .btn-wa-katalog {
    display: block; text-align: center; background: linear-gradient(145deg, #25D366, #128C7E);
    color: #fff !important; padding: 8px 12px; border-radius: 20px; text-decoration: none !important; 
    font-weight: bold; font-size: 12px; box-shadow: 0 3px 10px rgba(37, 211, 102, 0.3); 
    transition: all 0.3s ease; border: none; outline: none;
  }
  .btn-wa-katalog:hover { transform: translateY(-2px); opacity: 0.95; }

  /* Responsif Tablet dan HP */
  @media (max-width: 900px) { .katalog-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 500px) { .katalog-grid { grid-template-columns: 1fr; } }
  
  /* Penyesuaian Dark Mode */
  body.dark-mode .katalog-header h2, body.dark-mode .katalog-info h4 { color: #fff; }
  body.dark-mode .katalog-header p, body.dark-mode .katalog-info p { color: #ccc; }
  body.dark-mode .katalog-card { 
    background: rgba(30, 30, 35, 0.75); border-color: rgba(255, 255, 255, 0.1); 
  }
  body.dark-mode .katalog-harga { color: #FF5247; }
</style>

<div class="katalog-container">
  <div class="katalog-header">
    <h2>Katalog Lengkap Karya WBP</h2>
    <p>Hasil Bimbingan Kerja Lapas Kelas IIB Kalabahi</p>
  </div>
  
  <div class="katalog-grid">
    
    <!-- Produk 1 -->
    <div class="katalog-card">
      <img alt="Lampu Tidur" class="katalog-img" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgBhywn1YF631KBVMLtMDxBmm6nlogmRkBGMRYJzYiktp1AJ_iqWwRXmMstHSAshfnijcbNHlSdsmYpBwg4FA8N24Gyuult6PR78WnDpVjTKp3-gv93tJvi75T9tfo4bZGwSX11GuqS7_wwqzUYZ3MEpfvDfXZsqt5wEX_W2QHK6evgasOSb1b5Zd83kt54/s1600/image_3_buat_foto_tersebut_seprofesion.jpg"/>
      <div class="katalog-info">
        <h4>Lampu Tidur</h4>
        <span class="katalog-harga">Rp 80.000</span>
        <p>Lampu meja bernuansa klasik dengan kap kain putih berumbai dan tiang penyangga berdesain sangkar bernuansa tembaga antik.</p>
        <a class="btn-wa-katalog" href="https://wa.me/628135900050?text=Halo,%20saya%20tertarik%20dengan%20Topi%20Adat%20Khas%20Alor." target="_blank">💬 Pesan via WhatsApp</a>
      </div>
    </div>

    <!-- Produk 2 -->
    <div class="katalog-card">
      <img alt="Minyak VCO 50 ml" class="katalog-img" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEixZocYp2C1Uya-zQ9z9vLN160ScwxhQSbe9Jgc1ylA0nrcZtXGGVgIQI8zBnKVkvdT0WONDYmbckxf-MyFtMH4qP2OXfTYFI46rMlya5fqAiD8hfPWanSMFCcwnP4yANHRG28qxpkGA6lYEPVN-uGV8sFKAvUndxKRqmAcmMiKiDRdqo4tgQIRW8dNzhfg/s1600/microstock_1792722269144.jpg"/>
      <div class="katalog-info">
        <h4>Minyak VCO 50 ml</h4>
        <span class="katalog-harga">Rp 20.000</span>
        <p>Minyak kelapa murni bermerek L'Paskal Product dalam kemasan botol bening 50ml yang dilengkapi label kemasan bermotif tenun daerah.</p>
        <a class="btn-wa-katalog" href="https://wa.me/628135900050?text=Halo,%20saya%20tertarik%20dengan%20Dasi%20Adat%20Khas%20Alor." target="_blank">💬 Pesan via WhatsApp</a>
      </div>
    </div>

    <!-- Produk 3 -->
    <div class="katalog-card">
      <img alt="Pot Bunga" class="katalog-img" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjxK954bzzU6auLSmHCT-C5UYdWDHJqyjfegX0JwYTRp_yBaRzZEi2UqWAV_q4VpnYD5Z5LFEccfNZw_Q-GfsTEHTSD60GMXuXE5MAMveEPDBZik1hzgjg3Sf5rX45mdqaeSUOmOXfMm-olrAMnC0N-e50Y6p7QEI3N6siepgTqzeo4KsKnivSFBeASWO3H/s1600/image_1_buat_foto_tersebut_seprofesion.jpg"/>
      <div class="katalog-info">
        <h4>Pot Bunga</h4>
        <span class="katalog-harga">Rp 25.000</span>
        <p>Vas hias estetik berbentuk silinder bersusun yang terbuat dari lengkungan material alam dengan lapisan pernis mengkilap dan aksesoris bunga plastik.</p>
        <a class="btn-wa-katalog" href="https://wa.me/628135900050?text=Halo,%20saya%20tertarik%20dengan%20Lengan%20Tangan%20Adat." target="_blank">💬 Pesan via WhatsApp</a>
      </div>
    </div>
    
    <!-- Produk 4 -->
    <div class="katalog-card">
      <img alt="Kotak Sirih Pinang" class="katalog-img" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiZHLtJeX0Py7FiLEbvYk-S9PzFZamfjDjfE94ZopEe6OjSl7mdq2x97Xaqp9SDQ-NdIOhKv_yDpabdnx3ECaX8o0XRPAqGPqOcpNps7GlAPhC_RwdVWUC4IQXnL3JLQRjM-xLyTx82c6sHZs4R0w7zdfMI1JsYoXRqMLNR8RX44Q0yOCg_UeHK62wuIy4G/s1600/microstock_1792722295583.jpg"/>
      <div class="katalog-info">
        <h4>Kotak Sirih Pinang</h4>
        <span class="katalog-harga">Rp 25.000</span>
        <p>Wadah kompartemen kayu berhiaskan corak bunga mawar dan motif batik cerah, ideal untuk menyajikan sirih pinang atau jamuan kecil kepada tamu.</p>
        <a class="btn-wa-katalog" href="https://wa.me/628135900050?text=Halo,%20saya%20tertarik%20dengan%20Lengan%20Tangan%20Adat." target="_blank">💬 Pesan via WhatsApp</a>
      </div>
    </div>
    
   <!-- Produk 5 -->
    <div class="katalog-card">
      <img alt="Kotak Persembahan" class="katalog-img" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQqvL3ZoDqeIWCl8Tm_0GTvuEYrdubUZhdJ4WwtOrdEtONxnUIq29lXI78EtAcJE-tLCLlDB2cVUGr_81Uw4e9FAr9AWFl9SnzCAPwAmbCuAPEIzqLbDltM8z7arMvgXJs39KvB6CPDLtrPkpHeOGilLoRwfIAAgYQGHdzLn-ddCrJQlhxtud4lZbrnsOA/s1600/image_2_buat_foto_tersebut_seprofesion.jpg"/>
      <div class="katalog-info">
        <h4>Kotak Persembahan</h4>
        <span class="katalog-harga">Rp 25.000</span>
        <p>Kotak amal berbahan kayu dengan lapisan motif batik tradisional bernuansa cokelat dan celah untuk memasukan uang berbentuk salib di atasnya.</p>
        <a class="btn-wa-katalog" href="https://wa.me/628135900050?text=Halo,%20saya%20tertarik%20dengan%20Lengan%20Tangan%20Adat." target="_blank">💬 Pesan via WhatsApp</a>
      </div>
    </div>
    
   <!-- Produk 6 -->
    <div class="katalog-card">
      <img alt="Topi Adat Alor" class="katalog-img" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjySU-ZAw6QSJSIXNMbc2qVyE506cg7Ou4omioxneTUrYH-lRbAVLMUV8ZPjJerzVZXlb7xNpqckLO2JHcd6hDlZJfGukSXjiH6b_TeWLZq17A0_zaQI9FtjOnFVJQWrECJC881FduzHRAg2m1HB9g-3MDImYy119vx-DVI2CwOw1S-S_hBUtFaF5lvKHj4/s1600/image_4_buat_foto_tersebut_seprofesion.jpg"/>
      <div class="katalog-info">
        <h4>Topi Adat Alor</h4>
        <span class="katalog-harga">Rp 150.000</span>
        <p>Mahkota tradisional khas Alor berwarna merah yang dihiasi jahitan kerang kima putih dan bulu unggas sebagai simbol kebanggaan budaya.</p>
        <a class="btn-wa-katalog" href="https://wa.me/628135900050?text=Halo,%20saya%20tertarik%20dengan%20Lengan%20Tangan%20Adat." target="_blank">💬 Pesan via WhatsApp</a>
      </div>
    </div>
    
   <!-- Produk 7 -->
    <div class="katalog-card">
      <img alt="Dasi Adat Alor" class="katalog-img" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgjDX2q2l2GzsyIURSElUaCk7Ar9yp7P5159FQfVEvItafSaPDZTnKFa8Orbn9Y22lcwr5-1YRc-qNfaIf3da3hGbpEWF5kBEmFb7VIf4WeFIdseUvZ4yPtk4TEYxfdCGrBvJchW0TXJfY_UER1xkOwSuEjZ-hbzv1mkYiundyXs7hW1dlRU2TJYlQ_jquI/s1600/image_5_buat_foto_tersebut_seprofesion.jpg"/>
      <div class="katalog-info">
        <h4>Dasi Adat Alor</h4>
        <span class="katalog-harga">Rp 100.000</span>
        <p>Dasi seremonial merah yang dipercantik dengan motif simetris kerang putih dan tali pengikat kain yang praktis digunakan.</p>
        <a class="btn-wa-katalog" href="https://wa.me/628135900050?text=Halo,%20saya%20tertarik%20dengan%20Lengan%20Tangan%20Adat." target="_blank">💬 Pesan via WhatsApp</a>
      </div>
    </div>
    
   <!-- Produk 8 -->
    <div class="katalog-card">
      <img alt="Perlengkapan Lengan Adat Alor" class="katalog-img" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh2Q28q0IP8eHp5zfhhNlf7KGCcJhoraELcPvU3IbMGsZUxtIORspMx86YJLTIeF3ZlMhr1yjCfF-KbFPRWKLYsNq7QUHDK21bOxwLRV1w61Rzdn9gznGV5XGOcNkrdr3XZxiKTSU2YdcFmOGi5vl3uuqSd6WluTFiIJKWMu-sNrW4hnEj0ZWusn4DTK7uN/s1600/image_6_buat_foto_tersebut_seprofesion.jpg"/>
      <div class="katalog-info">
        <h4>Perlengkapan Lengan Adat Alor</h4>
        <span class="katalog-harga">Rp 100.000</span>
        <p>Aksesoris pergelangan tangan kembar berbahan dasar kain merah dengan motif salib dari susunan kerang untuk pelengkap busana daerah.</p>
        <a class="btn-wa-katalog" href="https://wa.me/628135900050?text=Halo,%20saya%20tertarik%20dengan%20Lengan%20Tangan%20Adat." target="_blank">💬 Pesan via WhatsApp</a>
      </div>
    </div>
    </div>

    <!-- Silakan duplikat blok <div class="katalog-card">...</div> di atas untuk Produk 5 sampai 12 -->

  </div>
</div>
