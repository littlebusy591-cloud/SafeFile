// Checks the first bytes of a file ("magic bytes") to confirm it really is
// the type its extension claims. This stops someone renaming "virus.exe" to "virus.pdf".
const startsWith = (buffer, bytes) => bytes.every((byte, i) => buffer[i] === byte);

const checks = {
  '.pdf': (b) => startsWith(b, [0x25, 0x50, 0x44, 0x46, 0x2d]), // %PDF-
  '.png': (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  '.jpg': (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  '.jpeg': (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  '.doc': (b) => startsWith(b, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
  '.docx': (b) => startsWith(b, [0x50, 0x4b, 0x03, 0x04]), // a .docx is a ZIP file
  // A text file should not contain NUL bytes.
  '.txt': (b) => !b.subarray(0, 8000).includes(0),
};

function hasValidSignature(extension, buffer) {
  const check = checks[extension];
  return Boolean(check) && buffer.length > 0 && check(buffer);
}

module.exports = { hasValidSignature };
