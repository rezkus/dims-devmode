# DIMS - A SELF-SOVEREIGN DISTRIBUTED IDENTITY MANAGEMENT SYSTEM


## Instalasi
Instruksi lebih detail dapat diakses di https://www.edx.org/course/blockchain-business-introduction-linuxfoundationx-lfs171x-0 pada bab 4 dan bab 7.

Berikut adalah perangkat lunak yang harus dipersiapkan untuk menjalankan DIMS pada perangkat komputer baru. **Versi perangkat lunak tidak perlu sama persis dengan yang dijelaskan pada tabel**, kecuali untuk versi perangkat yang diberi keterangan.

* Ubuntu 16.04 LTS x64
* Node.Js 8.11.3 (jangan gunakan v7.x)
* NPM 5.6.0 (Gunakan versi lebih dari v3.x)
* Go 1.10.3
* Hyperledger Fabric 1.1.0 (DIMS diimplementasikan hanya untuk v1.1.0)
* Fabric Node SDK 1.1.0 (DIMS diimplementasikan hanya untuk v1.1.0)
* Fabric CA Node SDK 1.1.0 (DIMS diimplementasikan hanya untuk v1.1.0)
* c-url 7.61.0
* Docker CE 18.03
* Docker Compose 1.9.0


## Persiapan
Sebelum menjalankan program, beberapa persiapan harus dilakukan. Persiapan ini dilakukan hanya sekali dan terkait penggantian akun firebase yang dilakukan pada aplikasi. **Setelah mengikuti langkah ini, database realtime bisa Anda akses di console Firebase Anda**. Berikut adalah langkah yang harus dilakukan untuk mengganti akun firebase ke akun Anda.
  1. Buka http://firebase.google.com
  2. Log in ke dalam akun Firebase Anda
  3. Masuk ke dalam console
  4. Buat project baru dengan setting: default
  5. Buka menu “Develop” pada menu di sebelah kiri layar, dan pilih “Database”
  6. Buat “realtime database” dengan mode test mode
  7. Masuk ke dalam project setting dan klik “Add Firebase to your web app”
  8. Salin kode konfigurasi yang diberikan pada layar seluruhnya
  9. Ganti kode konfigurasi yang ada pada file proyek di bawah ini dengan kode konfigurasi Anda (unduh di https://github.com/rezkus/dims-devmode)
      i. /www/index-user.html
      ii. /www/index-inquisitor.html
      iii. /www/index-issuer.html
      iv. /www/login.html
      v. /populateAuth.js
  10. Program siap untuk dijalankan


## Operasi
Berikut adalah cara menjalankan DIMS dari komputer baru.
  1. Buka terminal pada Ubuntu 16.04
  2. Masuk ke dalam direktori program yang telah diunduh/clone dari https://github.com/rezkus/dims-devmode
  3. Jalankan perintah “./runApp.sh” pada terminal yang sedang dibuka di direktori terkait. Perintah tersebut akan melakukan:
      i. Penghapusan kontainer artefak blockchain pada Docker yang sudah dibuat sebelumnya (jika ada)
      ii. Pembuatan kontainer artefak blockchain yang baru
      iii. Mengunduh seluruh package npm yang ditulis pada file “package.json”
      iv. Menjalankan web server pada localhost:4000
  4. Buka terminal baru dan masuk ke direktori yang sama
  5. Jalankan perintah “./setupApp.sh” pada terminal baru yang sedang dibuka di direktori terkait. Perintah tersebut akan melakukan:
      i. Memasukkan dummy user Jim dari Org1 untuk debugging pada blockchain dengan Fabric CA
      ii. Memasukkan dummy user Barry dari Org2 untuk debugging pada blockchain dengan Fabric CA
      iii. Membuat channel bernama “mychannel”
      iv. Memasukkan Org1 ke dalam channel yang baru saja dibuat
      v. Memasukkan Org2 ke dalam channel yang baru saja dibuat
      vi. Melakukan instalasi chaincode pada seluruh peer dari Org1
      vii. Melakukan instalasi chaincode pada seluruh peer dari Org2
      viii. Melakukan instantiasi chaincode untuk menghasilkan blok genesis
  6. Setelah proses selesai, jalankan perintah “node populateAuth.js” untuk memasukkan dummy credential ke dalam firebase (Peringatan: Pastikan data credential pada firebase dihapus seluruhnya sebelum mengeksekusi perintah ini)


## Penghentian Aplikasi
Berikut adalah hal yang harus dilakukan jika ingin memberhentikan aplikasi dari bekerja
  1. Tekan Ctrl+C pada terminal tempat dijalankan perintah “./runApp.sh”. Aplikasi web dan blockchain akan dimatikan
  2. Hapus seluruh data di realtime database pada Firebase untuk mencegah duplikasi dan eror ketika sistem dijalankan kembali
  3. Jika diperlukan, jalankan perintah “docker rm -f $(docker ps -aq)” dan “docker network prune” pada terminal
