/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const DEFAULT_RADIO_DECODINGS_PERIOD_MILLISECONDS = 1000;
const DEFAULT_RSSI = -70;
const MIN_RSSI = -80;
const MAX_RSSI = -60;
const RSSI_RANDOM_DELTA = 5;
const LOCALE = 'en-GB';
const LOCALE_OPTIONS = {
   hour: "2-digit",
   minute: "2-digit",
   second: "2-digit",
   fractionalSecondDigits: 3
};
const TEST_ORIGIN = 'test';


/**
 * TestListener Class
 * Provides a consistent stream of artificially generated packets.
 */
class TestListener {

  /**
   * TestListener constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    this.decoder = options.decoder;
    this.radioDecodingPeriod = options.radioDecodingPeriod ||
                               DEFAULT_RADIO_DECODINGS_PERIOD_MILLISECONDS;
    this.rssi = [ DEFAULT_RSSI ];
    this.decodingOptions = options.decodingOptions || {};

    setInterval(emitRadioDecodings, this.radioDecodingPeriod, this);
  }

}


/**
 * Emit simulated radio decoding packets
 * @param {TestListener} instance The given instance.
 */
function emitRadioDecodings(instance) {
  let now = new Date();
  let currentDate = now.getFullYear() + '/' +
                    (now.getMonth() + 1).toString().padStart(2, '0') + '/' +
                    now.getDate().toString().padStart(2, '0');
  let currentTime = now.toLocaleTimeString(LOCALE, LOCALE_OPTIONS);
  let timezone = Math.floor(-now.getTimezoneOffset() / 60) + ':00';
  let simulatedTagData = {
      timeZone: timezone,
      pcEthernetMACAddress: "00057B870000",
      pcWiFiMACAddress: "",
      tags: [{
        epc: "7EDA9038051002710002C0AE",
        antennaPort: "1",
        rssi: instance.rssi[0].toString(),
        timeOfRead: currentDate + ' ' + currentTime
      }]
  };

  updateSimulatedRssi(instance);
  instance.decoder.handleData(simulatedTagData, TEST_ORIGIN, now.getTime(),
                              instance.decodingOptions);
}


/**
 * Update the simulated RSSI values
 * @param {TestListener} instance The given instance.
 */
function updateSimulatedRssi(instance) {
  for(let index = 0; index < instance.rssi.length; index++) {
    instance.rssi[index] += Math.floor((Math.random() * RSSI_RANDOM_DELTA) -
                                       (RSSI_RANDOM_DELTA / 2));
    if(instance.rssi[index] > MAX_RSSI) {
      instance.rssi[index] = MAX_RSSI;
    }
    else if(instance.rssi[index] < MIN_RSSI) {
      instance.rssi[index] = MIN_RSSI;
    }
  }
}


module.exports = TestListener;
