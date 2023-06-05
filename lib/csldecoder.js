/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const Raddec = require('raddec');


/**
 * CslDecoder Class
 * Decodes data streams from one or more CSL readers and forwards the
 * packets to the given BarnowlCsl instance.
 */
class CslDecoder {

  /**
   * CslDecoder constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    this.barnowl = options.barnowl;
  }

  /**
   * Handle data from a given device, specified by the origin
   * @param {Buffer} data The data as a buffer.
   * @param {String} origin The unique origin identifier of the device.
   * @param {Number} time The time of the data capture.
   * @param {Object} decodingOptions The packet decoding options.
   */
  handleData(data, origin, time, decodingOptions) {
    let self = this;
    let raddecs = processTagData(data, origin, time, decodingOptions);

    raddecs.forEach(raddec => {
      self.barnowl.handleRaddec(raddec)
    });
  }
}


/**
 * Process Tag data
 * @param {Object} data The data in the default CSL format.
 * @param {String} origin The unique origin identifier of the device.
 * @param {Number} time The time of the data capture.
 * @param {Object} decodingOptions The packet decoding options.
 */
function processTagData(data, origin, time, decodingOptions) {
  let raddecs = [];

  let receiverId = '';
  let receiverIdType = Raddec.identifiers.TYPE_UNKNOWN;

  if(data.hasOwnProperty('pcEthernetMACAddress') &&
     data.pcEthernetMACAddress !== "") {
    receiverId = data.pcEthernetMACAddress.toLowerCase();
    receiverIdType = Raddec.identifiers.TYPE_EUI48;
  }
  else if(data.hasOwnProperty('pcWiFiMACAddress') &&
     data.pcWiFiMACAddress !== "") {
    receiverId = data.pcWiFiMACAddress.toLowerCase();
    receiverIdType = Raddec.identifiers.TYPE_EUI48;
  }

  let timeOffset = 0;
  if(data.timeZone) {
    let timeZoneElements = data.timeZone.split(':');
    let hoursOffset = Number.parseInt(timeZoneElements[0]);
    let minutesOffset = Number.parseInt(timeZoneElements[1]);

    if(hoursOffset < 0) {
      minutesOffset = -minutesOffset;
    }
    timeOffset -= ((hoursOffset * 60) + minutesOffset) * 60000;
  };

  if(Array.isArray(data.tags)) {
    data.tags.forEach(tag => {
      let isValidTag = (tag.hasOwnProperty('epc') &&
                        tag.hasOwnProperty('antennaPort') &&
                        tag.hasOwnProperty('rssi') &&
                        tag.hasOwnProperty('timeOfRead'));

      if(isValidTag) {
        let timestamp = Date.parse(tag.timeOfRead + ' GMT') + timeOffset;
        let raddec = new Raddec({
            transmitterId: tag.epc.toLowerCase(),
            transmitterIdType: Raddec.identifiers.TYPE_EPC96,
            timestamp: timestamp
        });
        raddec.addDecoding({
            receiverId: receiverId,
            receiverIdType: receiverIdType,
            rssi: Number.parseInt(tag.rssi)
        });

        raddecs.push(raddec);
      }
    });
  }

  return raddecs;
}


module.exports = CslDecoder;
