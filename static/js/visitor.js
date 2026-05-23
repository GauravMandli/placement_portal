setTimeout(() => {
  document.querySelectorAll('.toast').forEach(toast => {
    toast.style.display = 'none';
  });
}, 3000);

const form = document.getElementById('contactForm');

if (form) {
  form.addEventListener('submit', function(e) {

    if (!validateForm('contactForm')) {
        e.preventDefault();
    }

  });
}