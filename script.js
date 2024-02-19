'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map, mapEvent;
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    // success handler
    function (position) {
      //   console.log(position);
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      console.log(latitude, longitude);
      console.log(`https://www.google.com/maps/@${latitude},${longitude}?`);
      //   coordinates
      const coords = [latitude, longitude];
      //   browser is successfull in getting coordinates
      // load map
      map = L.map('map').setView(coords, 13);

      // console.log(map);
      L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // handling click on map
      map.on('click', function (mapE) {
        // changed global mapEvent
        mapEvent = mapE;
        // on click the form is shown
        form.classList.remove('hidden');
        // focus is kept on input distance
        inputDistance.focus();
      });
    },
    // failure handler
    function () {
      alert('Could not get your position');
    }
  );
}

form.addEventListener('submit', function (event) {
  event.preventDefault();

  // map and mapEvent are made global so they can be accessed here

  // clearing fields after form is submitted
  inputCadence.value =
    inputDistance.value =
    inputDuration.value =
    inputDistance.value =
      '';

  // Display the marker when form is submitted

  // console.log(mapEvent);
  const { lat, lng } = mapEvent.latlng;
  const newCoords = [lat, lng];
  // adding marker to the position where click happens

  L.marker(newCoords)
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
      // can also use .setContent on pop()
    )
    .setPopupContent(`e`)
    .openPopup();

  // todo hide the form after submit
});

inputType.addEventListener('change', e => {
  const selectedType = inputType.value;
  // console.log(selectedType);
  // console.log(inputCadence.parentElement);
  inputCadence.parentElement.classList.toggle('form__row--hidden');
  inputElevation.parentElement.classList.toggle('form__row--hidden');
});
