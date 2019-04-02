/* global google */

let sv;
let panoramaElem;
const state = {
  timeLimit: 15,
  timeUnit: 700, // Surprise
  countdownInterval: null,
  weatherAPIToken: '44fbf3cfb0839a699c0b9d84be12a46e',
  weatherAPIURL: 'https://api.openweathermap.org/data/2.5/weather',
};
const gameboardControls = document.querySelector('#gameboard__controls');
const countdownElem = document.querySelector('#gameboard__countdown');
const goodJobBadge = document.querySelector('#good-job-badge');
const badJobBadge = document.querySelector('#bad-job-badge');

// A bit hacky
const possibleLocations = [
  { lat: 57.149651, lng: -2.099075 },
  { lat: 37.869260, lng: -122.254811 },
];

const updatePano = () => {
  const location = possibleLocations[Math.floor(Math.random() * possibleLocations.length)];
  state.location = location;

  sv.getPanorama({ location, radius: 5000, source: 'outdoor' }, (data, status) => {
    if (status === 'OK') {
      panoramaElem.setPano(data.location.pano);
      panoramaElem.setPov({
        heading: 270,
        pitch: 0,
      });
      panoramaElem.setVisible(true);

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

const initialize = () => {
  sv = new google.maps.StreetViewService();
  panoramaElem = new google.maps.StreetViewPanorama(document.getElementById('gameboard__pano'), {
    disableDefaultUI: true,
  });
};

window.updatePano = updatePano;
window.initialize = initialize;

const homePage = document.getElementById('home');
const gameboardPage = document.getElementById('gameboard');

document.getElementById('home__start-btn').addEventListener('click', () => {
  homePage.classList.remove('home--opened');
  gameboardPage.classList.add('gameboard--opened');
  updatePano();
});

[].forEach.call(document.querySelectorAll('.gameboard__guess-btn'), (button) => {
  button.addEventListener('click', () => {
    gameboardControls.classList.remove('gameboard__controls--active');
    clearInterval(state.countdownInterval);

    fetch(`${state.weatherAPIURL}?lat=${state.location.lat}&lon=${state.location.lng}&appid=${state.weatherAPIToken}`)
      .then(response => response.json())
      .then((response) => {
        const tempInC = response.main.temp - 273.15;
        if (tempInC > +button.dataset.min && tempInC < +button.dataset.max) {
          goodJobBadge.classList.add('good-job-badge--moving');
          setTimeout(() => goodJobBadge.classList.remove('good-job-badge--moving'), 2000);
        } else {
          badJobBadge.classList.add('bad-job-badge--moving');
          setTimeout(() => badJobBadge.classList.remove('bad-job-badge--moving'), 2000);
        }

        updatePano();
      });
  });
});
