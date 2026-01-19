let currentLang = 'tr'; // Başlangıç dili Türkçe

function toggleLanguage() {
    const langBtn = document.getElementById('lang-btn');
    
    // Dili değiştir
    if (currentLang === 'tr') {
        currentLang = 'en';
        langBtn.innerText = 'TR'; // Butona basınca TR'ye dönmek için yazı değişsin
    } else {
        currentLang = 'tr';
        langBtn.innerText = 'EN';
    }

    // Tüm içerikleri güncelle
    const elements = document.querySelectorAll('[data-tr]');
    
    elements.forEach(element => {
        if (currentLang === 'tr') {
            element.innerText = element.getAttribute('data-tr');
        } else {
            element.innerText = element.getAttribute('data-en');
        }
    });
}