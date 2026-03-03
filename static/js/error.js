window.addEventListener('load', function () {
    var card = document.getElementById('errorCard');
    if (card) {
        requestAnimationFrame(function () {
            card.classList.add('page-enter-active');
        });
    }
});
