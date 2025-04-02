# URL Shortener Application

<div align="center">
  <img src="https://res.cloudinary.com/dmmpngwym/image/upload/v1743617580/shortlink_lsv5jd.jpg">
</div>

## 📌 Overview
  - URL Shortener Application เป็นเครื่องมือสำหรับย่อ URL ที่พัฒนาด้วย TypeScript, Node.js, Express, และ Prisma ช่วยให้ผู้ใช้สามารถ:
  - ย่อ URL ยาว ๆ ให้สั้นลง
  - ติดตามจำนวนคลิกและแหล่งที่มาของผู้ใช้
  - วิเคราะห์ตำแหน่งของผู้เข้าถึงลิงก์ผ่าน IP Address
  - เหมาะสำหรับการแชร์ลิงก์บนโซเชียลมีเดียและการตลาดดิจิทัล ✨

## 🚀 Features

1. **🔗 URL Shortening**
   - แปลง URL ยาวให้เป็นรหัสสั้น (short code) โดยใช้การเข้ารหัส Base62
   - รองรับการสร้าง Short URL ซ้ำสำหรับ URL เดิมที่มีอยู่แล้ว
   - คืนค่า URL สั้นในรูปแบบ `https://your-domain.com/<shortCode>`

2. **📊 Click Tracking**
   - บันทึกจำนวนครั้งที่ URL สั้นถูกคลิก
   - เก็บข้อมูล IP Address ของผู้คลิกเพื่อวิเคราะห์เพิ่มเติม

3. **🌍 GeoLocation Tracking**
   - ดึงข้อมูลตำแหน่ง (ประเทศ, เมือง, ละติจูด, ลองจิจูด) จาก IP Address โดยใช้ **IpInfo API**
   - บันทึกข้อมูลตำแหน่งในตาราง `GeoLocation` เพื่อดูสถิติ

4. **📈 Analytics**
   - **Location Stats**: แสดงจำนวนคลิกตามตำแหน่ง, ข้อมูลตำแหน่งล่าสุด (latest GeoLocation), และสถิติรวม
   - **URL History**: แสดงรายการ URL ทั้งหมดที่เคยสร้าง พร้อมวันสร้างและจำนวนคลิก

5. **⚡ Scalability**
   - ใช้ Prisma ORM ร่วมกับ PostgreSQL เพื่อจัดการฐานข้อมูลแบบ scalable
   - รองรับการ deploy บน platform เช่น Render

6. **Security**
   - ตั้งค่า `trust proxy` เพื่อดึง IP จริงจาก header `X-Forwarded-For` เมื่ออยู่หลัง proxy (เช่น Render)

## 🛠 Prerequisites

ก่อนติดตั้ง คุณต้องมีเครื่องมือและข้อมูลต่อไปนี้:

- **React.js**: v19 หรือสูงกว่า
- **MapBox API Key**: สมัครที่ [MapBox](https://www.mapbox.com/) เพื่อรับ API Key
- **Render Account**: ถ้าต้องการ deploy ออนไลน์

## 🔧 Installation (Local Development)

### 1️⃣ Clone Repository
```bash
git clone https://github.com/erisk405/ShortLink-Client.git
cd ShortLink-Client
```
### 2️⃣ Install Dependencies
```bash
npm install
# หรือถ้าใช้ yarn
# yarn install
```
### 3️⃣ Setup Environment Variables
```bash
VITE_API_URL="your_api_url" 
VITE_MAPBOX_API="your_mapbox_api_key"
```
API URL สามารถนำมาได้จาก [Short link server side](https://github.com/erisk405/ShortLink-Server) คือ http://localhost:8080

### 4️⃣ Start the Application
```bash
npm start
```
🔹 แอปจะรันที่ http://localhost:5173

## 🚀 Deployment
รองรับการ deploy บนแพลตฟอร์มต่าง ๆ เช่น:
  - Vercel: vercel deploy
  - Netlify: netlify deploy
  - Render: สามารถตั้งค่าใน package.json ให้รองรับ build บน Render

## 🔗 Links
- **Client Repository:** [Short link client side](https://github.com/erisk405/ShortLink-Client)
- **Server Repository:** [Short link server side](https://github.com/erisk405/ShortLink-Server)

Built with ❤️ using React Router.
