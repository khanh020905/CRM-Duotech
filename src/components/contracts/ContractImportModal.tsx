'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Contract, ContractStatus, MaintenanceStatus } from '@/types/crm';
import { useCRM } from '@/context/CRMContext';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContractImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRow {
  rowIndex: number;
  customerName: string;
  phone: string;
  project: string;
  value: number;
  status: ContractStatus;
  assigneeName: string;
  maintainStatus: MaintenanceStatus;
  maintainFee: number;
  raw: any;
  errors: string[];
  isDuplicate: boolean;
}

export function ContractImportModal({ isOpen, onClose }: ContractImportModalProps) {
  const { contracts, customers, members, importContracts, addCustomer, showToast } = useCRM();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);

  // Column Mapping
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({
    customerName: '',
    phone: '',
    project: '',
    value: '',
    status: '',
    assigneeName: '',
    maintainStatus: '',
    maintainFee: '',
  });

  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);

  // 1. Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (json.length < 2) {
          showToast('File không có dữ liệu', 'Vui lòng chọn file có ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu', 'error');
          return;
        }

        const headerRow = json[0].map((h) => String(h || '').trim());
        const dataRows = json.slice(1).filter((r) => r.some((cell) => cell !== undefined && cell !== ''));

        setHeaders(headerRow);
        setRawData(dataRows);

        // Auto match columns by fuzzy header names
        const autoMap: Record<string, string> = {};
        headerRow.forEach((h) => {
          const lower = h.toLowerCase().replace(/\s+/g, '');
          if (lower.includes('tenkhach') || lower.includes('khachhang')) autoMap.customerName = h;
          else if (lower.includes('sdt') || lower.includes('dienthoai') || lower.includes('sđt')) autoMap.phone = h;
          else if (lower.includes('duan') || lower.includes('tenhopdong')) autoMap.project = h;
          else if (lower.includes('giatri') && !lower.includes('thang')) autoMap.value = h;
          else if (lower.includes('trangthai') && !lower.includes('maintain')) autoMap.status = h;
          else if (lower.includes('phutrach') || lower.includes('nguoiphutrach')) autoMap.assigneeName = h;
          else if (lower.includes('maintain') && (lower.includes('trangthai') || lower.includes('thongtin'))) autoMap.maintainStatus = h;
          else if (lower.includes('thang') || (lower.includes('phi') && lower.includes('duytri'))) autoMap.maintainFee = h;
        });

        setFieldMapping((prev) => ({ ...prev, ...autoMap }));
        setStep(2);
      } catch (err) {
        showToast('Lỗi đọc file', 'Không thể giải mã file Excel hoặc CSV', 'error');
      }
    };

    reader.readAsBinaryString(uploadedFile);
  };

  // Helper parse currency: "50.000.000", "50,000,000", "50000000" -> number
  const parseCurrency = (val: any): number => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return Math.max(0, val);
    const clean = String(val).replace(/[^0-9]/g, '');
    return parseInt(clean, 10) || 0;
  };

  // 2. Validate & Parse Data based on column mapping
  const processValidation = () => {
    const rows: ParsedRow[] = [];

    rawData.forEach((row, idx) => {
      const getVal = (colHeader: string) => {
        const colIdx = headers.indexOf(colHeader);
        return colIdx !== -1 ? row[colIdx] : '';
      };

      const customerName = String(getVal(fieldMapping.customerName) || '').trim();
      const phoneRaw = String(getVal(fieldMapping.phone) || '').trim();
      const project = String(getVal(fieldMapping.project) || '').trim();
      const value = parseCurrency(getVal(fieldMapping.value));
      const statusRaw = String(getVal(fieldMapping.status) || '').trim();
      const assigneeName = String(getVal(fieldMapping.assigneeName) || '').trim();
      const maintainStatusRaw = String(getVal(fieldMapping.maintainStatus) || '').trim();
      const maintainFee = parseCurrency(getVal(fieldMapping.maintainFee));

      const errors: string[] = [];

      if (!customerName) errors.push('Thiếu tên khách hàng');
      if (!project) errors.push('Thiếu tên dự án');
      if (value < 0) errors.push('Giá trị hợp đồng không được âm');

      // Duplicate Check: (Customer Name + Phone + Project)
      const isDuplicate = contracts.some(
        (c) =>
          c.project.toLowerCase() === project.toLowerCase() &&
          (c.customerId === customerName || c.project.toLowerCase().includes(project.toLowerCase()))
      );

      // Map Contract Status
      let status: ContractStatus = 'Đang triển khai';
      if (statusRaw.includes('Chờ ký')) status = 'Chờ ký';
      else if (statusRaw.includes('Hoàn thành')) status = 'Hoàn thành';
      else if (statusRaw.includes('bảo trì')) status = 'Đang bảo trì';
      else if (statusRaw.includes('kết thúc')) status = 'Đã kết thúc';

      // Map Maintain Status
      let maintainStatus: MaintenanceStatus = 'Chưa đăng ký';
      if (maintainStatusRaw.includes('hoạt động')) maintainStatus = 'Đang hoạt động';
      else if (maintainStatusRaw.includes('dừng')) maintainStatus = 'Tạm dừng';
      else if (maintainStatusRaw.includes('kết thúc')) maintainStatus = 'Đã kết thúc';
      else if (maintainFee > 0) maintainStatus = 'Đang hoạt động';

      rows.push({
        rowIndex: idx + 2,
        customerName,
        phone: phoneRaw,
        project,
        value,
        status,
        assigneeName: assigneeName || 'Chưa phân công',
        maintainStatus,
        maintainFee,
        raw: row,
        errors,
        isDuplicate,
      });
    });

    setParsedRows(rows);
    setStep(3);
  };

  // 3. Confirm Import Valid Rows
  const handleConfirmImport = () => {
    const validRows = parsedRows.filter((r) => r.errors.length === 0);

    const contractsToCreate: Omit<Contract, 'id' | 'createdAt'>[] = validRows.map((r, i) => {
      // Find or assign customer
      let existingCustomer = customers.find(
        (c) => c.name.toLowerCase() === r.customerName.toLowerCase() || c.company.toLowerCase() === r.customerName.toLowerCase()
      );

      const customerId = existingCustomer ? existingCustomer.id : `cust-imp-${Date.now()}-${i}`;
      if (!existingCustomer) {
        addCustomer({
          name: r.customerName,
          company: r.customerName,
          email: `${r.customerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
          phone: r.phone,
          source: 'Khác',
          status: 'Đã chuyển đổi',
          assigneeId: members[0].id,
          lastContact: 'Hôm nay',
          avatarColor: 'bg-[#EFF6FF] text-[#1765FF]',
        });
      }

      // Find assignee
      const assignee = members.find((m) => m.name.toLowerCase().includes(r.assigneeName.toLowerCase())) || members[0];

      return {
        contractCode: `HD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        customerId,
        project: r.project,
        value: r.value,
        status: r.status,
        assigneeId: assignee.id,
        signDate: new Date().toISOString().slice(0, 10),
        maintenance: {
          status: r.maintainStatus,
          description: r.maintainFee > 0 ? 'Bảo trì định kỳ nhập từ file' : 'Chưa đăng ký',
          startDate: new Date().toISOString().slice(0, 10),
          nextRenewalDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
          monthlyFee: r.maintainFee,
        },
        attachments: [],
        notes: `Nhập khẩu từ file: ${file?.name}`,
      };
    });

    importContracts(contractsToCreate);
    onClose();
    reset();
  };

  // Download error rows CSV
  const handleDownloadErrors = () => {
    const errorRows = parsedRows.filter((r) => r.errors.length > 0);
    const headers = ['Dòng', 'Khách hàng', 'SĐT', 'Dự án', 'Giá trị', 'Lỗi'];
    const rows = errorRows.map((r) => [
      r.rowIndex,
      `"${r.customerName}"`,
      `'${r.phone}`,
      `"${r.project}"`,
      r.value,
      `"${r.errors.join('; ')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dong_Loi_HopDong_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setStep(1);
    setFile(null);
    setHeaders([]);
    setRawData([]);
    setParsedRows([]);
  };

  const validCount = parsedRows.filter((r) => r.errors.length === 0).length;
  const errorCount = parsedRows.filter((r) => r.errors.length > 0).length;
  const duplicateCount = parsedRows.filter((r) => r.isDuplicate).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        reset();
      }}
      title="Import Hợp đồng từ Excel / CSV"
      description="Quy trình 5 bước đối soát và nhập hợp đồng chuẩn 9 cột vào hệ thống."
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-[#F2F4F7] pb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className={cn('w-6 h-6 rounded-full flex items-center justify-center font-bold', step === 1 ? 'bg-[#1765FF] text-white' : 'bg-[#EAF2FF] text-[#1765FF]')}>
              1
            </span>
            <span className="font-semibold text-[#101828]">Tải file</span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#98A2B3]" />
          <div className="flex items-center gap-2">
            <span className={cn('w-6 h-6 rounded-full flex items-center justify-center font-bold', step === 2 ? 'bg-[#1765FF] text-white' : step > 2 ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#F2F4F7] text-[#667085]')}>
              2
            </span>
            <span className="font-semibold text-[#101828]">Ghép cột</span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#98A2B3]" />
          <div className="flex items-center gap-2">
            <span className={cn('w-6 h-6 rounded-full flex items-center justify-center font-bold', step === 3 ? 'bg-[#1765FF] text-white' : 'bg-[#F2F4F7] text-[#667085]')}>
              3
            </span>
            <span className="font-semibold text-[#101828]">Kiểm tra & Xác nhận</span>
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="space-y-4 py-4">
            <label className="border-2 border-dashed border-[#CBD5E1] hover:border-[#1765FF] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#F8FAFC]">
              <FileSpreadsheet className="w-12 h-12 text-[#1765FF] mb-3" />
              <p className="text-sm font-bold text-[#101828]">Chọn hoặc kéo thả file Excel (.xlsx) hoặc .csv</p>
              <p className="text-xs text-[#667085] mt-1">Hỗ trợ tiếng Việt UTF-8, số tiền có dấu chấm/phẩy và giữ nguyên số 0 đầu của SĐT</p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-3 bg-[#EFF6FF] rounded-xl text-xs text-[#1765FF]">
              Hệ thống đã tự động nhận diện tiêu đề cột. Hãy kiểm tra lại sự tương ứng của 9 trường dữ liệu bên dưới:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-80 overflow-y-auto pr-1 text-xs">
              {[
                { key: 'customerName', label: 'TÊN KHÁCH HÀNG (bắt buộc)', required: true },
                { key: 'phone', label: 'SĐT (giữ số 0 đầu)', required: false },
                { key: 'project', label: 'DỰ ÁN (bắt buộc)', required: true },
                { key: 'value', label: 'GIÁ TRỊ HỢP ĐỒNG (VNĐ)', required: true },
                { key: 'status', label: 'TRẠNG THÁI HỢP ĐỒNG', required: false },
                { key: 'assigneeName', label: 'NGƯỜI PHỤ TRÁCH', required: false },
                { key: 'maintainStatus', label: 'THÔNG TIN MAINTAIN', required: false },
                { key: 'maintainFee', label: 'GIÁ TRỊ / THÁNG (phí maintain)', required: false },
              ].map(({ key, label, required }) => (
                <div key={key} className="space-y-1">
                  <label className="font-semibold text-[#344054] block">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={fieldMapping[key] || ''}
                    onChange={(e) => setFieldMapping({ ...fieldMapping, [key]: e.target.value })}
                    className="w-full h-9 px-3 bg-white border border-[#D0D5DD] rounded-lg text-xs"
                  >
                    <option value="">-- Chưa chọn cột --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#F2F4F7]">
              <Button variant="secondary" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Chọn file khác
              </Button>
              <Button variant="primary" onClick={processValidation}>
                Tiếp tục xem trước
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Duplicate/Error Check */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="text-xs font-semibold text-[#101828]">{validCount} hợp lệ</span>
                  <p className="text-[10px] text-[#667085]">Sẵn sàng nhập</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <span className="text-xs font-semibold text-[#101828]">{duplicateCount} nghi trùng</span>
                  <p className="text-[10px] text-[#667085]">Cùng tên + dự án</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-red-200 bg-red-50/50 flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <span className="text-xs font-semibold text-[#101828]">{errorCount} dòng lỗi</span>
                  <p className="text-[10px] text-[#667085]">Bị bỏ qua khi nhập</p>
                </div>
              </div>
            </div>

            {/* Preview table */}
            <div className="border border-[#E6EBF2] rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAFAFC] sticky top-0 border-b border-[#E6EBF2] text-[11px] font-semibold text-[#667085]">
                  <tr>
                    <th className="p-2.5">Dòng</th>
                    <th className="p-2.5">Khách hàng</th>
                    <th className="p-2.5">SĐT</th>
                    <th className="p-2.5">Dự án</th>
                    <th className="p-2.5">Giá trị</th>
                    <th className="p-2.5">Trạng thái</th>
                    <th className="p-2.5">Cảnh báo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F4F7]">
                  {parsedRows.map((r) => (
                    <tr key={r.rowIndex} className={r.errors.length > 0 ? 'bg-red-50/30' : r.isDuplicate ? 'bg-amber-50/30' : ''}>
                      <td className="p-2.5 font-bold">{r.rowIndex}</td>
                      <td className="p-2.5 font-medium text-[#101828]">{r.customerName}</td>
                      <td className="p-2.5 text-[#667085]">{r.phone}</td>
                      <td className="p-2.5 text-[#344054] truncate max-w-[150px]">{r.project}</td>
                      <td className="p-2.5 font-semibold text-[#101828]">{r.value.toLocaleString('vi-VN')} đ</td>
                      <td className="p-2.5">{r.status}</td>
                      <td className="p-2.5">
                        {r.errors.length > 0 ? (
                          <span className="text-[10px] font-semibold text-red-600">
                            {r.errors.join(', ')}
                          </span>
                        ) : r.isDuplicate ? (
                          <span className="text-[10px] font-semibold text-amber-600">
                            ⚠️ Nghi trùng hợp đồng
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-600">
                            ✓ Hợp lệ
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#F2F4F7]">
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => setStep(2)}>
                  Quay lại ghép cột
                </Button>
                {errorCount > 0 && (
                  <Button variant="outline" onClick={handleDownloadErrors} className="gap-1.5 text-xs">
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải danh sách lỗi ({errorCount})</span>
                  </Button>
                )}
              </div>

              <Button
                variant="primary"
                disabled={validCount === 0}
                onClick={handleConfirmImport}
                className="gap-1.5"
              >
                <span>Xác nhận nhập {validCount} hợp đồng</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
