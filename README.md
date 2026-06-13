# 💬 Chat System

Ứng dụng chat real-time full-stack, gồm **backend Spring Boot** (REST API + WebSocket/STOMP) và **frontend React**. Hỗ trợ đăng ký/đăng nhập bằng JWT, trò chuyện 1-1 và nhóm, gửi tin nhắn theo thời gian thực, upload avatar, và quản lý hội thoại.

## 🚀 Công nghệ sử dụng

**Backend**
- Java 21, Spring Boot 3.5
- Spring Web, Spring Data JPA, Spring Security
- Spring WebSocket (STOMP + SockJS)
- JWT (jjwt) cho xác thực
- MySQL (môi trường dev), H2 in-memory (môi trường test)
- Maven (Maven Wrapper)

**Frontend**
- React 18 + Vite
- Redux Toolkit, React Redux
- React Router DOM
- @stomp/stompjs + sockjs-client (WebSocket realtime)
- Axios
- Bootstrap 5

## 📁 Cấu trúc dự án

```
Chat-System/
├── src/main/java/com/chatapp/
│   ├── config/          # Cấu hình Security, WebSocket, WebMvc
│   ├── controllers/      # REST controllers (Auth, User, Conversation, Message, Upload...)
│   ├── dto/               # Request/Response DTO theo từng module
│   ├── exceptions/        # Xử lý exception tập trung
│   ├── filter/            # JWT Auth Filter
│   ├── mappers/           # Entity <-> DTO mapper
│   ├── models/            # Entity JPA (User, Conversation, Message...)
│   ├── repositories/      # Spring Data JPA repository
│   └── services/          # Business logic (auth, user, conversation, message)
├── src/main/resources/
│   ├── application-dev.properties   # Config MySQL cho môi trường dev
│   └── application-test.properties  # Config H2 cho môi trường test
├── frontend/
│   ├── src/
│   │   ├── api/           # Gọi API qua Axios
│   │   ├── components/    # UI components (danh sách hội thoại, tin nhắn...)
│   │   ├── hooks/          # useWebSocket - kết nối realtime
│   │   ├── pages/          # Login, Register, Chat, Profile
│   │   ├── store/          # Redux slices (auth, conversation, message)
│   │   └── utils/           # Hàm hỗ trợ (avatar, upload ảnh, lỗi API...)
│   └── package.json
├── mvnw / mvnw.cmd        # Maven Wrapper
└── pom.xml
```

## ⚙️ Yêu cầu hệ thống

- Java 21 (JDK)
- Node.js (khuyến nghị >= 18) và npm — để chạy frontend
- MySQL (chỉ cần khi chạy backend ở profile `dev`)
- Maven Wrapper đã có sẵn trong repo (`mvnw` / `mvnw.cmd`), không cần cài Maven riêng

## 🔧 Cài đặt & chạy dự án

### 1. Backend (Spring Boot)

#### Chạy test (không cần MySQL)

Backend dùng profile `test` với H2 in-memory, phù hợp để chạy unit test mà không cần cài database:

```bash
cd Chat-System
./mvnw test          # macOS/Linux
.\mvnw.cmd test       # Windows
```

#### Chạy ứng dụng ở môi trường dev

Mặc định backend chạy với profile `dev`, kết nối MySQL qua các biến môi trường:

| Biến môi trường | Mô tả | Giá trị mẫu |
|---|---|---|
| `DB_URL` | Connection string JDBC tới MySQL | `jdbc:mysql://localhost:3306/chat_system?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` |
| `DB_USERNAME` | Tài khoản MySQL | `root` |
| `DB_PASSWORD` | Mật khẩu MySQL | `root` |

Ví dụ trên Windows (PowerShell):

```powershell
cd Chat-System
$env:DB_URL="jdbc:mysql://localhost:3306/chat_system?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="root"
.\mvnw.cmd spring-boot:run
```

Ví dụ trên macOS/Linux:

```bash
cd Chat-System
export DB_URL="jdbc:mysql://localhost:3306/chat_system?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export DB_USERNAME=root
export DB_PASSWORD=root
./mvnw spring-boot:run
```

Backend sẽ chạy tại `http://localhost:8080`.

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173` (mặc định của Vite) và gọi API tới backend tại `http://localhost:8080`.

## 📡 API Endpoints chính

### Auth — `/api/auth`
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký tài khoản mới |
| POST | `/api/auth/login` | Đăng nhập, trả về JWT |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại |

### User — `/api/user`
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/user` | Danh sách user |
| POST | `/api/user` | Tạo user |
| GET | `/api/user/{id}` | Lấy thông tin user theo id |
| PUT | `/api/user/{id}` | Cập nhật user |
| DELETE | `/api/user/{id}` | Xoá user |
| GET | `/api/user/search` | Tìm kiếm user (kết bạn) |

### Conversation — `/api/conversations`
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/conversations` | Danh sách hội thoại của user |
| POST | `/api/conversations` | Tạo hội thoại mới (1-1 hoặc nhóm) |
| GET | `/api/conversations/{id}` | Chi tiết hội thoại |
| PUT | `/api/conversations/{id}` | Cập nhật hội thoại |
| DELETE | `/api/conversations/{id}` | Xoá hội thoại |

### Message — `/api`
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/conversations/{conversationId}/messages` | Lấy danh sách tin nhắn |
| POST | `/api/conversations/{conversationId}/messages` | Gửi tin nhắn mới |
| PATCH | `/api/messages/{messageId}` | Sửa tin nhắn |
| DELETE | `/api/messages/{messageId}` | Xoá tin nhắn |
| PATCH | `/api/messages/{messageId}/read` | Đánh dấu đã đọc |

### Upload — `/api/upload`
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/upload/avatar` | Upload ảnh đại diện (multipart/form-data) |

## 🔌 WebSocket (Realtime)

- Endpoint kết nối: `ws://localhost:8080/ws` (hỗ trợ fallback SockJS)
- Client gửi message qua prefix: `/app` — ví dụ `/app/conversations/{conversationId}/send`
- Server broadcast message qua topic: `/topic/...`
- Kết nối WebSocket được xác thực qua JWT (xem `WebSocketAuthConfig`)

## 🔐 Xác thực

- Sử dụng JWT (JSON Web Token) cho cả REST API và WebSocket.
- Token được tạo và verify thông qua `JwtService`, áp dụng qua `JwtAuthFilter` cho mọi request.
- Cấu hình Spring Security nằm tại `SecurityConfig`.

## 🗂️ Môi trường (Profiles)

| Profile | Database | Mục đích |
|---|---|---|
| `dev` | MySQL | Chạy ứng dụng thực tế |
| `test` | H2 in-memory | Chạy unit test, không cần setup MySQL |

## 📌 Ghi chú

- File ảnh upload (avatar) được lưu trong thư mục `uploads/`.
- Tham khảo thêm `NOTES.md` và `HELP.md` trong repo để biết chi tiết quá trình phát triển và các lưu ý debug.
