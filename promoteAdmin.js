import db from './server/config/db.js';

async function promote() {
    const email = 'admin@redemption.com'; // <-- Put the email you just registered with!
    
    try {
        const updated = await db('users')
            .where({ email })
            .update({ role: 'admin' });
            
        if (updated) {
            console.log(`✅ SUCCESS: ${email} is now an ADMIN on the live server!`);
        } else {
            console.log(`❌ ERROR: Could not find a user with email ${email}`);
        }
    } catch (err) {
        console.error('❌ DATABASE ERROR:', err.message);
    } finally {
        process.exit();
    }
}

promote();
