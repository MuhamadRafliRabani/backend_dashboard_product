# 💬 Next.js Chatbot App

Proyek ini adalah Backend (CRUD API) sederhana berbasis **Express.js**, yang Digunakan untuk management product dan orders\*\*.

---

## 🚀 Cara Menjalankan Proyek

1. **Clone repository ini**
   <br/>
   di cmd kamu jalankan perintah ini :
   <br/>
   git clone https://github.com/MuhamadRafliRabani/backend_dashboard_product.git
   <br/>
   cd backend_dashboard_product

2. **Pastikan Kamu sudah install XAMPP**
   <br/>
   di xampp jalankan server apace dan mysql kamu :
   <br/>
   click start

3. **Konfigurasi database**

- Buka phpMyAdmin di browser kamu
  [phpMyAdmin](http://localhost/phpmyadmin)
  <br/>
- Buat database baru dengan nama sesuai yang kamu gunakan di file .env
  (contoh: dashboard_product)
  <br/>
- Buka project di VS Code dengan perintah:
  <br/>
  code .
  <br/>
  Buka file .env di root project, lalu sesuaikan dengan konfigurasi database lokal kamu, misalnya:
  <br/>
  <br/>
  DB_HOST=localhost
  <br/>
  DB_USER=root
  <br/>
  DB_PASSWORD=
  <br/>
  DB_NAME=dashboard_product
  <br/>
  PORT=2000

4. **Lalu jalankan server kamu**
   <br/>
   di cmd kamu jalankan perintah ini :
   <br/>
   npm run dev

5. **Server siap digunakan**
