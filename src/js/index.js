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
    addressControl: false,
    linksControl: false,
    panControl: false,
    enableCloseButton: false,
  });

  updatePano();
};

window.initialize = initialize;
