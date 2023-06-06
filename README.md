barnowl-csl
===========

__barnowl-csl__ converts the decodings of _any_ ambient RAIN RFID tags by Convergence Systems Ltd. (CSL) readers into standard developer-friendly JSON that is vendor/technology/application-agnostic.

__barnowl-csl__ is a lightweight [Node.js package](https://www.npmjs.com/package/barnowl-csl) that can run on the CS463 reader itself, or on resource-constrained edge devices as well as on powerful cloud servers and anything in between.  It is included in reelyActive's [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) open source middleware suite, and can just as easily be run standalone behind a [barnowl](https://github.com/reelyactive/barnowl) instance, as detailed in the code examples below.


Getting Started
---------------

Follow our step-by-step tutorial to get started with __barnowl-csl__ or __Pareto Anywhere__ using a CS463 reader:
- [Configure a CSL CS463 Reader](https://reelyactive.github.io/diy/csl-cs463-config/)

Learn "owl" about the __raddec__ JSON data output:
-  [reelyActive Developer's Cheatsheet](https://reelyactive.github.io/diy/cheatsheet/)


Quick Start
-----------

Clone this repository, install package dependencies with `npm install`, and then from the root folder run at any time:

    npm start

__barnowl-csl__ will indiscriminately accept HTTP POSTs on localhost:3001/csl and output (flattened) __raddec__ JSON to the console.


Hello barnowl-csl!
------------------

Developing an application directly from __barnowl-csl__?  Start by pasting the code below into a file called server.js:

```javascript
const Barnowl = require('barnowl');
const BarnowlCsl = require('barnowl-csl');

let barnowl = new Barnowl({ enableMixing: true });

barnowl.addListener(BarnowlCsl, {}, BarnowlCsl.HttpListener, { port: 3001 });

barnowl.on('raddec', (raddec) => {
  console.log(raddec);
  // Trigger your application logic here
});
```

From the same folder as the server.js file, install package dependencies with the commands `npm install barnowl-csl` and `npm install barnowl`.  Then run the code with the command `node server.js` and observe the stream of radio decodings (raddec objects) output to the console:

```javascript
{
  transmitterId: "a00000000000000000001234",
  transmitterIdType: 5,
  rssiSignature: [
    {
      receiverId: "001625ffffff",
      receiverIdType: 2,
      rssi: -42,
      numberOfDecodings: 1
    }
  ],
  timestamp: 1645568542222
}
```

See the [Supported Listener Interfaces](#supported-listener-interfaces) below to adapt the code to listen for your reader(s).


Supported Listener Interfaces
-----------------------------

The following listener interfaces are supported by __barnowl-csl__.  Extend the [Hello barnowl-csl!](#hello-barnowl-csl) example above by pasting in any of the code snippets below.

### HTTP

The _recommended_ implementation is using [express](https://expressjs.com/) as follows:

```javascript
const express = require('express');
const http = require('http');

let app = express();
let server = http.createServer(app);
server.listen(3001, function() { console.log('Listening on port 3001'); });

let options = { app: app, express: express, route: "/csl" }; 
barnowl.addListener(BarnowlCsl, {}, BarnowlCsl.HttpListener, options);
```

Nonetheless, for testing purposes, __barnowl-csl__ can also create a minimal HTTP server as an alternative to express, and attempt to handle any POST it receives:

```javascript
barnowl.addListener(BarnowlCsl, {}, BarnowlCsl.HttpListener, { port: 3001 });
```

### Test

Provides a steady stream of simulated IoT Device Interface messages for testing purposes.

```javascript
barnowl.addListener(BarnowlCsl, {}, BarnowlCsl.TestListener, {});
```


Required CSL Data Format fields
-------------------------------

In order to populate the __raddec__ data structure, the following fields must be selected in the reader's Data Format:

| Field              | Label                | Corresponding raddec property   | 
|:-------------------|:---------------------|:--------------------------------|
| EthernetMACAddress | pcEthernetMACAddress | receiverId & receiverIdType     |
| WiFiMACAddress     | pcWiFiMACAddress     | receiverId & receiverIdType     |
| TimeZone           | timeZone             | timestamp                       |
| TagDataList        | tags                 | (enables the properties below)  |
| EPC                | epc                  | transmitterId & transmitterIdType |
| AntennaPort        | antennaPort          |                                 |
| RSSI               | rssi                 | rssi                            |
| TimeOfRead         | timeOfRead           | timestamp                       |

These fields are included in the "Example Tag Upload to Cloud Server Data Format" which is preloaded on the reader.


Is that owl you can do?
-----------------------

While __barnowl-csl__ may suffice standalone for simple real-time applications, its functionality can be greatly extended with the following software packages:
- [advlib-epc](https://github.com/reelyactive/advlib-epc) to decode the Electronic Product Code (EPC) into JSON
- [barnowl](https://github.com/reelyactive/barnowl) to combine parallel streams of RF decoding data in a technology-and-vendor-agnostic way

These packages and more are bundled together as the [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere) open source middleware suite, which includes a variety of __barnowl-x__ listeners, APIs and interactive web apps.


Contributing
------------

Discover [how to contribute](CONTRIBUTING.md) to this open source project which upholds a standard [code of conduct](CODE_OF_CONDUCT.md).


Security
--------

Consult our [security policy](SECURITY.md) for best practices using this open source software and to report vulnerabilities.

[![Known Vulnerabilities](https://snyk.io/test/github/reelyactive/barnowl-csl/badge.svg)](https://snyk.io/test/github/reelyactive/barnowl-csl)


License
-------

MIT License

Copyright (c) 2023 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
