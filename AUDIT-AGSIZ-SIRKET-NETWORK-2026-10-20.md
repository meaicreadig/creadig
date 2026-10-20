# creaDIG — "Kendi Kendine Çalışan, Birbirine Bağlı Şirket" Durum Analizi
**Tarih:** 20.10.2026 · **Kapsam:** Tüm site — tanıtım sayfaları, Admin, Finanz · **Yöntem:** 6 paralel, sadece-okuma kod incelemesi (hiçbir şey değiştirilmedi), gerçek kod satırlarına dayalı, tahmin değil.

---

## Kısa cevap

Sezgin doğruydu: **bu bir paranoya değil, gerçek bir durum.** Ama resim siyah-beyaz değil:

- Bazı yerler **gerçekten çalışıyor, gerçekten bağlı** — senin "ağ" hayaline en yakın örnekler zaten var.
- Bazı yerler **gerçek ama kör** — çalışıyor ama diğer sistemle hiç konuşmuyor.
- Bazı yerler **görsel kabuk** — hoş duruyor ama arkasında gerçek veri/otomasyon yok.
- En büyük tek kopukluk: **Satış ↔ Finans hiç konuşmuyor.** Bir anlaşma kazandığında, para tarafı bunu hiç görmüyor.
- Tekrar eden bir hastalık var: **aynı iş için iki paralel sistem** — birbirinden habersiz. Bu, v0'ın "şirketsel hafızası olmadan" çalışmasının doğal sonucu.

---

## 1) Gerçekten çalışan, gerçekten bağlı olanlar (kanıtlı)

Bunlar senin hayalinin **zaten gerçekleştiği** yerler — övünebilirsin:

- **Lead yakalama**: Siteden gelen her form (randevu, hızlı kontrol, ürün ilgisi) → tek ortak noktadan → gerçek e-posta + gerçek veritabanı kaydı → otomatik "ilk cevap" ve "48 saat sonra takip" planı kuruyor.
- **Mail cevapları (Eingang)**: Müşteri cevap yazdığında → AI gerçekten sınıflandırıyor → takip mailini otomatik durduruyor → cevap taslağı hazırlıyor → **ve bunu pipeline'a (satış hunisine) otomatik yansıtıyor** (aşamayı ilerletiyor). Bu, sitede en iyi bağlanmış parça.
- **Gesprächsraum (görüşme notu)**: Not kaydettiğinde, anlaşma otomatik ilerliyor — elle kopyalama yok.
- **Randevu rezervasyonu**: Aynı şekilde otomatik pipeline güncellemesi yapıyor.
- **Asistan-Truppe (7 ajan)**: Gerçekten her gün otomatik çalışıyor (Vercel'de zamanlanmış, 05:00), sen sayfayı açtığında da ayrıca tetikleniyor (yedekli). Onay verdiğinde ("Freigeben") buton **gerçekten** mail gönderiyor / LinkedIn'e **gerçekten** paylaşıyor / kaydı **gerçekten** siliyor — süs değil. Senin tek yaptığın onay tıklaması, gerisi gerçek.
- **Fibero-Abgleich**: Her gün otomatik, gerçek.
- **Messen-Radar (fuar araştırması)**: Haftada bir otomatik gerçekten araştırıyor (içerik gerçek).
- **Sitenin "dürüstlük katmanı"** (sahte referans/sertifika engelleme): Olgun ve aktif — bu konuda eskiden bulduğumuz sorunlar (BAFA/iuk gibi sahte sertifikalar, 2018 kuruluş hatası) zaten düzeltilmiş.

---

## 2) En büyük tek kopukluk: Satış kazanınca, Finans'ın haberi olmuyor

Bu, "şirket seviyesinde" dediğin şeyin en kritik eksiği:

- Bir anlaşma "won" (kazanıldı) olduğunda, **hiçbir kod** Finanz'da fatura/teklif taslağı oluşturmuyor. Sıfır bağlantı.
- Eski fatura modülü (`lib/rechnung.ts`) kodun kendi notuna göre **hiçbir zaman** bir satır yazmamış — tablo boş, yazma yolu yok.
- Gerçek çalışan fatura sistemi (Finanz'daki) ise satış tarafının hiç haberi yok — birbirlerini tanımıyorlar.
- **Sonuç:** Bir müşteri kazandığında, parayı elle, sıfırdan Finanz'a yeniden yazman gerekiyor. Sistem bunu hiç hatırlatmıyor, hiç taslak hazırlamıyor.
- Bonus kötü haber: Admin ana panelindeki "açık faturalar" sayısı da bu yüzden **her zaman sıfır/yanlış** gösteriyor — çünkü yanlış (boş) tablodan okuyor.

**Bu, yol haritasının 1 numarası olmalı.**

---

## 3) Tekrar eden hastalık: aynı iş için iki paralel, birbirinden habersiz sistem

v0 her yeni isteğinde geçmişi tam hatırlamadığı için, bu dört yerde **aynı işi yapan iki ayrı sistem** oluşmuş:

1. **İki otomasyon motoru**: Eski olan (`automation.ts`) hiçbir zaman dışa etki yapmaz, sadece hatırlatma bırakır. Yeni Asistan-Truppe gerçekten etki yapar. İkisi birbirini okumuyor — aynı anlaşma için sana iki farklı yerden aynı uyarı gelebilir.
2. **İki LinkedIn bağlantısı**: Pazarlama atölyesinde LinkedIn'i bağlaman, Redaksiyon-ajanının LinkedIn'ini bağlamış **olmuyor**. Birini bağlayıp "tamam, bağlı" diye düşünebilirsin, diğeri sessizce çalışmayabilir.
3. **İki mail gönderim sistemi**: Tek-tek (1:1) mailler düzgün takip ediliyor, cevap eşleştiriliyor. Ama **toplu kampanya mailleri** tamamen ayrı bir kayıtta — cevapları hiç eşleşmiyor, otomatik takip yok.
4. **İki pipeline-yazma yolu**: Vertrieb sayfasından aşama değiştirmen, Verkaufen sayfasının göremediği bir formatta kayıt bırakıyor — iki sayfa birbirinin geçmişini görmüyor/geri alamıyor.

**Neden oluyor bu:** Senin v0'a verdiğin talimat genelde "şu özelliği ekle" oluyor, "şu özelliği ekle VE şu mevcut sistemle aynı veriyi kullan, ikinci bir kayıt açma" demiyorsun — çünkü bunu bilmen beklenemez, teknik bir detay. v0 da her promptu kendi başına bir adacık gibi inşa ediyor. Bu senin suçun değil, ama bilerek yönetilebilir (aşağıda öneri var).

---

## 4) Görsel kabuk — hoş duruyor, arkası boş/sabit

- **3D Ana Merkez**'deki **"Finanzen" odası sabit/donuk** — gerçek para durumunu hiç yansıtmıyor, hep aynı sayıyı gösteriyor.
- 15 departmandan **10'u** "henüz kurulmadı" diye dürüstçe boş duruyor (bu iyi — yalan söylemiyor) ama bina görsel olarak "tam dolu şirket" hissi veriyor, gerçek kapsamı abartıyor.
- "Ağ/Netz" görünümündeki ilişki çizgileri (hangi sayfa hangisiyle bağlı) **gerçek hesaplanmış bir bağlantı haritası değil** — elle yazılmış, sabit bir liste. Kod değiştiğinde otomatik güncellenmiyor.
- `lib/zentrale/projektion.ts` — artık hiçbir yerde kullanılmayan, temizlenebilir ölü kod.

---

## 5) Diğer somut sızıntılar

- **Randevu onay sayfası sadece Almanca.** TR/EN/AR'da randevu isteyen biri, ilk adımda kendi dilini görüyor ama asıl "saatini seç, onayla" sayfası ve onay maili **her zaman Almanca**. Senin TR-DE hedef pazarın için bu doğrudan kayıp anlamına gelir.
- **LinkedIn bağlı değilse, onay verince "başarılı" görünüyor ama paylaşım hiç gitmiyor** — sana hata gösterilmiyor, yanlış güven veriyor.
- **İş başvuruları hiçbir yere kaydedilmiyor** — başvuran kendi mail programını açıp göndermek zorunda, sistemde hiç iz kalmıyor.
- **Fuar radarı lead üretemiyor** — fuarı buluyor ama "bu fuardan bir kontak kaydet" diye bir bağlantı yok, liste kör bir uca gidiyor.
- `/admin/beleg` sayfası ile sitenin "sahte referans" denetleyicisi (`check-beleg.mjs`) aynı isme sahip ama **tamamen farklı iki şey** — biri bozulsa diğeri haber vermiyor.

---

## Yol haritası — en çok etki yapacaklardan başlayarak

1. **Satış kazanınca Finanz'a otomatik taslak** (anlaşma + müşteri + tutar) — en büyük boşluk, en büyük kazanç.
2. **Admin ana paneldeki "açık fatura" sayısını doğru tabloya bağla** — şu an yapısal olarak hep yanlış.
3. **İki LinkedIn bağlantısını birleştir** — tek bağlantı, iki yerden de çalışsın.
4. **Randevu onay sayfasını ve mailini TR/EN/AR'a da aç** — pazarına doğrudan dokunan tek kalem.
5. **İki pipeline-yazma yolunu birleştir** (Vertrieb ↔ Verkaufen aynı geçmişi görsün).
6. **Kampanya maillerini de takip sistemine bağla** (cevap eşleştirme + otomatik takip).
7. **Fuar radarına "bu fuardan kontak kaydet" adımı ekle.**
8. **LinkedIn bağlı değilken sessiz "başarılı" yerine net hata göster.**
9. **3D binadaki Finanzen odasını gerçek veriye bağla** (ya da "henüz ölçülmedi" diye dürüstçe göster — diğer 10 oda gibi).
10. **İş başvurularına en azından basit bir kayıt** ekle, tamamen karanlıkta kalmasın.

---

## v0'a talimat verirken fark edecek tek şey

Bu rapor boyunca görülen "iki paralel sistem" hastalığının kökü hep aynı: yeni bir özellik istenirken, **"bunu mevcut X sistemiyle aynı veriyi kullanarak yap, yeni bir tablo/bağlantı açma"** cümlesi eksik kalıyor. Bundan sonra v0'a bir şey istediğinde, mümkünse şu kalıbı ekle:

> "Bunu [ilgili mevcut sayfa/sistem] ile aynı veriyi kullanarak yap, ayrı bir kayıt açmasın."

Bu tek cümle, bu raporun yarısındaki sorunun tekrar oluşmasını önler.

---

*Hiçbir kod değiştirilmedi. Bu tamamen okuma/analiz raporu.*
