import { env } from "../config/env.js";
import { Booking } from "../models/booking.model.js";
import { Setting } from "../models/setting.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { assertDayFree, takenDays } from "../utils/booking-days.js";
import { escapeHtml, mailConfigured, sendMail } from "../utils/mailer.js";

const formatDay = (isoDay) =>
  new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", { dateStyle: "full", timeZone: "UTC" }).format(
    new Date(`${isoDay}T00:00:00Z`),
  );

const wrap = (body) => `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.9;color:#071b45">${body}</div>`;

/**
 * Public. Saves the meeting request, then emails the visitor a confirmation and
 * the agency a notification. If an email cannot be sent the booking is removed,
 * so the visitor is told the truth and can try again.
 */
export const createBooking = asyncHandler(async (req, res) => {
  if (!mailConfigured && env.nodeEnv === "production") throw new ApiError(503, "خدمة البريد غير مفعّلة حالياً");

  const { email, phone, date } = req.body;
  const settings = await Setting.findOne({ singleton: "site" });
  const owner = env.mail.notify || settings?.email;
  if (!owner) throw new ApiError(503, "لم يتم تحديد بريد استقبال الحجوزات");

  const day = new Date(`${date}T00:00:00Z`);
  await assertDayFree(day);

  const booking = await Booking.create({ email, phone, date: day });
  const dayText = formatDay(date);
  const brand = settings?.name || "واجهة";

  const results = await Promise.allSettled([
    sendMail({
      to: email,
      subject: `تأكيد طلب موعد مع ${brand}`,
      text: `تم استلام طلبك لموعد يوم ${dayText}. سنتواصل معك على هذا البريد لتأكيد الوقت.`,
      html: wrap(
        `<h2>شكراً لك!</h2><p>تم استلام طلبك لموعد يوم <strong>${escapeHtml(dayText)}</strong>.</p><p>سنتواصل معك على هذا البريد لتأكيد الوقت.</p><p>${escapeHtml(brand)}</p>`,
      ),
    }),
    sendMail({
      to: owner,
      subject: `طلب موعد جديد: ${dayText}`,
      text: `طلب موعد جديد\nاليوم: ${dayText}\nالبريد: ${email}\nالجوال: ${phone}`,
      html: wrap(
        `<h2>طلب موعد جديد</h2><p>اليوم: <strong>${escapeHtml(dayText)}</strong></p><p>البريد: <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p><p>الجوال: <a href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}" dir="ltr">${escapeHtml(phone)}</a></p>`,
      ),
    }),
  ]);

  const failed = results.filter((result) => result.status === "rejected");
  if (failed.length > 0) {
    await Booking.findByIdAndDelete(booking._id);
    for (const result of failed) console.error("Booking email failed:", result.reason);
    throw new ApiError(502, "تعذّر إرسال رسالة التأكيد، حاول مرة أخرى");
  }

  res.status(201).json({ success: true, data: { id: booking.id, date, email, phone } });
});

/** Public. The upcoming days that are already booked, so the form can grey them out. */
export const listTakenDays = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await takenDays() });
});
