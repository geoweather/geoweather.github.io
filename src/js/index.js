/* global google */

// A bit hacky
let sv;
let panoramaElem;

const possibleLocations = [
  { lat: 57.149651, lng: -2.099075 },
  { lat: 37.869260, lng: -122.254811 },
];

const updatePano = () => {
  const location = possibleLocations[Math.floor(Math.random() * possibleLocations.length)];

  sv.getPanorama({ location, radius: 5000, source: 'outdoor' }, (data, status) => {
    if (status === 'OK') {
      panoramaElem.setPano(data.location.pano);
      panoramaElem.setPov({
        heading: 270,
        pitch: 0,
      });
      panoramaElem.setVisible(true);
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
