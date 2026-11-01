/* auth-login.js — KlaiBaan: หน้าเข้าสู่ระบบ (ต้องโหลดหลัง auth-core.js)
 * ส่วนของไฟล์นี้: หน้าจอ loginView, login() ตรวจอีเมล+รหัสผ่าน, ล็อกชั่วคราวเมื่อใส่ผิดหลายครั้ง, doLogin()
 *
 * ข้อความ error ตั้งใจให้เป็นข้อความเดียวกันไม่ว่าผิดที่อีเมลหรือรหัสผ่าน
 * เพื่อไม่บอกคนนอกว่าอีเมลนั้นมีบัญชีอยู่ (ป้องกันการเดาบัญชี)
 * การล็อกอยู่ในหน่วยความจำ รีเฟรชหน้าแล้วหาย — ระบบจริงต้องทำที่ฝั่ง server
 */
(function () {
  'use strict';
  var K = window.KBAuth;
  if (!K || !K._) { console.error('auth-login.js: ต้องโหลด auth-core.js ก่อน'); return; }
  var _ = K._;

  var MAX_FAILS = 5, LOCK_MS = 30000;
  var fails = 0, lockUntil = 0;

  // ---------- เข้าสู่ระบบ ----------
  function login(email, pw) {
    var wait = Math.ceil((lockUntil - Date.now()) / 1000);
    if (wait > 0) return { ok: false, error: 'ใส่ผิดหลายครั้ง ลองใหม่อีก ' + wait + ' วินาที' };
    email = _.normEmail(email);
    if (!email || !pw) return { ok: false, error: 'กรอกอีเมลและรหัสผ่านก่อน' };
    var u = _.readUsers().filter(function (x) { return x.email === email; })[0];
    if (!u || u.hash !== _.hashPw(pw, u.salt)) {
      fails++;
      if (fails >= MAX_FAILS) { fails = 0; lockUntil = Date.now() + LOCK_MS; }
      return { ok: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
    }
    fails = 0; _.setSession(u.id);
    return { ok: true, user: _.publicUser(u) };
  }

  // ---------- หน้าจอ ----------
  function loginView() {
    return _.shell('เข้าสู่ระบบ',
      '<p class="au-sub">เข้าสู่ระบบเพื่อโพสต์ คอมเมนต์ และรายงานโพสต์ ส่วนการอ่านโพสต์ไม่ต้องเข้าสู่ระบบ</p>' +
      _.field('au-email', 'อีเมล', 'email', 'you@example.com', 'email') +
      _.field('au-pw', 'รหัสผ่าน', 'password', 'อย่างน้อย 8 ตัวอักษร', 'current-password') +
      '<div class="au-err" id="au-err" role="alert" aria-live="polite"></div>' +
      '<button class="primary" data-auth="dologin">เข้าสู่ระบบ</button>' +
      '<button class="au-link" data-go="/signup">ยังไม่มีบัญชี? สมัครสมาชิก</button>' +
      '<p class="au-note">ต้นแบบนี้เก็บบัญชีไว้ในเบราว์เซอร์เครื่องนี้เท่านั้น ไม่มีเซิร์ฟเวอร์</p>');
  }

  function doLogin() {
    var r = login(_.val('au-email'), _.val('au-pw'));
    if (!r.ok) return _.showErr(r.error);
    _.done(r.user);
  }

  K.loginView = loginView;
  K.login = login;
  K.actions.dologin = doLogin;
})();
