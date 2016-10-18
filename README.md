# syswide-cas

Enable node to use custom certificate authorities in conjunction with the bundled root CAs.

Node does not support system-wide installed trusted certificate authorities. It is only possible to specify a custom 
CA via the `ca` option in the `tls` and `https` modules, or fallback to using the bundled list of root CAs that 
node is compiled with.

This module enables loading custom CAs located in the file /etc/ssl/ca-node.pem _in conjunction with_ 
the node bundled root CAs.

## Installation

```
npm install --save syswide-cas
```

## Usage

Add `require('syswide-cas')` as soon as possible as it affects all later TLS calls. 

```javascript
// "require('syswide-cas')" immediatley loads CAs from the file /etc/ssl/ca-node.pem if it exists
const syswidecas = require('syswide-cas');

// optionally load all files from a custom directory
syswidecas.addCAs('/my/custom/path/to/certs/dir');

// or multiple directories
syswidecas.addCAs(['/my/custom/path/to/certs/dir1', '/my/other/path/to/certs/dir2']);

// optionally load a file directly
syswidecas.addCAs('/my/custom/path/to/cert.pem');

// or multiple files
syswidecas.addCAs(['/my/custom/path/to/cert1.pem', '/my/other/path/to/cert2.pem']);


const https = require('https');
https.get('https://my.custom.domain.com/with/self/signed/cert');

```

## License

Copyright 2016 Capriza. Code released under the [MIT license](LICENSE.md)

