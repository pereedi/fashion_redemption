
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testRegister() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Diagnostic Test',
        email: 'test' + Date.now() + '@example.com',
        password: 'password123'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testRegister();
