// server/temp_bcrypt_test.js
const bcrypt = require('bcryptjs');

const testCompare = async () => {
    const plainPassword = 'password123'; // The password we expect to match
    const hashedPasswordFromDB = '$2b$10$cbSz3bCgh2wUjjmmBccrh.I4ogGYcl0iTqO8xbiGuPBK/NQcb3EYa'; // PASTE THE HASHED PASSWORD YOU COPIED HERE

    try {
        const isMatch = await bcrypt.compare(plainPassword, hashedPasswordFromDB);
        if (isMatch) {
            console.log('SUCCESS: bcrypt.compare works! The plain password matches the hash.');
        } else {
            console.log('FAILURE: bcrypt.compare returns FALSE. The plain password does NOT match the hash.');
            console.log('Plain Password Entered:', plainPassword);
            console.log('Hashed Password from DB:', hashedPasswordFromDB);
        }
    } catch (error) {
        console.error('An error occurred during bcrypt.compare:', error);
    }
};

testCompare();