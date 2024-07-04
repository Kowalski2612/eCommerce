utils: chứa những hàm thường hay sử dụng
dbs : kết nối mongoose
helpers : tương tự như utils nhưng khi nào cần sử dụng tời thì mới gọi
npm init -y  
package-lock.json: chứa những file đã cài
npm i express --save
npm i morgan --save : Thư viện in ra các log khi người dùng chạy req
npm i helmet --save-dev : Thư viện bảo mật restapi
npm i compression --save-dev : nén các tệp tin trả về từ máy chủ trước khi chúng được gửi đến client. 
npm i mongoose --save-dev
npm install dotenv --save-dev

# Run server 
node --watch server.js