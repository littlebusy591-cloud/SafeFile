const config = require('../../config/env');

const drivers = {
  local: () => require('./localStorage'),
  s3: () => require('./s3Storage'),
};

const load = drivers[config.storageDriver];

if (!load) {
  console.error(
    `\nUnknown STORAGE_DRIVER "${config.storageDriver}". Use: ${Object.keys(drivers).join(', ')}\n`
  );
  process.exit(1);
}

module.exports = load();
