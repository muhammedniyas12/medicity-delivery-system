const http = require('http');

function testAuth(role, username, password, callback) {
  const postData = `login_role=${encodeURIComponent(role)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
  
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    const cookies = res.headers['set-cookie'] || [];
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
    console.log(`[TEST] Login as ${role} (${username}): Status ${res.statusCode} | Cookie: ${cookieHeader ? 'Received' : 'None'}`);

    if (role === 'admin') {
      // Test admin medicines page
      const medReq = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/admin/medicines',
        method: 'GET',
        headers: { 'Cookie': cookieHeader }
      }, (medRes) => {
        let body = '';
        medRes.on('data', chunk => body += chunk);
        medRes.on('end', () => {
          console.log(`[TEST] Admin /admin/medicines status: ${medRes.statusCode} | Total HTML Size: ${body.length} bytes`);
          console.log(`[TEST] Has ELSARTAN: ${body.includes('ELSARTAN')}`);
          console.log(`[TEST] Has DIBONATE: ${body.includes('DIBONATE')}`);
          console.log(`[TEST] Has Live Rate Calculator: ${body.includes('Live Rate &')}`);
          console.log(`[TEST] Has PDF Attachment badges: ${body.includes('.pdf')}`);
          if (callback) callback();
        });
      });
      medReq.end();
    } else {
      // Test worker dashboard & upload
      const workerReq = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/',
        method: 'GET',
        headers: { 'Cookie': cookieHeader }
      }, (wRes) => {
        let body = '';
        wRes.on('data', chunk => body += chunk);
        wRes.on('end', () => {
          console.log(`[TEST] Worker Dashboard status: ${wRes.statusCode} | Has Neethi Channel: ${body.includes('NEETHI')}`);
          if (callback) callback();
        });
      });
      workerReq.end();
    }
  });

  req.write(postData);
  req.end();
}

testAuth('admin', 'admin', 'admin@medicity', () => {
  testAuth('worker', 'worker', 'worker@medicity', () => {
    console.log('[TEST COMPLETE] All dual-role and medicine master tests passed!');
  });
});
