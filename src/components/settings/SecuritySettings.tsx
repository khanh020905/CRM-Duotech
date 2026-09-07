'use client';

import React from 'react';
import { Shield, KeyRound, Smartphone, Laptop, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function SecuritySettings() {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Notice Card: Chưa kết nối hệ thống xác thực */}
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-[#92400E]">
            Trạng thái bảo mật: Chưa kết nối hệ thống xác thực (Demo Mode)
          </h4>
          <p className="text-xs text-[#B45309] leading-relaxed">
            Ứng dụng hiện đang vận hành ở chế độ giao diện thử nghiệm với dữ liệu lưu cục bộ trên trình duyệt. Các tính năng bảo mật thực tế như đổi mật khẩu băm (bcrypt), xác thực 2 lớp (TOTP/SMS) và quản lý phiên đăng nhập (JWT/Sessions) được vô hiệu hóa có chủ đích để bảo vệ an toàn cho bạn.
          </p>
        </div>
      </div>

      {/* Security Actions (Disabled with explanations) */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6EBF2] shadow-2xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-[#101828]">Bảo vệ tài khoản</h3>
          <p className="text-xs text-[#667085] mt-0.5">
            Cấu hình các tiêu chuẩn an toàn cho tài khoản đăng nhập vào Duotech CRM.
          </p>
        </div>

        <div className="space-y-4 divide-y divide-[#F2F4F7] text-xs">
          {/* Đổi mật khẩu */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 first:pt-0 opacity-70">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E6EBF2] flex items-center justify-center text-[#667085] shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#101828]">Mật khẩu đăng nhập</p>
                <p className="text-xs text-[#667085] mt-0.5">
                  Lần đổi gần nhất: 15 ngày trước. Cần có backend API để xác thực an toàn.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              disabled
              className="text-xs font-semibold self-start sm:self-auto cursor-not-allowed"
            >
              <Lock className="w-3 h-3 mr-1" />
              Đổi mật khẩu
            </Button>
          </div>

          {/* Xác thực hai bước (2FA) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 opacity-70">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E6EBF2] flex items-center justify-center text-[#667085] shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#101828]">Xác thực hai bước (2FA)</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F2F4F7] text-[#667085]">
                    Chưa kích hoạt
                  </span>
                </div>
                <p className="text-xs text-[#667085] mt-0.5">
                  Tăng cường bảo mật với mã xác nhận từ ứng dụng Google Authenticator hoặc tin nhắn SMS.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              disabled
              className="text-xs font-semibold self-start sm:self-auto cursor-not-allowed"
            >
              <Lock className="w-3 h-3 mr-1" />
              Thiết lập 2FA
            </Button>
          </div>

          {/* Phiên đăng nhập */}
          <div className="pt-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-[#101828]">Phiên đăng nhập hiện tại</p>
              <p className="text-xs text-[#667085] mt-0.5">
                Thiết bị bạn đang dùng để truy cập vào hệ thống Duotech CRM này.
              </p>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] border border-[#E6EBF2] rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E6EBF2] flex items-center justify-center text-[#1765FF]">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-[#101828] text-xs">MacBook Pro (Apple Silicon) • macOS</p>
                  <p className="text-[11px] text-[#667085]">Trình duyệt Chrome • Đang hoạt động</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                Phiên này
              </span>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                disabled
                className="text-xs font-semibold text-[#DC2626] border-[#FCA5A5] opacity-60 cursor-not-allowed"
              >
                Đăng xuất tất cả các thiết bị khác
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
