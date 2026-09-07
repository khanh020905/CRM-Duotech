# Duotech CRM - Bảng điều khiển quản lý quan hệ khách hàng

Hệ thống Dashboard CRM hiện đại, chuẩn UI/UX, trực quan và tối ưu trải nghiệm người dùng, được xây dựng bằng **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Recharts** và **Lucide Icons**.

---

## 🚀 Tính năng nổi bật

- **Khớp 100% UI Design & UX Brief**:
  - Tông màu: Nền `#F6F8FC`, Card/Sidebar `#FFFFFF`, Primary `#1765FF`, Active `#EAF2FF`, Border `#E6EBF2`.
  - Phông chữ **Inter** tối ưu hiển thị tiếng Việt.
  - Bố cục 4 thẻ KPI nổi bật, hàng giữa tỷ lệ 2:1 (Biểu đồ doanh thu vs Pipeline bán hàng), hàng dưới tỷ lệ 2:1 (Khách hàng gần đây vs Công việc hôm nay).
- **Bộ lọc thời gian linh hoạt**:
  - Chuyển đổi giữa Tháng 9/2026, Tháng 8/2026, Quý 3/2026 và Cả năm 2026 để cập nhật đồng bộ các chỉ số KPI.
  - Tùy chọn xem doanh thu theo **Tháng / Quý / Năm** với biểu đồ đường diện tích Recharts mượt mà và tooltip chi tiết.
- **Quản lý khách hàng toàn diện (CRUD + Sheet + Modal)**:
  - **Thêm khách hàng mới**: Form modal với validate trường bắt buộc, định dạng email, giá trị số không âm và hiển thị lỗi inline.
  - **Chỉnh sửa & Xóa**: Menu thao tác trên từng dòng với dialog xác nhận xóa an toàn.
  - **Xem chi tiết**: Slide-over sheet bên phải hiển thị đầy đủ thông tin, liên hệ nhanh (gọi điện, email) và ghi chú.
  - **Tìm kiếm tiếng Việt thông minh**: Hỗ trợ tìm kiếm theo tên, công ty, email bỏ dấu (ví dụ: gõ "viet nhat" vẫn tìm ra "Việt Nhật").
  - **Bộ lọc đa chiều**: Lọc theo trạng thái (*Tiềm năng, Đang đàm phán, Khách hàng, Mất cơ hội*) và nhân viên phụ trách (*Quốc Khánh, Thu Hà, Minh Đức, Ngọc Anh*).
  - **Xem tất cả khách hàng**: Mở rộng danh sách đầy đủ với thanh công cụ tìm kiếm và lọc tích hợp.
- **Quản lý công việc hôm nay (Today Tasks)**:
  - Checkbox hoàn thành công việc: Tự động gạch ngang chữ và cập nhật số lượng công việc còn lại.
  - **Badge động trên Sidebar**: Số lượng công việc chưa xong được đồng bộ trực tiếp lên badge đỏ ở menu *Công việc*.
  - Modal xem toàn bộ công việc và tạo việc mới nhanh chóng.
- **Trải nghiệm toàn diện**:
  - Phím tắt **⌘ K** (hoặc click ô tìm kiếm) để mở menu tìm kiếm nhanh và thao tác nhanh.
  - Hệ thống **Toast notification** thông báo kết quả cho mọi thao tác.
  - Bộ chọn Workspace: Chuyển đổi giữa các chi nhánh hoặc tạo workspace mới.
  - Các module chưa triển khai (*Cơ hội, Lịch hẹn, Báo cáo, Cài đặt*) hiển thị popup **"Sắp ra mắt"** thân thiện, không gây lỗi 404.
  - Lưu trữ dữ liệu an toàn trong `localStorage` với cơ chế chống hydration mismatch.

---

## 📁 Cấu trúc thư mục chuẩn Scalable

```
CRM-DUOTECH/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout tích hợp Inter font & CRMProvider
│   │   ├── page.tsx                # Chuyển hướng tự động / -> /dashboard
│   │   ├── globals.css             # Biến CSS, bảng màu, scrollbar & animation
│   │   └── dashboard/
│   │       └── page.tsx            # Trang Dashboard tổng quan
│   ├── components/
│   │   ├── common/
│   │   │   ├── Avatar.tsx          # Avatar fallback thông minh chống vỡ ảnh
│   │   │   └── ConfirmDialog.tsx   # Hộp thoại xác nhận thao tác nguy hiểm (xóa)
│   │   ├── layout/
│   │   │   ├── AppSidebar.tsx      # Thanh điều hướng chính bên trái
│   │   │   ├── Topbar.tsx          # Header tìm kiếm ⌘K, thông báo, tài khoản
│   │   │   ├── WorkspaceSelect.tsx # Dropdown chọn Workspace
│   │   │   └── MobileNav.tsx       # Drawer navigation cho tablet & mobile
│   │   ├── dashboard/
│   │   │   ├── DashboardHeader.tsx # Tiêu đề, lọc ngày tháng & nút thêm khách hàng
│   │   │   ├── StatCard.tsx        # Thẻ chỉ số KPI pastel
│   │   │   ├── RevenueChart.tsx    # Biểu đồ Recharts diện tích (Tháng/Quý/Năm)
│   │   │   ├── SalesPipeline.tsx   # Pipeline 4 giai đoạn với thanh tiến độ chuẩn
│   │   │   ├── CustomersTable.tsx  # Bảng dữ liệu khách hàng, tìm kiếm & bộ lọc
│   │   │   ├── CustomerFormModal.tsx # Form thêm/sửa với validation
│   │   │   ├── CustomerDetailSheet.tsx # Sheet xem chi tiết hồ sơ
│   │   │   ├── AllCustomersModal.tsx # Sheet danh sách toàn bộ khách hàng
│   │   │   ├── TodayTasks.tsx      # Khối công việc hôm nay
│   │   │   ├── AllTasksModal.tsx   # Modal quản lý & thêm công việc
│   │   │   ├── ComingSoonModal.tsx # Modal thông báo module sắp ra mắt
│   │   │   └── CommandMenu.tsx     # Tìm kiếm toàn cầu ⌘K
│   │   └── ui/                     # UI Primitives tái sử dụng
│   │       ├── Badge.tsx           # Badge trạng thái
│   │       ├── Button.tsx          # Nút bấm đa dạng variant & kích thước
│   │       ├── Checkbox.tsx        # Checkbox chuẩn UX
│   │       ├── Input.tsx           # Ô nhập liệu có validation & icon
│   │       ├── Modal.tsx           # Hộp thoại pop-up có backdrop
│   │       ├── Sheet.tsx           # Bảng trượt từ cạnh phải
│   │       └── Toast.tsx           # Thông báo hành động góc phải
│   ├── context/
│   │   └── CRMContext.tsx          # Quản lý State toàn cục & LocalStorage
│   ├── data/
│   │   └── mockData.ts             # Dữ liệu mẫu ban đầu tiếng Việt phong phú
│   ├── lib/
│   │   └── utils.ts                # Tiện ích cn, formatCurrency, matchSearch bỏ dấu
│   └── types/
│       └── crm.ts                  # Khai báo TypeScript types chặt chẽ
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

---

## 🛠️ Hướng dẫn cài đặt & Khởi chạy

### 1. Cài đặt dependencies:
```bash
pnpm install
# hoặc: npm install / yarn install
```

### 2. Khởi chạy máy chủ phát triển:
```bash
pnpm dev
# hoặc: npm run dev
```
Truy cập trình duyệt tại: [http://localhost:3000](http://localhost:3000) (hoặc cổng hiển thị trên terminal nếu cổng 3000 đang bận).

### 3. Kiểm tra kiểm thử & Build production:
```bash
pnpm build
```
Build hoàn tất mà không có bất kỳ lỗi TypeScript hay cảnh báo nào.
