// scripts.js
function toggleMenu() {
  document.getElementById("menu").classList.toggle("active");
}
// scripts.js
let slideIndex = 0;
showSlides();

function showSlides() {
  let slides = document.getElementsByClassName("slide");
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > slides.length) { slideIndex = 1 }
  slides[slideIndex - 1].style.display = "flex";
  setTimeout(showSlides, 10000); // Change slide every 5 seconds
}

function changeSlide(n) {
  slideIndex += n - 1;
  showSlides();
}


// scripts.js
function toggleMenu() {
  document.getElementById("mobileNav").style.width = "250px";
}

function closeMenu() {
  document.getElementById("mobileNav").style.width = "0";
}




