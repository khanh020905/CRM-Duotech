import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format số tiền sang định dạng Việt Nam (e.g. 120.000.000 đ hoặc "120 triệu")
 */
export function formatCurrency(amount: number, compact: boolean = false): string {
  if (compact) {
    if (amount >= 1_000_000_000) {
      const billions = amount / 1_000_000_000;
      return `${billions.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`;
    }
    if (amount >= 1_000_000) {
      const millions = amount / 1_000_000;
      return `${millions.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu`;
    }
    if (amount === 0) return "0";
    return `${amount.toLocaleString("vi-VN")} đ`;
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ngày theo định dạng Việt Nam dd/MM/yyyy
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Loại bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu
 * Ví dụ: "Việt Nhật" -> "viet nhat"
 */
export function removeVietnameseTones(str: string): boolean | string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

/**
 * Kiểm tra xem chuỗi nguồn có chứa chuỗi tìm kiếm không (bất kể hoa/thường hay dấu)
 */
export function matchSearch(target: string, query: string): boolean {
  if (!query) return true;
  if (!target) return false;
  const normalizedTarget = String(removeVietnameseTones(target));
  const normalizedQuery = String(removeVietnameseTones(query));
  return normalizedTarget.includes(normalizedQuery);
}

/**
 * Tính toán số tiền Đã thu và Còn lại của hợp đồng với fallback an toàn
 */
export function getContractFinancials(contract: { value: number; paidAmount?: number; status?: string }) {
  const paid = typeof contract.paidAmount === 'number'
    ? contract.paidAmount
    : (contract.status === 'Hoàn thành' || contract.status === 'Đang bảo trì' || contract.status === 'Đã kết thúc'
      ? contract.value
      : contract.status === 'Đang triển khai'
      ? Math.round(contract.value * 0.5)
      : 0);
  const remaining = Math.max(0, (contract.value || 0) - paid);
  return { paid, remaining };
}
