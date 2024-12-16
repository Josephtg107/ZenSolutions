// Set a launch date
const launchDate = new Date("December 31, 2024 00:00:00").getTime();

const countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const timeLeft = launchDate - now;

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days;
    document.getElementById("hours").innerText = hours;
    document.getElementById("minutes").innerText = minutes;
    document.getElementById("seconds").innerText = seconds;

    if (timeLeft < 0) {
        clearInterval(countdownInterval);
        document.getElementById("countdown").innerHTML = "We're live!";
    }
}, 1000);

function reveal() {
    const reveals = document.querySelectorAll('.hero, .about, .contact, .work, .services');

    reveals.forEach(reveal => {
        const windowHeight = window.innerHeight;
        const elementTop = reveal.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            reveal.style.opacity = 1;
            reveal.style.transform = 'translateY(0)';
        }
    });
}

window.addEventListener('load', reveal);
window.addEventListener('scroll', reveal);