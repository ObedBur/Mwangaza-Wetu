const bcrypt = require('bcrypt');
const hash = '$2b$10$346ZV8dxG3D9In2Q0tl6.OYVdUnpRNpKCeovl3Hsdqt68gosmC5te';
const pin = '556677';

bcrypt.compare(pin, hash).then(res => {
    console.log('Match:', res);
});
