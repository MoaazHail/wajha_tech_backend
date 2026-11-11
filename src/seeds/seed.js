/**
 * Loads v2's hardcoded copy (landing.constant.ts, site.constant.ts,
 * dashboard-data.constant.ts) into MongoDB and creates the first admin.
 * Safe to re-run: it wipes the content collections first, keeps admins.
 */
import mongoose from "mongoose";

import { connectDb } from "../config/db.js";
import { env } from "../config/env.js";
import { Admin } from "../models/admin.model.js";
import { Plan } from "../models/plan.model.js";
import { Project } from "../models/project.model.js";
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
    Plan.deleteMany(),
    Project.deleteMany(),
    User.deleteMany(),
    Setting.deleteMany(),
  ]);

  await Setting.create(SETTINGS);

  const plans = await Plan.insertMany(PLANS);
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
    `Seeded ${plans.length} plans, ${users.length} clients, ${PROJECTS.length} projects.`,
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
