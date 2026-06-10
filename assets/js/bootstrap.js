(function () {
  var hash = location.hash;
  var tour = (hash === "#tur" || hash === "#tur-backpacking" || hash === "#tomorrowland");
  document.body.classList.toggle("view-tour", tour);
  document.body.classList.toggle("view-home", !tour);
  document.body.classList.toggle("tour-detail-page", tour);
  document.body.classList.toggle("on-detail-page", tour);
  document.body.classList.toggle("tour-tml", hash === "#tomorrowland");
  // Restore saved language
  try {
    var saved = localStorage.getItem('gezeceyik-lang') || 'tr';
    if (saved !== 'tr' && saved !== 'en') saved = 'tr';
    document.documentElement.setAttribute('data-lang', saved);
  } catch (e) {
    document.documentElement.setAttribute('data-lang', 'tr');
  }
})();
