/* ==========================================================================
   دکتر مهرداد زهتاب — app.js
   نکته مهم: این پروژه صرفاً Front-end است.
   داده‌های زیر (sessionsData) به‌صورت Static در نظر گرفته شده‌اند تا در آینده
   بدون تغییر در ساختار HTML/CSS، از یک API واقعی (fetch به Backend) پر شوند.
   کافی‌ست تابع getSessionsData() جایگزین با یک fetch شود.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     ۱) داده‌های ساختاریافته جلسات و نوبت‌ها (به‌جای Backend)
     هر روز شامل: شناسه، نام روز، تاریخ شمسی، نوع (normal | jam),
     و آرایه‌ای از ساعت‌ها با وضعیت free/booked
  ------------------------------------------------------------------ */
  const sessionsData = [
    {
      id: "day-1",
      dayName: "سه‌شنبه",
      jalaliDate: "۸ مهر",
      type: "normal",
      slots: [
        { time: "17:00", status: "free" },
        { time: "18:00", status: "booked" },
        { time: "19:00", status: "free" }
      ]
    },
    {
      id: "day-2",
      dayName: "پنجشنبه",
      jalaliDate: "۱۰ مهر",
      type: "normal",
      slots: [
        { time: "16:00", status: "free" },
        { time: "17:00", status: "free" },
        { time: "18:00", status: "booked" }
      ]
    },
    {
      id: "day-3",
      dayName: "جمعه",
      jalaliDate: "۱۱ مهر",
      type: "jam",
      slots: [
        { time: "17:00", status: "free" },
        { time: "18:00", status: "free" }
      ]
    },
    {
      id: "day-4",
      dayName: "سه‌شنبه",
      jalaliDate: "۱۵ مهر",
      type: "normal",
      slots: [
        { time: "17:00", status: "booked" },
        { time: "18:00", status: "free" },
        { time: "19:00", status: "free" }
      ]
    },
    {
      id: "day-5",
      dayName: "پنجشنبه",
      jalaliDate: "۱۷ مهر",
      type: "normal",
      slots: [
        { time: "16:00", status: "free" },
        { time: "17:00", status: "booked" },
        { time: "18:00", status: "free" }
      ]
    },
    {
      id: "day-6",
      dayName: "جمعه",
      jalaliDate: "۱۸ مهر",
      type: "jam",
      slots: [
        { time: "17:00", status: "booked" },
        { time: "18:00", status: "free" }
      ]
    }
  ];

  const SESSION_TYPES = {
    normal: { label: "جلسه عادی", badgeClass: "badge-normal" },
    jam: { label: "جلسه جمع‌بندی", badgeClass: "badge-jam" }
  };

  const SUPPORT_PHONE = "09131039549";
  const BALE_LINK = "ble.ir/join/4cmw2wGrbw";

  /* در آینده: این تابع می‌تواند با fetch('/api/sessions') جایگزین شود */
  function getSessionsData() {
    return sessionsData;
  }

  /* ------------------------------------------------------------------
     ۲) منوی موبایل
  ------------------------------------------------------------------ */
  function initMobileMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav-links");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("open")) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  /* ------------------------------------------------------------------
     ۳) رندر تقویم نوبت‌دهی (صفحه appointments.html)
  ------------------------------------------------------------------ */
  function renderCalendar() {
    const listEl = document.getElementById("calendarList");
    if (!listEl) return; // این صفحه appointments.html نیست

    const data = getSessionsData();

    if (!data.length) {
      listEl.innerHTML = '<p class="no-slots">در حال حاضر نوبت فعالی ثبت نشده است.</p>';
      return;
    }

    listEl.innerHTML = data
      .map(function (day) {
        const meta = SESSION_TYPES[day.type];
        const isJam = day.type === "jam";

        const slotsHtml = day.slots
          .map(function (slot) {
            if (slot.status === "free") {
              return (
                '<button type="button" class="slot-btn free" ' +
                'data-day-id="' + day.id + '" data-time="' + slot.time + '" ' +
                'data-day-name="' + day.dayName + '" data-jalali="' + day.jalaliDate + '" ' +
                'data-type="' + day.type + '">' +
                '<span class="slot-time">' + slot.time + '</span>' +
                '<span class="slot-status">آزاد</span>' +
                "</button>"
              );
            }
            return (
              '<button type="button" class="slot-btn booked" disabled aria-disabled="true">' +
              '<span class="slot-time">' + slot.time + '</span>' +
              '<span class="slot-status">رزرو شده</span>' +
              "</button>"
            );
          })
          .join("");

        return (
          '<article class="day-card' + (isJam ? " is-jam" : "") + '">' +
          '<div class="day-card-head">' +
          "<div>" +
          "<h3>" + day.dayName + "</h3>" +
          '<span class="date-sub">' + day.jalaliDate + "</span>" +
          "</div>" +
          '<span class="badge ' + meta.badgeClass + '"><span class="badge-dot"></span>' + meta.label + "</span>" +
          "</div>" +
          '<div class="slot-list">' + slotsHtml + "</div>" +
          "</article>"
        );
      })
      .join("");

    listEl.querySelectorAll(".slot-btn.free").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openBookingModal({
          dayId: btn.getAttribute("data-day-id"),
          dayName: btn.getAttribute("data-day-name"),
          jalaliDate: btn.getAttribute("data-jalali"),
          time: btn.getAttribute("data-time"),
          type: btn.getAttribute("data-type")
        });
      });
    });
  }

  /* ------------------------------------------------------------------
     ۴) مودال رزرو نوبت
  ------------------------------------------------------------------ */
  function initBookingModal() {
    const overlay = document.getElementById("bookingModal");
    if (!overlay) return;

    const closeBtn = overlay.querySelector(".modal-close");
    const form = overlay.querySelector("#bookingForm");
    const successBox = overlay.querySelector(".success-state");

    closeBtn.addEventListener("click", closeBookingModal);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeBookingModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("open")) closeBookingModal();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateBookingForm(form)) return;

      // بدون Backend: فقط شبیه‌سازی ثبت موفق درخواست
      form.style.display = "none";
      successBox.classList.add("show");
    });
  }

  function openBookingModal(session) {
    const overlay = document.getElementById("bookingModal");
    if (!overlay) return;

    const form = overlay.querySelector("#bookingForm");
    const successBox = overlay.querySelector(".success-state");
    const subtitle = overlay.querySelector(".modal-sub");

    // بازگرداندن مودال به حالت اولیه (فرم)
    form.reset();
    form.style.display = "";
    successBox.classList.remove("show");
    form.querySelectorAll(".form-field").forEach(function (f) {
      f.classList.remove("invalid");
    });

    const typeMeta = SESSION_TYPES[session.type] || SESSION_TYPES.normal;

    form.querySelector('[name="sessionType"]').value = typeMeta.label;
    form.querySelector('[name="sessionDate"]').value = session.dayName + " " + session.jalaliDate;
    form.querySelector('[name="sessionTime"]').value = session.time;

    subtitle.textContent = session.dayName + " " + session.jalaliDate + " — ساعت " + session.time;

    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    const firstInput = form.querySelector('[name="fullName"]');
    if (firstInput) firstInput.focus();
  }

  function closeBookingModal() {
    const overlay = document.getElementById("bookingModal");
    if (!overlay) return;
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
  }

  function validateBookingForm(form) {
    let isValid = true;

    const nameField = form.querySelector('[name="fullName"]').closest(".form-field");
    const nameInput = nameField.querySelector("input");
    if (nameInput.value.trim().length < 3) {
      nameField.classList.add("invalid");
      isValid = false;
    } else {
      nameField.classList.remove("invalid");
    }

    const phoneField = form.querySelector('[name="mobile"]').closest(".form-field");
    const phoneInput = phoneField.querySelector("input");
    const phonePattern = /^09\d{9}$/;
    if (!phonePattern.test(phoneInput.value.trim())) {
      phoneField.classList.add("invalid");
      isValid = false;
    } else {
      phoneField.classList.remove("invalid");
    }

    return isValid;
  }

  /* دکمه‌های عمومی «رزرو نوبت» (مثلاً در Hero) که به تب اول appointments.html می‌روند */
  function initGeneralBookingLinks() {
    document.querySelectorAll("[data-scroll-target]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        const targetId = el.getAttribute("data-scroll-target");
        const target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     اجرا
  ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    renderCalendar();
    initBookingModal();
    initGeneralBookingLinks();
  });
})();
