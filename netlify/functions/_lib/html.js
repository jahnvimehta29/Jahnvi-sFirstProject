function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function page(title, bodyHtml) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  body{font-family:sans-serif;background:#fdf8f2;color:#241512;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;}
  .card{background:#fff;padding:40px;border-radius:14px;box-shadow:0 10px 30px rgba(36,21,18,.12);max-width:420px;text-align:center;}
  h1{color:#7a1f2b;font-size:1.4rem;margin-top:0;}
  button{background:#7a1f2b;color:#fff;border:none;padding:14px 28px;border-radius:50px;font-weight:600;font-size:1rem;cursor:pointer;margin-top:20px;}
  button.decline{background:#fff;color:#7a1f2b;border:2px solid #7a1f2b;}
</style></head><body><div class="card">${bodyHtml}</div></body></html>`;
}

module.exports = { escapeHtml, page };
