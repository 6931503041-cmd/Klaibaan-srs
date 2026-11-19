/* logout.js — KlaiBaan: ข้อ 4 ออกจากระบบ + ชื่อผู้ใช้ในหน้าโปรไฟล์ (ต้องโหลดหลัง auth-core.js)
 * ส่วนของไฟล์นี้:
 *   K.currentUser()      คืนผู้ใช้ที่ล็อกอินอยู่ (publicUser) หรือ null ถ้ายังไม่ล็อกอิน
 *   K.displayName()      ชื่อที่แสดง (ใช้แทน ME.name ในหน้าโปรไฟล์)
 *   K.logout()           ล้าง session แล้วคืน true
 *   K.profileCardHtml()  HTML ส่วนหัวการ์ดโปรไฟล์: ไอคอน + ชื่อผู้ใช้ + อีเมล + ปุ่มออกจากระบบ
 *                        (ถ้ายังไม่ล็อกอิน จะแสดงปุ่ม "เข้าสู่ระบบ" แทน)
 *
 * หมายเหตุ: ไม่แสดง user id ที่ไหนเลย (NFR-5) แสดงแค่ชื่อกับอีเมลของตัวเองให้เจ้าของบัญชีเห็นในหน้าโปรไฟล์
 * ฟังก์ชันที่ดึงมาจาก auth-core.js (_.getSession ฯลฯ) ถ้าชื่อจริงต่างจากที่เดา ให้แก้ที่ฟังก์ชัน findSessionFn / clearSession ด้านล่างจุดเดียว
 */
(function () {
  'use strict';
  var K = window.KBAuth;
  if (!K || !K._) { console.error('logout.js: ต้องโหลด auth-core.js ก่อน'); return; }
  var _ = K._;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------- ตัวเชื่อมกับ auth-core.js (แก้ตรงนี้ที่เดียวถ้าชื่อฟังก์ชันไม่ตรง) ----------
  function findSessionFn() {
    var names = ['currentUser', 'getCurrentUser', 'getUser', 'getSession', 'session', 'sessionUser', 'getSessionUser', 'readSession', 'me', 'whoami'];
    for (var i = 0; i < names.length; i++) {
      var f = _[names[i]] || K[names[i]];
      if (typeof f === 'function' && f !== currentUser) return f;
    }
    return null;
  }
  function clearSession() {
    var names = ['clearSession', 'removeSession', 'endSession', 'logout', 'signOut'];
    for (var i = 0; i < names.length; i++) if (typeof _[names[i]] === 'function') return _[names[i]]();
    return _.setSession(null);          // สำรอง: setSession รับ user id ตอน login จึงส่ง null เพื่อล้าง
  }

  // ---------- ผู้ใช้ปัจจุบัน ----------
  function currentUser() {
    var fn = findSessionFn(), r;
    if (!fn) return null;
    try { r = fn(); } catch (e) { return null; }
    if (!r) return null;
    if (typeof r === 'object') return r.email && r.hash === undefined ? r : _.publicUser ? _.publicUser(r) : r;
    // ได้เป็น id → หาผู้ใช้จากรายชื่อ
    var u = _.readUsers().filter(function (x) { return x.id === r; })[0];
    return u ? (_.publicUser ? _.publicUser(u) : u) : null;
  }

  function displayName() {
    var u = currentUser();
    if (!u) return '';
    return u.name || u.displayName || u.display || u.nickname || String(u.email || '').split('@')[0];
  }

  // ---------- ออกจากระบบ ----------
  function logout() {
    try { clearSession(); } catch (e) { console.error('logout ไม่สำเร็จ', e); return false; }
    return !currentUser();
  }

  // ---------- ส่วนหัวการ์ดโปรไฟล์ ----------
  // iconHtml = ไอคอนรูปคน (ส่ง ic(P.user, ...) จากหน้าหลักมาให้ เพื่อให้หน้าตาตรงกับของเดิม)
  function profileCardHtml(iconHtml) {
    var u = currentUser();
    var head = '<div class="big">' + (iconHtml || '') + '</div>';
    if (!u) {
      return head +
        '<div class="nm" style="font-size:16px;font-weight:800;margin-top:12px">ยังไม่ได้เข้าสู่ระบบ</div>' +
        '<small style="color:var(--muted);font-size:11.5px;margin-top:3px">เข้าสู่ระบบเพื่อโพสต์ คอมเมนต์ และรายงาน</small>' +
        '<button class="primary au-prof-btn" data-go="/login">เข้าสู่ระบบ</button>';
    }
    return head +
      '<div class="nm" id="au-prof-name" style="font-size:16px;font-weight:800;margin-top:12px">' + esc(displayName()) + '</div>' +
      (u.email ? '<small id="au-prof-email" style="color:var(--muted);font-size:11.5px;margin-top:3px">' + esc(u.email) + '</small>' : '') +
      '<button class="au-logout" data-act="logout" aria-label="ออกจากระบบ">ออกจากระบบ</button>';
  }

  K.currentUser = currentUser;
  K.displayName = displayName;
  K.logout = logout;
  K.profileCardHtml = profileCardHtml;
  if (K.actions) K.actions.logout = function () { if (logout()) _.go ? _.go('/login') : (location.hash = '#/login'); };
})();
