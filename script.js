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

class App {
  #map;
  #mapEvent;
  constructor() {
    this._getPosition();
    // since _newWorkout's this == form element we need to change it to app's object
    form.addEventListener('submit', this._newWorkOut.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
  }

  // gets current position of user
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // success handler
        // note :- since we need the this keyword to access object to eventually access the private field #map we would need
        // to bind the this keyword of the success handler to the 'this' of our class as it is a regular function call hence it's this = undefined
        this._loadMap.bind(this),
        // failure handler
        function () {
          alert('Could not get your position');
        }
      );
    }
  }
  // loads map based on user location
  _loadMap(position) {
    // console.log(this); points to App
    console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(latitude, longitude);
    console.log(`https://www.google.com/maps/@${latitude},${longitude}?`);
    //   coordinates
    const coords = [latitude, longitude];
    //   browser is successfull in getting coordinates
    // load map

    // console.log(this);
    this.#map = L.map('map').setView(coords, 13);

    // console.log(map);
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // handling click on map
    this.#map.on(
      'click',
      this._showForm.bind(this)
      // again binding as this pointed to map and not app
    );
  }

  // displays the form
  _showForm(mapE) {
    // console.log(this);
    // changed global mapEvent
    this.#mapEvent = mapE;
    // console.log(this);
    // on click the form is shown
    form.classList.remove('hidden');
    // focus is kept on input distance
    inputDistance.focus();
  }

  // toggles cadence or elevation gain field based on type being either running or cycling
  _toggleElevationField() {
    const selectedType = inputType.value;
    // console.log(selectedType);
    // console.log(inputCadence.parentElement);
    inputCadence.parentElement.classList.toggle('form__row--hidden');
    inputElevation.parentElement.classList.toggle('form__row--hidden');
  }

  _newWorkOut(event) {
    event.preventDefault();

    // console.log('inside new workout', this);
    // map and mapEvent are made global so they can be accessed here

    // clearing fields after form is submitted
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputDistance.value =
        '';

    // Display the marker when form is submitted

    // console.log(this.#mapEvent);
    const { lat, lng } = this.#mapEvent.latlng;
    const newCoords = [lat, lng];
    // adding marker to the position where click happens

    L.marker(newCoords)
      .addTo(this.#map)
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
      .setPopupContent(`a new workout has been set`)
      .openPopup();
  }
}

const app = new App();
