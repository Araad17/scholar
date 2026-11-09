# بورسیه‌یاب افغانستان

وب‌سایت گردآوری بورسیه‌ها برای محصلین افغانستان، با حساب کاربری و دو داشبورد جدا.

**تکنولوژی:** React + TypeScript + Tailwind (Vite) · Node.js + Express + TypeScript · MySQL 8

## قابلیت‌ها
- **عمومی:** جستجو و فیلتر بورسیه‌ها، صفحه جزئیات.
- **داشبورد کاربر** (`/dashboard`): خانه، پروفایل، مدارک (آپلود PDF/JPG/PNG)، جلسه مشاوره (رزرو و لغو)، معرفی دوستان (کد و لینک اختصاصی).
- **پنل ادمین** (`/admin`): نمای کلی، مدیریت بورسیه‌ها، کاربران (پروفایل و مدارک)، بررسی مدارک (تأیید/رد با یادداشت)، مدیریت زمان‌های جلسه.
- ورود و ثبت‌نام یکپارچه؛ بعد از ورود، نقش (user/admin) تعیین می‌کند به کدام داشبورد بروید.

## راه‌اندازی

```bash
# 1) دیتابیس
mysql -u root -p -e "CREATE DATABASE bursary CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2) بک‌اند
cd backend
cp .env.example .env     # DATABASE_URL, JWT_SECRET, ADMIN_* را تنظیم کنید
npm install              # یا pnpm install
npm run db:init          # ساخت/به‌روزرسانی جدول‌ها (امن برای اجرای دوباره)
npm run seed:admin       # ساخت حساب ادمین از روی .env
npm run dev              # http://localhost:4000

# 3) فرانت‌اند (ترمینال دوم)
cd frontend
npm install
npm run dev              # http://localhost:5173
```

> **اگر نسخه قبلی را داشتید:** جدول قدیمی `admins` دیگر استفاده نمی‌شود. حساب ادمین حالا در جدول `users` است؛ فقط `db:init` و سپس `seed:admin` را دوباره اجرا کنید.

## API (خلاصه)
| مسیر | دسترسی |
|---|---|
| `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` | عمومی / کاربر |
| `GET /api/scholarships…` | عمومی |
| `GET/PUT /api/user/profile`, `GET /api/user/home`, `GET /api/user/referrals` | کاربر |
| `GET/POST/DELETE /api/documents`, `GET /api/documents/:id/file` | کاربر (فایل: صاحب مدرک یا ادمین) |
| `GET /api/meetings/open`, `GET /api/meetings/mine`, `POST /api/meetings/:id/book`, `POST /api/meetings/:id/cancel` | کاربر |
| `/api/admin/scholarships`, `/api/admin/users`, `/api/admin/documents`, `/api/admin/meetings`, `/api/admin/stats` | ادمین |

## نکات امنیتی و انتشار
- فایل‌های آپلودشده در پوشه `UPLOAD_DIR` ذخیره می‌شوند و فقط از راه API با توکن قابل دسترسی‌اند (مستقیم سرو نمی‌شوند). از این پوشه بکاپ بگیرید.
- نوع فایل با محتوای واقعی (magic bytes) هم بررسی می‌شود؛ سقف حجم ۵ مگابایت.
- `JWT_SECRET` قوی بگذارید و رمز پیش‌فرض ادمین را عوض کنید. پشت HTTPS منتشر کنید.
- بک‌اند: `npm run build && npm start`. فرانت‌اند: `npm run build` و سرو پوشه `dist` با Nginx، با proxy کردن `/api` به بک‌اند.
