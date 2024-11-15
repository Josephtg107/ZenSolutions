// Set a launch date
const launchDate = new Date("December 31, 2024 00:00:00").getTime();

const countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const timeLeft = launchDate - now;

    // Calculate time components
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    // Display countdown
    document.getElementById("days").innerText = days;
    document.getElementById("hours").innerText = hours;
    document.getElementById("minutes").innerText = minutes;
    document.getElementById("seconds").innerText = seconds;

    // Check if launch date has passed
    if (timeLeft < 0) {
        clearInterval(countdownInterval);
        document.getElementById("countdown").innerHTML = "We're live!";
    }
}, 1000);

// Notification function
function notify() {
    const emailInput = document.getElementById("email");
    const email = emailInput.value;

    if (email) {
        document.getElementById("notification-message").innerText = `Thanks! You'll be notified at ${email}.`;
        emailInput.value = ""; // Clear the input
    } else {
        document.getElementById("notification-message").innerText = "Please enter a valid email.";
    }
}
