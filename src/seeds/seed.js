/**
 * Loads v2's hardcoded copy (landing.constant.ts, site.constant.ts,
 * dashboard-data.constant.ts) into MongoDB and creates the first admin.
 * Safe to re-run: it wipes the content collections first, keeps admins.
 */
import mongoose from "mongoose";

import { connectDb } from "../config/db.js";
import { env } from "../config/env.js";
import { Admin } from "../models/admin.model.js";
import { Content } from "../models/content.model.js";
import { Plan } from "../models/plan.model.js";
import { Project } from "../models/project.model.js";
import { Section } from "../models/section.model.js";
import { Setting } from "../models/setting.model.js";
import { User } from "../models/user.model.js";
import { hashPassword } from "../utils/hash.js";

const WHATSAPP = process.env.WHATSAPP_URL ?? "https://wa.me/966500000000";

const SETTINGS = {
  singleton: "site",
  name: "واجهة",
  wordmark: "WAJHA",
  tagline: "نحو واجهة رقمية تفتح لك الأبواب.",
  description:
    "واجهة رقمية وبروفايل بهوية واحدة، يجعلان قرار التعامل معك محسوماً من أول نظرة. تصميم مواقع وبروفايلات شركات باحترافية عالية.",
  phone: "+966 50 123 4567",
  email: "hello@wajha.sa",
  whatsapp: WHATSAPP,
  address: "الرياض، المملكة العربية السعودية",
  foundedYear: 2025,
};

const PLANS = [
  {
    kind: "package",
    title: "موقع احترافي + بروفايل شركة",
    price: 1200,
    priceBefore: 2000,
    badge: "عرض خاص",
    cta: "اطلب الباقة الآن",
    benefits: [
      "تصميم وتطوير موقع احترافي متجاوب مع جميع الأجهزة",
      "بروفايل شركة احترافي جاهز للعرض والطباعة PDF",
      "تصميم متناسق يعكس هوية شركتك",
      "تحسين الموقع لمحركات البحث SEO",
      "سرعة وأداء وتجربة استخدام مميزة",
      "دعم فني بعد التسليم",
    ],
    image: { src: "/assets/images/package-mockup.png", alt: "موقع احترافي وبروفايل شركة من واجهة", width: 1672, height: 941 },
  },
  {
    kind: "website",
    title: "إنشاء موقع إلكتروني",
    price: 1500,
    cta: "اطلب خدمة الموقع",
    benefits: ["تصميم متجاوب مع جميع الأجهزة", "تهيئة لمحركات البحث SEO", "دعم فني بعد التسليم"],
    image: { src: "/assets/images/website-mockup.png", alt: "موقع إلكتروني احترافي من واجهة", width: 1448, height: 1086 },
  },
  {
    kind: "profile",
    title: "إنشاء بروفايل شركة",
    price: 500,
    cta: "اطلب خدمة البروفايل",
    benefits: ["تصميم حديث يعكس الهوية", "نسخة PDF جاهزة للطباعة", "مراجعتان مجاناً"],
    image: { src: "/assets/images/profile-mockup.png", alt: "بروفايل شركة مطبوع من واجهة", width: 1448, height: 1086 },
  },
].map((plan, order) => ({ ...plan, order, currency: "ريال" }));

const SECTIONS = [
  { key: "hero", name: "الرئيسية", type: "hero" },
  { key: "proof", name: "شريط الثقة", type: "proof" },
  { key: "why", name: "مميزات الخدمة", type: "features", title: "نساعد الشركات على النمو رقمياً" },
  { key: "package", name: "الباقة", type: "package", title: "باقة الشركات والأعمال" },
  { key: "services", name: "الخدمات المنفردة", type: "services", title: "أو اطلب خدمة منفصلة" },
  { key: "process", name: "خطوات العمل", type: "process", title: "كيف نعمل؟", subtitle: "عملية واضحة وشفافة من البداية للنهاية" },
  { key: "work", name: "نماذج أعمالنا", type: "portfolio", title: "نماذج من أعمالنا", subtitle: "نفخر بثقة عملائنا ونجاح مشاريعهم." },
  { key: "cta", name: "دعوة للتواصل", type: "cta" },
].map((section, order) => ({ ...section, order }));

const avatars = ["/assets/images/avatar-1.png", "/assets/images/avatar-2.png", "/assets/images/avatar-3.png"];

/** Items per section key. `package` and `services` mirror the plans above. */
const CONTENTS = {
  hero: [
    {
      badge: "موقع + ملف تعريفي لشركتك",
      title: "عميلك يحكم عليك\nقبل أن يكلّمك.",
      body: "واجهة رقمية وبروفايل بهوية واحدة، يجعلان قرار التعامل معك محسوماً من أول نظرة.",
      cta: { label: "اطلب موقعك الآن", href: WHATSAPP },
    },
  ],
  proof: [
    {
      title: "تم تنفيذ أكثر من 50 مَوقعًا\nوبروفايل شركة باحترافية عالية",
      body: "حلول رقمية تزيد ثقة عميلك ومبيعاتك",
    },
    ...avatars.map((src, i) => ({ title: `avatar-${i + 1}`, image: { src, alt: "" } })),
  ],
  why: [
    { icon: "layout", title: "تصميم احترافي", body: "يعكس هوية شركتك" },
    { icon: "bolt", title: "سرعة وأداء عالي", body: "مواقع سريعة ومتجاوبة" },
    { icon: "chart", title: "جاهز لمحركات البحث SEO", body: "لظهور أفضل في النتائج" },
    { icon: "headset", title: "دعم فني مستمر", body: "نرافقك بعد الإطلاق" },
  ],
  package: [
    {
      badge: "عرض خاص",
      title: "موقع احترافي + بروفايل شركة متكامل",
      body: "كل ما تحتاجه شركتك لتظهر بصورة احترافية أمام عملائك في مكان واحد. نصمم لك موقعاً يعكس قوة علامتك التجارية، وبروفايل شركة منظّماً يعرّف بخدماتك وأعمالك ويعزّز ثقة العملاء بك.",
      items: PLANS[0].benefits,
      price: 1200,
      priceBefore: 2000,
      currency: "ريال",
      cta: { label: "اطلب الباقة الآن", href: WHATSAPP },
      image: PLANS[0].image,
    },
  ],
  services: [
    {
      icon: "monitor",
      title: "إنشاء موقع إلكتروني",
      body: "موقع احترافي متجاوب يعكس هوية شركتك ويجهّزك للظهور في محركات البحث.",
      items: PLANS[1].benefits,
      price: 1500,
      currency: "ريال",
      cta: { label: "اطلب خدمة الموقع", href: WHATSAPP },
      image: PLANS[1].image,
    },
    {
      icon: "file",
      title: "إنشاء بروفايل شركة",
      body: "ملف تعريفي منظّم يعرّف بخدماتك وأعمالك، جاهز للعرض والطباعة.",
      items: PLANS[2].benefits,
      price: 500,
      currency: "ريال",
      cta: { label: "اطلب خدمة البروفايل", href: WHATSAPP },
      image: PLANS[2].image,
    },
  ],
  process: [
    { num: "01", icon: "brief", title: "نستمع لاحتياجاتك", body: "نفهم أهدافك ومتطلبات مشروعك بالتفصيل." },
    { num: "02", icon: "design", title: "نخطط ونصمم", body: "نضع خطة ونصمم واجهات عصرية وتجربة مميزة." },
    { num: "03", icon: "test", title: "نطوّر ونختبر", body: "نقوم بالتطوير والاختبار لضمان أعلى جودة." },
    { num: "04", icon: "award", title: "نسلّم وندعم", body: "نسلّم المشروع مع دعم فني لضمان نجاحك." },
  ],
  cta: [
    {
      title: "جاهز للانطلاق بواجهة رقمية تميّزك؟",
      body: "دعنا نساعدك في بناء حضور قوي على الإنترنت.",
      cta: { label: "تواصل معنا الآن", href: WHATSAPP },
    },
  ],
};

// planIndex: 0 package, 1 website, 2 profile
const CLIENTS = [
  { name: "عيادة الأمل", planIndex: 0 },
  { name: "شركة نخبة للاستشارات", planIndex: 2 },
  { name: "مقاولات الرياض", planIndex: 1 },
  { name: "منصة أسئلة", planIndex: 1 },
  { name: "مكتب الريادة", planIndex: 2 },
  { name: "مطعم السلطان", planIndex: 0 },
];

const PROJECTS = [
  { title: "موقع عيادة الأمل", status: "active", date: "2026-10-18" },
  { title: "بروفايل شركة نخبة", status: "review", date: "2026-10-12" },
  { title: "موقع مقاولات الرياض", status: "done", date: "2026-09-30" },
  { title: "موقع أسئلة", status: "done", date: "2026-09-14" },
  { title: "بروفايل مكتب الريادة", status: "done", date: "2026-08-27" },
  { title: "موقع وبروفايل مطعم السلطان", status: "active", date: "2026-08-05" },
];

async function seed() {
  await connectDb();

  await Promise.all([
    Section.deleteMany(),
    Content.deleteMany(),
    Plan.deleteMany(),
    Project.deleteMany(),
    User.deleteMany(),
    Setting.deleteMany(),
  ]);

  await Setting.create(SETTINGS);

  const plans = await Plan.insertMany(PLANS);
  const sections = await Section.insertMany(SECTIONS);

  const sectionByKey = new Map(sections.map((s) => [s.key, s._id]));
  const contentDocs = Object.entries(CONTENTS).flatMap(([key, items]) =>
    items.map((item, order) => ({ ...item, order, section: sectionByKey.get(key) })),
  );
  await Content.insertMany(contentDocs);

  const users = await User.insertMany(
    CLIENTS.map((client, i) => ({
      name: client.name,
      phone: `+96650000${String(1000 + i)}`,
      plan: plans[client.planIndex]._id,
    })),
  );

  await Project.insertMany(
    PROJECTS.map((project, i) => ({
      ...project,
      user: users[i]._id,
      plan: plans[CLIENTS[i].planIndex]._id,
      bio_image: "/assets/images/exam-app.png",
      featured: true,
      order: i,
    })),
  );

  if (env.admin.email && env.admin.password) {
    const existing = await Admin.findOne({ email: env.admin.email.toLowerCase() });
    if (!existing) {
      await Admin.create({
        name: env.admin.name,
        email: env.admin.email,
        passwordHash: await hashPassword(env.admin.password),
      });
      console.log(`Admin created: ${env.admin.email}`);
    } else {
      console.log(`Admin already exists: ${env.admin.email}`);
    }
  } else {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set: no admin was created.");
  }

  console.log(
    `Seeded ${sections.length} sections, ${contentDocs.length} contents, ${plans.length} plans, ${users.length} clients, ${PROJECTS.length} projects.`,
  );
}

try {
  await seed();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
