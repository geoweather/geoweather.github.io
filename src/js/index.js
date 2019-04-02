/* global google */
const state = {
  timeLimit: 15,
  timeUnit: 700, // Surprise! Let's make the user more nervous
  countdownInterval: null,
  weatherAPIToken: '44fbf3cfb0839a699c0b9d84be12a46e',
  weatherAPIURL: 'https://api.openweathermap.org/data/2.5/weather',
};

let sv;
let panoramaElem;

const gameboardControls = document.querySelector('#gameboard__controls');
const countdownElem = document.querySelector('#gameboard__countdown');
const goodJobBadge = document.querySelector('#good-job-badge');
const badJobBadge = document.querySelector('#bad-job-badge');
const homePage = document.getElementById('home');
const gameboardPage = document.getElementById('gameboard');

const possibleLocations = [
  { lat: 57.149651, lng: -2.099075 },
  { lat: 37.869260, lng: -122.254811 },
];

// Basic set up after google maps API is ready
window.initialize = () => {
  sv = new google.maps.StreetViewService();
  panoramaElem = new google.maps.StreetViewPanorama(document.getElementById('gameboard__pano'), {
    disableDefaultUI: true,
  });
};

// Changing the location
const updatePano = () => {
  // Choose random location and save it in state
  const location = possibleLocations[Math.floor(Math.random() * possibleLocations.length)];
  state.location = location;

  // Find a photo at chosen location outdoors in 5 km radius
  sv.getPanorama({ location, radius: 5000, source: 'outdoor' }, (data, status) => {
    // If found a photo set it up. If not search again
    if (status === 'OK') {
      panoramaElem.setPano(data.location.pano);
      panoramaElem.setPov({
        heading: 270,
        pitch: 0,
      });
      panoramaElem.setVisible(true);

      // Enable temperature buttons
      gameboardControls.classList.add('gameboard__controls--active');

      // Run countdown for the user
      let timeLeft = state.timeLimit;
      state.countdownInterval = setInterval(() => {
        timeLeft -= 1;
        countdownElem.innerHTML = timeLeft;
        if (timeLeft <= 0) clearInterval(state.countdownInterval);
      }, state.timeUnit);
    } else {
      updatePano();
    }
  });
};
// TODO: remove before going to high-load production with millions of users per second
window.updatePano = updatePano;

// Start game
document.getElementById('home__start-btn').addEventListener('click', () => {
  homePage.classList.remove('home--opened');
  gameboardPage.classList.add('gameboard--opened');
  updatePano();
});

// Handle user chose and clicked temperature button
[].forEach.call(document.querySelectorAll('.gameboard__guess-btn'), (button) => {
  button.addEventListener('click', () => {
    // Disable temperature buttons
    gameboardControls.classList.remove('gameboard__controls--active');
    // Stop countdown
    clearInterval(state.countdownInterval);

    // Get real current temperature
    fetch(`${state.weatherAPIURL}?lat=${state.location.lat}&lon=${state.location.lng}&appid=${state.weatherAPIToken}`)
      .then(response => response.json())
      .then((response) => {
        // From Kelvin to C
        const tempInC = response.main.temp - 273.15;
        if (tempInC > +button.dataset.min && tempInC < +button.dataset.max) {
          // Show great badge
          goodJobBadge.classList.add('good-job-badge--moving');
          setTimeout(() => goodJobBadge.classList.remove('good-job-badge--moving'), 2000);
        } else {
          // Show awful badge
          badJobBadge.classList.add('bad-job-badge--moving');
          setTimeout(() => badJobBadge.classList.remove('bad-job-badge--moving'), 2000);
        }

        // Stare new round
        updatePano();
      });
  });
});
