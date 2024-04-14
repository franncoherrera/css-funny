// NAVBAR
const toggleBtn = document.getElementsByClassName('navbar-toggle')[0];
const navbarLinks = document.getElementsByClassName('navbar-links');

toggleBtn.addEventListener('click', function(){
    for(let i=0; i<navbarLinks.length; i++){
        navbarLinks[i].classList.toggle('active');
    }
});