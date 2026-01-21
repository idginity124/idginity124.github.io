---
title: Blog altyapısı nasıl çalışıyor?
date: 2026-01-21
tags: [Portfolio, Blog]
summary: GitHub Pages üzerinde admin olmadan blog ekleme akışı: Markdown + posts.json.
---

# Blog altyapısı nasıl çalışıyor?

Bu site GitHub Pages üzerinde statik çalışıyor. Yani **sunucu yok**.

Bu yüzden blog yazıları için iki parçalı bir sistem var:

1. `content/blog/` içine `.md` dosyası ekle
2. `assets/data/posts.json` içine yazının bilgisini gir

Bu kadar. Yayınlamak için sadece **commit + push** yapman yeterli.

## Adımlar

- `content/blog/yazi-slug.md` dosyasını oluştur
- `assets/data/posts.json` içine yeni post ekle
- Site otomatik güncellenir

## İpuçları

- Başlıklar `#` ile
- Kod blokları ``` ile
- Görsel eklemek için: `assets/uploads/` klasörüne koyup markdown içinde linkle.
