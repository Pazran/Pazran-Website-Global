import './styles.scss';

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const toggleButton = document.querySelector('.toggle-theme');
  toggleButton.classList.toggle('dark'); // Toggle the "dark" class for styling

  // Switch between sun and moon icons inside the icon container
  toggleButton.querySelector('.icon').innerHTML = toggleButton.classList.contains('dark') ? '☀️' : '🌙';
}

// Initial icon setup with wrapper
//Set default theme as dark
//document.body.classList.toggle('dark-theme');
//document.querySelector('.toggle-theme').classList.toggle('dark');
//document.querySelector('.toggle-theme').innerHTML = '<span class="icon">☀️</span>';
document.querySelector('.toggle-theme').innerHTML = '<span class="icon">🌙</span>';
document.querySelector('.toggle-theme').onclick = toggleTheme;