const track = document.querySelector('.carousel-track');
let isDown = false;
let startX;
let scrollLeft;

track.addEventListener('mousedown', (e) => {
    isDown = true;
    track.classList.add('active');
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
});

track.addEventListener('mouseleave', () => {
    isDown = false;
    track.classList.remove('active');
});

track.addEventListener('mouseup', () => {
    isDown = false;
    track.classList.remove('active');
});

track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    track.scrollLeft = scrollLeft - walk;
});

// Touch support
track.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.touches[0].pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
});

track.addEventListener('touchend', () => {
    isDown = false;
});

track.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - track.offsetLeft;
    const walk = (x - startX) * 2;
    track.scrollLeft = scrollLeft - walk;
});

// Images for the carousel
const images = [
    { src: "/NewImages/PizzaImages/Pizza1.png", alt: "Pizza1" },
    { src: "/NewImages/PizzaImages/Pizza2.png", alt: "Pizza2" },
    { src: "/NewImages/PizzaImages/Pizza3.png", alt: "Pizza3" },
    { src: "/NewImages/PizzaImages/Pizza4.png", alt: "Pizza4" },
    { src: "/NewImages/PizzaImages/Pizza5.png", alt: "Pizza5" },
    { src: "/NewImages/PizzaImages/Pizza6.png", alt: "Pizza6" },
    { src: "/NewImages/PizzaImages/Pizza7.png", alt: "Pizza7" },
    { src: "/NewImages/PizzaImages/Pizza8.png", alt: "Pizza8" },
];

// Function to create image elements
function createImages() {
    images.forEach(image => {
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.alt;
        track.appendChild(img);
    });
}

// Initialize images
createImages();

// New section for Lemon Plie images
const lemonImages = [
    { src: "/NewImages/LemonPlieImages/LemonPlie1.png", alt: "LemonPlie1" },
    { src: "/NewImages/LemonPlieImages/LemonPlie2.png", alt: "LemonPlie2" },
    { src: "/NewImages/LemonPlieImages/LemonPlie3.png", alt: "LemonPlie3" },
    { src: "/NewImages/LemonPlieImages/LemonPlie4.png", alt: "LemonPlie4" },
    { src: "/NewImages/LemonPlieImages/LemonPlie5.png", alt: "LemonPlie5" },
    { src: "/NewImages/LemonPlieImages/LemonPlie6.png", alt: "LemonPlie6" },
    { src: "/NewImages/LemonPlieImages/LemonPlie7.png", alt: "LemonPlie7" },
    { src: "/NewImages/LemonPlieImages/LemonPlie8.png", alt: "LemonPlie8" },
    { src: "/NewImages/LemonPlieImages/LemonPlie9.png", alt: "LemonPlie9" },
    { src: "/NewImages/LemonPlieImages/LemonPlie10.png", alt: "LemonPlie10" },
];

// Function to create Lemon Plie image elements
function createLemonImages() {
    lemonImages.forEach(image => {
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.alt;
        document.querySelector('.portfolio-carousel .carousel-track').appendChild(img);
    });
}

// Initialize Lemon Plie images
createLemonImages();

// New section for PhysioMag images
const physioMagImages = [
    { src: "/NewImages/PhysioMagImages/PhysioMag1.png", alt: "PhysioMag1" },
    { src: "/NewImages/PhysioMagImages/PhysioMag2.png", alt: "PhysioMag2" },
    { src: "/NewImages/PhysioMagImages/PhysioMag3.png", alt: "PhysioMag3" },
    { src: "/NewImages/PhysioMagImages/PhysioMag4.png", alt: "PhysioMag4" },
    { src: "/NewImages/PhysioMagImages/PhysioMag5.png", alt: "PhysioMag5" },
    { src: "/NewImages/PhysioMagImages/PhysioMag6.png", alt: "PhysioMag6" },
];

// Function to create PhysioMag image elements
function createPhysioMagImages() {
    physioMagImages.forEach(image => {
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.alt;
        document.querySelector('.portfolio-carousel .carousel-track').appendChild(img);
    });
}

// Initialize PhysioMag images
createPhysioMagImages();
