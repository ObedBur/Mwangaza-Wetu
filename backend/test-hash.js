const bcrypt = require('bcrypt');
const hash = '$2b$10$4hWzYMbE3BsYFCUP/60nbu6uy.edLgIipT1O87PJLrFwSGV41QzMK';
const pin = '556677';

bcrypt.compare(pin, hash).then(res => {
    console.log('Match:', res);
});
