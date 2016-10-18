const fs = require('fs');
const path = require('path');
const tls = require('tls');

const defaultCAs = [];

function applyWithRootCAs(func, options, args) {
  var i;
  var ca = options.ca;
  if (options.ca) {
    delete options.ca;
  }
  var obj = func.apply(null, args);
  var cas = defaultCAs;
  if (ca) {
    cas = defaultCAs.concat(ca);
  }
  for (i = 0; i < cas.length; ++i) {
    obj.context.addCACert(cas[i]);
  }
  return obj;
}

const createSecureContext = tls.createSecureContext;
if (createSecureContext) {
  tls.createSecureContext = function(options) {
    return applyWithRootCAs(createSecureContext, options, arguments);
  };
} else {
  const crypto = require('crypto');
  const createCredentials = crypto.createCredentials;
  crypto.createCredentials = function(options) {
    return applyWithRootCAs(createCredentials, options, arguments);
  };
}

function addDefaultCA(file) {
  try {
    var cert;
    var content = fs.readFileSync(file, {encoding: 'ascii'}).trim();
    if (content.indexOf('-----BEGIN CERTIFICATE-----') === 0) {
      var certs = content.split('-----END CERTIFICATE-----');
      for (var i = 0; i < certs.length; ++i) {
        cert = certs[i].trim();
        if (cert.length > 0) {
          defaultCAs.push(certs[i].trim() + '\n-----END CERTIFICATE-----\n');
        }
      }
    }
  } catch (e) {
    if (e.code !== 'ENOENT') {
      console.log('failed reading file ' + file + ': ' + e.message);
    }
  }
}

exports.addCAs = function(dirs) {
  if (!dirs) {
    return;
  }

  if (typeof dirs === 'string') {
    dirs = dirs.split(',').map(function(dir) {
      return dir.trim();
    });
  }

  var files, stat, file, i ,j;
  for (i = 0; i < dirs.length; ++i) {
    try {
      stat = fs.statSync(dirs[i]);
      if (stat.isDirectory()) {
        files = fs.readdirSync(dirs[i]);
        for (j = 0; j < files.length; ++j) {
          file = path.resolve(dirs[i], files[j]);
          try {
            stat = fs.statSync(file);
            if (stat.isFile()) {
              addDefaultCA(file);
            }
          } catch (e) {
            if (e.code !== 'ENOENT') {
              console.log('failed reading ' + file + ': ' + e.message);
            }
          }
        }
      } else {
        addDefaultCA(dirs[i]);
      }
    } catch (e) {
      if (e.code !== 'ENOENT') {
        console.log('failed reading ' + dir[i] + ': ' + e.message);
      }
    }
  }
};

const defaultCALocations = [
  "/etc/ssl/ca-node.pem"
];

exports.addCAs(defaultCALocations);
