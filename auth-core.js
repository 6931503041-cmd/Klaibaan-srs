/* auth-core.js — KlaiBaan: ส่วนกลางของระบบบัญชีผู้ใช้ (ต้องโหลดเป็นไฟล์แรก)
 *
 * ไฟล์ในชุดนี้ (โหลดตามลำดับใน "Klai-baan draft v.4.html"):
 *   1) auth-core.js    ← ไฟล์นี้: ที่เก็บข้อมูล, hash, session, logout, ชิป/โปรไฟล์, ตัวช่วยสร้างฟอร์ม, จัดการเหตุการณ์
 *   2) auth-signup.js  ← หน้าสมัครสมาชิก + ตรวจข้อมูล + register()
 *   3) auth-login.js   ← หน้าเข้าสู่ระบบ + login() + ล็อกเมื่อใส่ผิดหลายครั้ง
 *
 * ไฟล์ 2 และ 3 ต่อเข้ามาทาง window.KBAuth จึงแก้แยกกันได้โดยไม่ชนกัน
 * ถ้าไฟล์ใดยังไม่ถูกโหลด หน้านั้นจะแสดงข้อความ "ยังไม่พร้อมใช้งาน" แทนการพัง
 *
 * หมายเหตุ (ต้องบอกอาจารย์ตอน demo): นี่คือ prototype ไม่มี backend
 *  - บัญชีเก็บใน localStorage ของเบราว์เซอร์เครื่องนี้เท่านั้น
 *  - รหัสผ่านไม่ถูกเก็บตรง ๆ แต่เก็บเป็น hash + salt ด้วยฟังก์ชันง่าย ๆ (cyrb53)
 *    ซึ่ง "ไม่ปลอดภัยพอสำหรับระบบจริง" ระบบจริงต้อง hash ที่ฝั่ง server ด้วย bcrypt/argon2
 */
(function () {
  'use strict';

  var USERS_KEY = 'klaibaan-users-v1';
  var SESSION_KEY = 'klaibaan-session-v1';
  var ctx = null;
  var Auth = { next: '/', actions: {}, _: {} };

  // ---------- ที่เก็บข้อมูล ----------
  function readUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch (e) { return []; } }
  function writeUsers(u) { try { localStorage.setItem(USERS_KEY, JSON.stringify(u)); } catch (e) {} }
  function setSession(id) { try { localStorage.setItem(SESSION_KEY, id); } catch (e) {} }
  function clearSession() { try { localStorage.removeItem(SESSION_KEY); } catch (e) {} }

  function cyrb53(str) {
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (var i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  }
  function hashPw(pw, salt) { return cyrb53(salt + ':' + pw); }
  function randomId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function normEmail(e) { return String(e || '').trim().toLowerCase(); }
  function publicUser(u) { return { id: u.id, email: u.email, name: u.name }; }   // ไม่ส่ง hash/salt ออกไป

  // ---------- ผู้ใช้ปัจจุบัน / ออกจากระบบ ----------
  function current() {
    var id = null;
    try { id = localStorage.getItem(SESSION_KEY); } catch (e) {}
    if (!id) return null;
    var u = readUsers().filter(function (x) { return x.id === id; })[0];
    if (!u) { clearSession(); return null; }
    return publicUser(u);
  }
  function logout() {
    clearSession();
    ctx.notify('ออกจากระบบแล้ว');
    ctx.go('/');
  }

  // ---------- ตัวช่วยสร้างหน้าจอ (ใช้ร่วมกับ signup / login) ----------
  function field(id, label, type, ph, ac) {
    return '<label class="lbl" for="' + id + '">' + label + '</label>' +
      '<div class="au-wrap"><input id="' + id + '" class="au-in" type="' + type + '" placeholder="' + ph + '" autocomplete="' + ac + '">' +
      (type === 'password' ? '<button type="button" class="au-eye" data-auth="toggle" aria-label="แสดงหรือซ่อนรหัสผ่าน">แสดง</button>' : '') + '</div>';
  }
  function shell(title, body) {
    return '<div class="phone"><div class="hdr"><button class="iconbtn ring" data-back aria-label="กลับ">' +
      ctx.ic(ctx.P.back, { s: 16, stroke: '#B9754A' }) + '</button><div class="title">' + title + '</div></div>' +
      '<div class="scroll">' + body + '</div></div>';
  }
  function val(id) { var e = document.getElementById(id); return e ? e.value : ''; }
  function showErr(m) { var e = document.getElementById('au-err'); if (e) e.textContent = m; }
  function done(u, msg) {                       // สำเร็จแล้วกลับไปหน้าที่ผู้ใช้ตั้งใจจะไป
    var n = Auth.next || '/'; Auth.next = '/';
    ctx.notify(msg || ('ยินดีต้อนรับ ' + u.name));
    ctx.go(n);
  }

  // หน้าชั่วคราว ถ้าไฟล์ของหน้านั้นยังไม่ถูกโหลด
  function stub(title, file) {
    return function () { return shell(title, '<p class="au-sub">หน้านี้ยังไม่พร้อมใช้งาน (ยังไม่ได้โหลด ' + file + ')</p>'); };
  }
  Auth.loginView = stub('เข้าสู่ระบบ', 'auth-login.js');
  Auth.signupView = stub('สมัครสมาชิก', 'auth-signup.js');

  // ---------- ชิปมุมขวาบนของหน้าแรก / ส่วนในหน้าโปรไฟล์ ----------
  Auth.hdrChip = function () {
    var u = current();
    return u ? '<button class="au-chip on" data-go="/profile" aria-label="โปรไฟล์ของฉัน">' + ctx.esc(u.name) + '</button>'
             : '<button class="au-chip" data-go="/login">เข้าสู่ระบบ</button>';
  };
  Auth.profileLine = function () { var u = current(); return u ? ctx.esc(u.email) : 'ยังไม่ได้เข้าสู่ระบบ'; };
  Auth.profileButtons = function () {
    return current()
      ? '<button class="au-out" data-auth="logout">ออกจากระบบ</button>'
      : '<button class="primary" data-go="/login" style="margin-top:10px">เข้าสู่ระบบ</button><button class="au-link" data-go="/signup">สมัครสมาชิก</button>';
  };

  // ---------- เริ่มทำงาน ----------
  Auth.init = function (c) {
    ctx = c;
    var css = document.createElement('style');
    css.textContent =
      '.au-sub{margin:4px 0 6px;font-size:13px;line-height:1.55;color:var(--brown)}' +
      '.au-wrap{position:relative}' +
      '.au-in{width:100%;height:46px;background:#fff;border:1.5px solid #FFE3C7;border-radius:14px;padding:0 14px;font-size:14px;color:var(--ink);outline:0}' +
      '.au-in:focus{border-color:var(--accent)}' +
      '.au-eye{position:absolute;right:6px;top:50%;transform:translateY(-50%);padding:8px 10px;font-size:12px;font-weight:700;color:var(--accent-dark)}' +
      '.au-err{min-height:20px;margin:10px 0 6px;font-size:12.5px;font-weight:700;color:#C4622E}' +
      '.au-link{display:block;width:100%;padding:14px 0;text-align:center;font-size:13.5px;font-weight:700;color:var(--accent-dark)}' +
      '.au-note{margin:6px 0 0;text-align:center;font-size:11px;color:var(--muted)}' +
      '.au-chip{flex:none;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:1.5px solid var(--accent);border-radius:16px;padding:6px 14px;font-size:12.5px;font-weight:700;color:var(--accent-dark);background:#fff}' +
      '.au-chip.on{background:var(--accent);color:#fff}' +
      '.au-out{display:block;width:100%;height:44px;margin-top:14px;border:1.5px solid #FFE3C7;border-radius:22px;background:#fff;color:#C4622E;font-size:14px;font-weight:800;text-align:center}' +
      '.au-logout{display:inline-block;margin-top:14px;padding:9px 22px;border:1.5px solid #FFE3C7;border-radius:20px;background:#fff;color:#C4622E;font-size:13.5px;font-weight:800}' +
      '.au-prof-btn{margin-top:14px;width:100%}';
    document.head.appendChild(css);

    ctx.app.addEventListener('click', function (e) {
      var b = e.target.closest('[data-auth]');
      if (!b) return;
      var a = b.getAttribute('data-auth');
      if (a === 'logout') logout();
      else if (a === 'toggle') {
        var inp = b.previousElementSibling; if (!inp) return;
        var show = inp.type === 'password';
        inp.type = show ? 'text' : 'password'; b.textContent = show ? 'ซ่อน' : 'แสดง';
      }
      else if (Auth.actions[a]) Auth.actions[a]();     // dologin / dosignup มาจากไฟล์ของแต่ละหน้า
    });
    ctx.app.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || !e.target.classList || !e.target.classList.contains('au-in')) return;
      e.preventDefault();
      var btn = ctx.app.querySelector('[data-auth="dologin"],[data-auth="dosignup"]');
      if (btn) btn.click();
    });
  };

  Auth.current = current;
  Auth._ = {
    readUsers: readUsers, writeUsers: writeUsers, setSession: setSession,
    hashPw: hashPw, randomId: randomId, normEmail: normEmail, publicUser: publicUser,
    field: field, shell: shell, val: val, showErr: showErr, done: done,
    currentUser: current, clearSession: clearSession      // logout.js เรียกใช้สองตัวนี้
  };
  window.KBAuth = Auth;
})();
