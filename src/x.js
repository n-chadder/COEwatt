const bcrypt = require('bcrypt');

let password_hash = bcrypt.hashSync('dummy', 10);

console.log(password_hash);

let verified = bcrypt.compareSync('dummy', password_hash);

console.log(verified);

password_hash = '$2b$10$2mJlS1d11WxEAqGQdk/xTOppbNqvWNkPZ1.YO3d4fCSPX2kCUzOui'

verified = bcrypt.compareSync('dummy', password_hash);

console.log(verified);