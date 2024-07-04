# Giải thích các forder
utils: chứa những hàm thường hay sử dụng
dbs : kết nối mongoose
helpers : tương tự như utils nhưng khi nào cần sử dụng tời thì mới gọi
package-lock.json: chứa những file đã cài
models: Chứa mô hình database
# Giải thích các file trong forder
keytoken.model.js: lưu lại user, id user , public key, refresh tokens
# Giải thích các keyword
Access Tokens: là các token ngắn hạn được cấp cho ứng dụng sau khi người dùng hoặc máy khách (client) đã được xác thực.
Refresh Tokens là các token dài hạn được cấp cùng với Access Tokens
Public key: mã hóa dữ liệu
Private key: sử dụng để giải mã dữ liệu đã được mã hóa bằng khóa công khai.
# Cài dặt môi trường 
npm init -y  
npm i express --save
npm i morgan --save : Thư viện in ra các log khi người dùng chạy req
npm i helmet --save-dev : Thư viện bảo mật restapi
npm i compression --save-dev : nén các tệp tin trả về từ máy chủ trước khi chúng được gửi đến client. 
npm i mongoose --save-dev
npm install dotenv --save-dev

# Run server 
node --watch server.js
# Cú pháp viết tắt
!dmbg
