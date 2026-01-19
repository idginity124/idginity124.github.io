# Portfolio (GitHub Pages)

Bu repo **tamamen statik** bir portföy sitesidir ve **GitHub Pages** üzerinde sorunsuz çalışacak şekilde düzenlenmiştir.

## Sayfalar

- `index.html` — Ana sayfa
- `projects.html` — Proje listesi
- `projects/*.html` — Her proje için ayrı detay sayfası
- `contact.html` — İletişim
- `vidextract.html` — Eski linkler için yönlendirme (redirect) → `projects/vidextract.html`

## Local test (önerilen)

```bash
python -m http.server 5500
```

Sonra tarayıcıda:
- `http://localhost:5500`

## GitHub Pages deploy

Senin durumunda `idginity124.github.io` bir **user pages** olduğu için:
- Bu dosyaları `idginity124.github.io` reposunun kök dizinine koy
- `main` (veya `master`) branch’e pushla
- Pages ayarlarında yayın kaynağı `root` olacak şekilde açık olmalı

## Yeni proje ekleme

1. `projects/_template.html` dosyasını kopyala (örn: `projects/yeni-proje.html`)
2. İçerikleri (başlık, özet, etiketler, linkler) düzenle
3. `projects.html` içine yeni kartı ekle (Detaylar linki yeni sayfayı göstermeli)

> İpucu: Detay sayfaları için görsel ekleyeceksen `assets/img/` altına koyup sayfada `../assets/img/...` olarak çağırabilirsin.
