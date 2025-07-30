document.addEventListener('DOMContentLoaded', domloaded, false);
function domloaded() {
    
  document.getElementById("defaultOpen").click();
  new Glide('.glide', {
    type: 'carousel',
    startAt: 0,
    perView: 3,
    focusAt: 'center',
    autoplay: 2000,
    hoverpause: true,
    keyboard: true,
  }).mount();
}

function openTab(evt, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

document.querySelector('.research-category').addEventListener('click', function() {
  this.classList.toggle('expanded');
});