// Makes user text safe to use inside a regular expression (for the title search).
module.exports = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
