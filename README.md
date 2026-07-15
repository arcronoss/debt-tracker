# บันทึกหนี้สิน — วิธีขึ้น GitHub และ Deploy จาก iPhone ล้วน ๆ (React ธรรมดา / Create React App)

โปรเจกต์นี้ใช้ **Create React App** (react-scripts) แบบมาตรฐาน ไม่ใช้ Vite แล้ว

## ขั้นตอนที่ 1: เอาโลโก้ใส่โปรเจกต์
1. เปิดแอป Files บน iPhone
2. คัดลอกไฟล์ `Logo` ของคุณจากโฟลเดอร์ `debt`
3. วางไฟล์นั้นลงในโฟลเดอร์ `public` ของโปรเจกต์นี้
4. เปลี่ยนชื่อไฟล์เป็น `logo.png` พอดี (ถ้าเป็นไฟล์ .jpg หรือ .heic ก็เปลี่ยนนามสกุลให้ตรง แล้วแก้ path ใน `public/index.html` / `public/manifest.json` ให้ตรงนามสกุลด้วย)

## ขั้นตอนที่ 2: สร้าง Repository บน GitHub
1. เปิด Safari ไปที่ github.com แล้วล็อกอิน (หรือใช้แอป GitHub)
2. แตะ "+" มุมขวาบน > "New repository"
3. ตั้งชื่อ เช่น `debt-tracker` > กด "Create repository"

## ขั้นตอนที่ 3: อัปโหลดไฟล์ทั้งหมด
1. ในหน้า repo ที่สร้างใหม่ แตะ "Add file" > "Upload files"
2. เปิด Files app แล้วลากไฟล์/โฟลเดอร์ทั้งหมดในนี้เข้าไป (`package.json`, `tailwind.config.js`, `postcss.config.js`, `.gitignore`, โฟลเดอร์ `src` ทั้งหมด, โฟลเดอร์ `public` ทั้งหมด)
   - หมายเหตุ: การอัปโหลดผ่านเว็บของ GitHub รองรับการลากทีละหลายไฟล์ แต่ถ้าเป็นโฟลเดอร์ให้เลือกไฟล์ข้างในทีละไฟล์แล้วอัปโหลดพร้อมกัน โครงสร้างโฟลเดอร์ (เช่น `src/App.jsx`, `public/index.html`) จะยังคงถูกต้องตราบใดที่ path ในชื่อไฟล์ตอนลากถูกต้อง
   - **ไม่มี `vite.config.js` และไม่มี `index.html` ที่ root แล้ว** — `index.html` ตอนนี้อยู่ใน `public/index.html`
3. เลื่อนลงล่าง ใส่ข้อความ commit เช่น "initial commit" แล้วกด "Commit changes"

## ขั้นตอนที่ 4: Deploy ด้วย Vercel (ฟรี ทำผ่านมือถือได้)
1. เปิด vercel.com ใน Safari > "Sign Up" ด้วยบัญชี GitHub เดียวกัน
2. กด "Add New" > "Project"
3. เลือก repo `debt-tracker` ที่เพิ่งสร้าง > กด "Import"
4. Vercel จะรู้จัก Create React App เองอัตโนมัติ (Framework Preset: "Create React App") ไม่ต้องตั้งค่าอะไรเพิ่ม กด "Deploy"
5. รอสักครู่ จะได้ลิงก์เว็บ เช่น `debt-tracker.vercel.app`

## ขั้นตอนที่ 5: เพิ่มลงหน้าจอโฮมพร้อมโลโก้
1. เปิดลิงก์เว็บที่ได้จาก Vercel ด้วย Safari (ต้องเป็น Safari เท่านั้น)
2. แตะปุ่มแชร์ (ไอคอนสี่เหลี่ยมมีลูกศรชี้ขึ้น)
3. เลื่อนหาแล้วแตะ "Add to Home Screen"
4. โลโก้ที่ใส่ไว้ใน `public/logo.png` จะแสดงเป็นไอคอนแอปทันที

## เวลาแก้ไขโค้ดในอนาคต
แก้ไฟล์ `src/App.jsx` ผ่านเว็บ github.com (แตะไอคอนดินสอ) แล้ว commit ใหม่ — Vercel จะ build และอัปเดตเว็บให้อัตโนมัติทุกครั้งที่มีการ commit

## ถ้าจะรันบนคอมพิวเตอร์ (ไม่บังคับ)
```
npm install
npm start      # รันเพื่อพัฒนา ที่ http://localhost:3000
npm run build  # build ไฟล์จริงลงโฟลเดอร์ build/
```
