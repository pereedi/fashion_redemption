
import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:5000/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test' })
  });
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Body:', text.substring(0, 500));
}

test();
