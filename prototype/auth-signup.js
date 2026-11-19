/* auth-signup.js — KlaiBaan: หน้าสมัครสมาชิก (ต้องโหลดหลัง auth-core.js)
 * ส่วนของไฟล์นี้: หน้าจอ signupView, ตรวจข้อมูล (อีเมล/ชื่อ/รหัสผ่าน), register(), doSignup()
 */
(function () {
  'use strict';
  var K = window.KBAuth;
  if (!K || !K._) { console.error('auth-signup.js: ต้องโหลด auth-core.js ก่อน'); return; }
  var _ = K._;

  // ---------- ตรวจข้อมูล (คืนข้อความ error หรือ '' ถ้าผ่าน) ----------
  function vEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? '' : 'รูปแบบอีเมลไม่ถูกต้อง'; }
  function vName(n) { n = String(n || '').trim(); return n.length >= 2 && n.length <= 20 ? '' : 'ชื่อที่แสดงต้องมี 2–20 ตัวอักษร'; }
  function vPw(p) { return String(p || '').length >= 8 ? '' : 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'; }

  // ---------- สมัครสมาชิก ----------
  function register(email, name, pw, pw2) {
    email = _.normEmail(email);
    var err = vEmail(email) || vName(name) || vPw(pw) || (pw !== pw2 ? 'รหัสผ่านทั้งสองช่องไม่ตรงกัน' : '');
    if (err) return { ok: false, error: err };
    var users = _.readUsers();
    if (users.some(function (u) { return u.email === email; })) return { ok: false, error: 'อีเมลนี้ถูกใช้สมัครแล้ว' };
    var salt = _.randomId();
    var u = { id: 'u' + _.randomId(), email: email, name: String(name).trim(), salt: salt, hash: _.hashPw(pw, salt), at: Date.now() };
    users.push(u); _.writeUsers(users); _.setSession(u.id);
    return { ok: true, user: _.publicUser(u) };
  }

  // ---------- หน้าจอ ----------
  function signupView() {
    return _.shell('สมัครสมาชิก',
      '<p class="au-sub">ใช้อีเมลสมัครเพื่อป้องกันสแปม คุณยังเลือกโพสต์แบบไม่ระบุตัวตนได้ ชื่อที่แสดงจะไม่ถูกเปิดเผยในโพสต์นั้น</p>' +
      _.field('au-email', 'อีเมล', 'email', 'you@example.com', 'email') +
      _.field('au-name', 'ชื่อที่แสดง (2–20 ตัวอักษร)', 'text', 'เช่น น้องใบไม้', 'nickname') +
      _.field('au-pw', 'รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)', 'password', 'ตั้งรหัสผ่าน', 'new-password') +
      _.field('au-pw2', 'ยืนยันรหัสผ่าน', 'password', 'พิมพ์รหัสผ่านอีกครั้ง', 'new-password') +
      '<div class="au-err" id="au-err" role="alert" aria-live="polite"></div>' +
      '<button class="primary" data-auth="dosignup">สมัครสมาชิก</button>' +
      '<button class="au-link" data-go="/login">มีบัญชีอยู่แล้ว? เข้าสู่ระบบ</button>' +
      '<p class="au-note">ต้นแบบนี้เก็บบัญชีไว้ในเบราว์เซอร์เครื่องนี้เท่านั้น ไม่มีเซิร์ฟเวอร์</p>');
  }

  function doSignup() {
    var r = register(_.val('au-email'), _.val('au-name'), _.val('au-pw'), _.val('au-pw2'));
    if (!r.ok) return _.showErr(r.error);
    _.done(r.user, 'สมัครสมาชิกสำเร็จ ยินดีต้อนรับ ' + r.user.name);
  }

  K.signupView = signupView;
  K.register = register;
  K.actions.dosignup = doSignup;
})();
