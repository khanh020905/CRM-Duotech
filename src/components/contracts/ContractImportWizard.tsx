'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Contract, ContractStatus, MaintenanceStatus, Member } from '@/types/crm';
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
  Layers,
  FileText,
} from 'lucide-react';

interface ContractImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

interface ParsedRow {
  rowIndex: number;
  customerName: string;
  phone: string;
  project: string;
  value: number;
  paidAmount: number;
  status: ContractStatus;
  assigneeName: string;
  maintainInfo: string;
  maintainFee: number;
  raw: any;
  errors: string[];
  isDuplicate: boolean;
}

export function ContractImportWizard({
  isOpen,
  onClose,
  onImportSuccess,
}: ContractImportWizardProps) {
  const { contracts, customers, members, importContracts, addCustomer, showToast } = useCRM();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);

  // Column Mapping
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({
    customerName: '',
    phone: '',
    project: '',
    value: '',
    paidAmount: '',
    status: '',
    assigneeName: '',
    maintainInfo: '',
    maintainFee: '',
  });

  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importResults, setImportResults] = useState<{ success: number; skipped: number } | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  // 1. Handle File Upload
  const processFile = (uploadedFile?: File) => {
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const data = new Uint8Array(buffer);
        const wb = XLSX.read(data, { type: 'array', codepage: 65001 });
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);
        const firstSheet = wb.SheetNames[0];
        setSelectedSheet(firstSheet);
        loadSheetData(wb, firstSheet);
      } catch (err) {
        console.error('Lỗi đọc file Excel/CSV:', err);
        showToast('Lỗi đọc file', 'Không thể đọc file Excel hoặc CSV này. Vui lòng kiểm tra lại định dạng.', 'error');
      }
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    processFile(uploadedFile);
  };

  const loadSheetData = (wb: XLSX.WorkBook, sName: string) => {
    const ws = wb.Sheets[sName];
    const json = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

    if (json.length < 2) {
      showToast('Sheet không có dữ liệu', 'Vui lòng chọn sheet có ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu', 'error');
      return;
    }

    const headerRow = json[0].map((h) => String(h || '').trim());
    const dataRows = json.slice(1).filter((r) => r && r.some((cell) => cell !== undefined && cell !== ''));

    setHeaders(headerRow);
    setRawData(dataRows);

    // Auto match columns by fuzzy header names
    const autoMap: Record<string, string> = {
      customerName: '',
      phone: '',
      project: '',
      value: '',
      status: '',
      assigneeName: '',
      maintainInfo: '',
      maintainFee: '',
    };

    headerRow.forEach((h) => {
      const lower = h.toLowerCase().replace(/\s+/g, '');
      if (lower.includes('tenkhach') || lower.includes('khachhang')) autoMap.customerName = h;
      else if (lower.includes('sdt') || lower.includes('dienthoai') || lower.includes('sđt')) autoMap.phone = h;
      else if (lower.includes('duan') || lower.includes('tenhopdong') || lower.includes('hangmuc')) autoMap.project = h;
      else if (lower.includes('giatri') && !lower.includes('thang')) autoMap.value = h;
      else if (lower.includes('dathu') || lower.includes('datra') || lower.includes('thanhtoan')) autoMap.paidAmount = h;
      else if (lower.includes('trangthai') && !lower.includes('maintain')) autoMap.status = h;
      else if (lower.includes('phutrach') || lower.includes('nguoiphutrach')) autoMap.assigneeName = h;
      else if (lower.includes('maintain') || lower.includes('duytri')) autoMap.maintainInfo = h;
      else if (lower.includes('thang') || lower.includes('phiduytri')) autoMap.maintainFee = h;
    });

    setFieldMapping(autoMap);
    setStep(2);
  };

  const handleSheetChange = (newSheet: string) => {
    setSelectedSheet(newSheet);
    if (workbook) {
      loadSheetData(workbook, newSheet);
    }
  };

  // Helper parse currency strings
  const parseNumericValue = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    // Replace dots and commas: e.g. "120.000.000", "120,000,000", "120000000 đ"
    const cleaned = String(val).replace(/[^0-9]/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? 0 : num;
  };

  // 2. Validate and Parse Rows
  const processValidation = () => {
    const custColIdx = headers.indexOf(fieldMapping.customerName);
    const phoneColIdx = headers.indexOf(fieldMapping.phone);
    const projColIdx = headers.indexOf(fieldMapping.project);
    const valColIdx = headers.indexOf(fieldMapping.value);
    const paidColIdx = headers.indexOf(fieldMapping.paidAmount);
    const statusColIdx = headers.indexOf(fieldMapping.status);
    const assigneeColIdx = headers.indexOf(fieldMapping.assigneeName);
    const maintainInfoColIdx = headers.indexOf(fieldMapping.maintainInfo);
    const maintainFeeColIdx = headers.indexOf(fieldMapping.maintainFee);

    const rows: ParsedRow[] = rawData.map((row, idx) => {
      const errors: string[] = [];

      // Customer Name
      const rawCustomerName = custColIdx !== -1 ? String(row[custColIdx] || '').trim() : '';
      if (!rawCustomerName) {
        errors.push('Thiếu Tên khách hàng (bắt buộc)');
      }

      // Phone
      const rawPhone = phoneColIdx !== -1 ? String(row[phoneColIdx] || '').trim() : '';

      // Project
      const rawProject = projColIdx !== -1 ? String(row[projColIdx] || '').trim() : '';
      if (!rawProject) {
        errors.push('Thiếu Tên dự án (bắt buộc)');
      }

      // Value
      const rawValue = valColIdx !== -1 ? parseNumericValue(row[valColIdx]) : 0;
      if (valColIdx !== -1 && row[valColIdx] !== undefined && row[valColIdx] !== '' && isNaN(rawValue)) {
        errors.push('Giá trị hợp đồng không đúng định dạng số');
      }

      // Status
      let rawStatus: ContractStatus = 'Đang triển khai';
      if (statusColIdx !== -1) {
        const sVal = String(row[statusColIdx] || '').trim();
        if (sVal === 'Chờ ký' || sVal === 'Đang triển khai' || sVal === 'Hoàn thành' || sVal === 'Đang bảo trì' || sVal === 'Đã kết thúc') {
          rawStatus = sVal;
        } else if (sVal) {
          rawStatus = 'Đang triển khai'; // fallback
        }
      }

      // Paid Amount
      const rawPaid = paidColIdx !== -1 ? parseNumericValue(row[paidColIdx]) : (rawStatus === 'Hoàn thành' ? rawValue : 0);

      // Assignee
      const rawAssignee = assigneeColIdx !== -1 ? String(row[assigneeColIdx] || '').trim() : '';

      // Maintain Info & Fee
      const rawMaintainInfo = maintainInfoColIdx !== -1 ? String(row[maintainInfoColIdx] || '').trim() : '';
      const rawMaintainFee = maintainFeeColIdx !== -1 ? parseNumericValue(row[maintainFeeColIdx]) : 0;

      // Duplicate Check: Khách hàng + SĐT + Dự án
      const isDuplicate = contracts.some(
        (c) =>
          (c.customerName?.toLowerCase() === rawCustomerName.toLowerCase() ||
            customers.find((cust) => cust.id === c.customerId)?.company.toLowerCase() === rawCustomerName.toLowerCase()) &&
          c.project.toLowerCase() === rawProject.toLowerCase() &&
          (rawPhone ? c.phone === rawPhone : true)
      );

      return {
        rowIndex: idx + 2,
        customerName: rawCustomerName,
        phone: rawPhone,
        project: rawProject,
        value: rawValue,
        paidAmount: rawPaid,
        status: rawStatus,
        assigneeName: rawAssignee,
        maintainInfo: rawMaintainInfo,
        maintainFee: rawMaintainFee,
        raw: row,
        errors,
        isDuplicate,
      };
    });

    setParsedRows(rows);
    setStep(3);
  };

  // 3. Confirm and Execute Import
  const handleExecuteImport = () => {
    // Only import valid and non-duplicate rows (or user-accepted rows)
    const validRows = parsedRows.filter((r) => r.errors.length === 0 && !r.isDuplicate);

    if (validRows.length === 0) {
      showToast('Không có dòng hợp lệ', 'Tất cả các dòng đều chứa lỗi hoặc bị trùng', 'error');
      return;
    }

    const contractsToInsert: Omit<Contract, 'id' | 'createdAt'>[] = validRows.map((r) => {
      // Find matching customer or generate ID
      let matchedCustomer = customers.find(
        (c) => c.company.toLowerCase() === r.customerName.toLowerCase() || c.name.toLowerCase() === r.customerName.toLowerCase()
      );

      let custId = matchedCustomer?.id;
      if (!custId) {
        custId = `cust-imp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        addCustomer({
          name: r.customerName,
          company: r.customerName,
          phone: r.phone || '0900000000',
          email: `${r.customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
          source: 'Website',
          status: 'Tiềm năng',
          assigneeId: members[0]?.id || 'user-1',
          lastContact: new Date().toLocaleDateString('vi-VN'),
        });
      }

      // Assignee matching
      const matchedAssignee = members.find((m) => m.name.toLowerCase() === r.assigneeName.toLowerCase());
      const assigneeId = matchedAssignee ? matchedAssignee.id : members[0]?.id || 'user-1';

      // Maintain status
      const hasMaintain = r.maintainFee > 0 || (r.maintainInfo && !r.maintainInfo.includes('Chưa đăng ký') && !r.maintainInfo.includes('Không'));
      const maintainStatus: MaintenanceStatus = hasMaintain ? 'Đang hoạt động' : 'Chưa đăng ký';

      const nextNum = contracts.length + 1;
      const code = `HD-2026-${String(nextNum).padStart(3, '0')}`;

      return {
        contractCode: code,
        customerId: custId,
        customerName: r.customerName,
        phone: r.phone,
        project: r.project,
        value: r.value,
        paidAmount: r.paidAmount || 0,
        status: r.status,
        assigneeId,
        signDate: new Date().toISOString().split('T')[0],
        maintenance: {
          status: maintainStatus,
          description: r.maintainInfo || (hasMaintain ? 'Hosting & Hỗ trợ' : 'Chưa đăng ký'),
          startDate: new Date().toISOString().split('T')[0],
          nextRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          monthlyFee: r.maintainFee,
        },
        attachments: [],
        history: [
          {
            id: `h-${Date.now()}`,
            timestamp: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            authorName: 'Hệ thống Import',
            action: 'Import từ Excel',
            details: `Nhập từ file: ${file?.name || 'Tài liệu'}`,
          },
        ],
      };
    });

    const insertedCount = importContracts(contractsToInsert);
    const skippedCount = parsedRows.length - insertedCount;
    setImportResults({ success: insertedCount, skipped: skippedCount });
    setStep(4);
    if (onImportSuccess) onImportSuccess();
  };

  // Download error rows as CSV
  const handleDownloadErrors = () => {
    const errorRows = parsedRows.filter((r) => r.errors.length > 0 || r.isDuplicate);
    if (errorRows.length === 0) return;

    const exportData = errorRows.map((r) => ({
      'Dòng': r.rowIndex,
      'Khách hàng': r.customerName,
      'SĐT': `\t${r.phone}`,
      'Dự án': r.project,
      'Giá trị': r.value,
      'Lỗi': r.errors.join('; ') + (r.isDuplicate ? ' (Nghi ngờ trùng lặp)' : ''),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Loi');
    XLSX.writeFile(wb, `Danh_Sach_Loi_Import_${Date.now()}.xlsx`);
  };

  if (!isOpen) return null;

  const validCount = parsedRows.filter((r) => r.errors.length === 0 && !r.isDuplicate).length;
  const errorCount = parsedRows.filter((r) => r.errors.length > 0).length;
  const duplicateCount = parsedRows.filter((r) => r.isDuplicate).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nhập hợp đồng từ Excel / CSV"
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Wizard Progress Stepper */}
        <div className="flex items-center justify-between border-b border-[#E6EBF2] pb-3 text-xs">
          {[
            { num: 1, label: 'Chọn file' },
            { num: 2, label: 'Ghép cột' },
            { num: 3, label: 'Kiểm tra & Xem trước' },
            { num: 4, label: 'Kết quả' },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-2 font-medium ${
                step === s.num
                  ? 'text-[#1765FF]'
                  : step > s.num
                  ? 'text-[#059669]'
                  : 'text-[#98A2B3]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === s.num
                    ? 'bg-[#1765FF] text-white'
                    : step > s.num
                    ? 'bg-[#059669] text-white'
                    : 'bg-[#F2F4F7] text-[#667085]'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* STEP 1: Upload File */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const droppedFile = e.dataTransfer.files?.[0];
                processFile(droppedFile);
              }}
              className={`border-2 border-dashed transition-all rounded-2xl p-8 text-center cursor-pointer ${
                isDragging
                  ? 'border-[#1765FF] bg-[#EFF6FF]'
                  : 'border-[#D0D5DD] hover:border-[#1765FF] hover:bg-[#F8FAFC]'
              }`}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInputChange}
                className="hidden"
                id="excel-file-input"
              />
              <label htmlFor="excel-file-input" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#1765FF] flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-[#101828]">
                  {file ? `Đã chọn: ${file.name}` : 'Nhấp để tải file hoặc kéo thả vào đây'}
                </span>
                <span className="text-xs text-[#667085] mt-1">
                  Định dạng hỗ trợ: .xlsx, .xls, .csv (UTF-8 tiếng Việt)
                </span>
              </label>
            </div>

            <div className="p-4 bg-[#F8FAFC] border border-[#E6EBF2] rounded-xl flex items-center justify-between text-xs text-[#667085]">
              <span>Cần file mẫu chuẩn 9 cột để điền dữ liệu?</span>
              <a
                href="#sample"
                onClick={(e) => {
                  e.preventDefault();
                  // Sample data creation
                  const sampleData = [
                    {
                      STT: 1,
                      'TÊN KHÁCH HÀNG': 'Công ty Minh Gia',
                      'SDT': '0901234567',
                      'DỰ ÁN': 'Website doanh nghiệp',
                      'GIÁ TRỊ': 120000000,
                      'ĐÃ THU': 60000000,
                      'CÒN LẠI': 60000000,
                      'TRẠNG THÁI': 'Đang triển khai',
                      'NGƯỜI PHỤ TRÁCH': 'Quốc Khánh',
                      'THÔNG TIN MAINTAIN': 'Hosting + backup',
                      'GIÁ TRỊ / THÁNG': 1500000,
                    },
                    {
                      STT: 2,
                      'TÊN KHÁCH HÀNG': 'Trung tâm Anh Việt',
                      'SDT': '0912345678',
                      'DỰ ÁN': 'Nền tảng học trực tuyến',
                      'GIÁ TRỊ': 250000000,
                      'ĐÃ THU': 250000000,
                      'CÒN LẠI': 0,
                      'TRẠNG THÁI': 'Đang bảo trì',
                      'NGƯỜI PHỤ TRÁCH': 'Thu Hà',
                      'THÔNG TIN MAINTAIN': 'Server + hỗ trợ',
                      'GIÁ TRỊ / THÁNG': 3000000,
                    },
                  ];
                  const ws = XLSX.utils.json_to_sheet(sampleData);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'HopDongMau');
                  XLSX.writeFile(wb, 'Mau_Hop_Dong_Duotech_CRM.xlsx');
                }}
                className="font-bold text-[#1765FF] hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải file mẫu (.xlsx)</span>
              </a>
            </div>
          </div>
        )}

        {/* STEP 2: Column Mapping & Sheet Select */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            {sheetNames.length > 1 && (
              <div className="p-3 bg-[#EFF6FF] border border-[#B2CCFF] rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1E40AF] flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> File có nhiều sheet, chọn sheet để nhập:
                </span>
                <select
                  value={selectedSheet}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  className="h-8 px-3 bg-white border border-[#B2CCFF] rounded-lg text-xs font-semibold text-[#1E40AF]"
                >
                  {sheetNames.map((sn) => (
                    <option key={sn} value={sn}>
                      {sn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <p className="text-xs text-[#667085]">
              Ghép các cột trong file nguồn vào 9 trường chuẩn của hệ thống:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1 text-xs">
              {[
                { field: 'customerName', label: 'TÊN KHÁCH HÀNG', required: true },
                { field: 'phone', label: 'SDT (Số điện thoại)', required: false },
                { field: 'project', label: 'DỰ ÁN', required: true },
                { field: 'value', label: 'GIÁ TRỊ HỢP ĐỒNG', required: false },
                { field: 'paidAmount', label: 'ĐÃ THU', required: false },
                { field: 'status', label: 'TRẠNG THÁI', required: false },
                { field: 'assigneeName', label: 'NGƯỜI PHỤ TRÁCH', required: false },
                { field: 'maintainInfo', label: 'THÔNG TIN MAINTAIN', required: false },
                { field: 'maintainFee', label: 'GIÁ TRỊ / THÁNG (Phí duy trì)', required: false },
              ].map(({ field, label, required }) => (
                <div key={field} className="p-2.5 bg-[#F8FAFC] border border-[#E6EBF2] rounded-xl">
                  <label className="block font-semibold text-[#344054] mb-1">
                    {label} {required && <span className="text-[#DC2626]">*</span>}
                  </label>
                  <select
                    value={fieldMapping[field] || ''}
                    onChange={(e) =>
                      setFieldMapping({ ...fieldMapping, [field]: e.target.value })
                    }
                    className="w-full h-8 px-2.5 bg-white border border-[#D0D5DD] rounded-lg text-xs text-[#101828] focus:outline-none focus:ring-1 focus:ring-[#1765FF]"
                  >
                    <option value="">-- Bỏ qua --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E6EBF2]">
              <Button variant="secondary" onClick={() => setStep(1)}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Chọn file khác
              </Button>
              <Button
                variant="primary"
                disabled={!fieldMapping.customerName || !fieldMapping.project}
                onClick={processValidation}
              >
                Tiếp tục kiểm tra
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Preview & Validation */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            {/* KPI Counts */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-[#F8FAFC] border border-[#E6EBF2] rounded-xl">
                <span className="text-[#667085] block">Tổng số dòng</span>
                <span className="text-base font-bold text-[#101828]">{parsedRows.length}</span>
              </div>
              <div className="p-2 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-[#059669]">
                <span className="block">Hợp lệ</span>
                <span className="text-base font-bold">{validCount}</span>
              </div>
              <div className="p-2 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#DC2626]">
                <span className="block">Lỗi</span>
                <span className="text-base font-bold">{errorCount}</span>
              </div>
              <div className="p-2 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-[#D97706]">
                <span className="block">Nghi trùng</span>
                <span className="text-base font-bold">{duplicateCount}</span>
              </div>
            </div>

            {/* Error / Warning Alert */}
            {(errorCount > 0 || duplicateCount > 0) && (
              <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl flex items-center justify-between text-xs text-[#92400E]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706]" />
                  <span>
                    Phát hiện <strong>{errorCount}</strong> dòng lỗi và <strong>{duplicateCount}</strong> dòng nghi trùng lặp. Các dòng này sẽ được bỏ qua khi nhập.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadErrors}
                  className="font-bold underline hover:text-[#78350F] shrink-0"
                >
                  Tải danh sách lỗi
                </button>
              </div>
            )}

            {/* Preview Table */}
            <div className="border border-[#E6EBF2] rounded-xl overflow-x-auto max-h-[40vh]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F8FAFC] sticky top-0 border-b border-[#E6EBF2] text-[11px] font-semibold text-[#667085]">
                  <tr>
                    <th className="p-2 text-center w-12">Dòng</th>
                    <th className="p-2">Trạng thái</th>
                    <th className="p-2">Khách hàng</th>
                    <th className="p-2">SĐT</th>
                    <th className="p-2">Dự án</th>
                    <th className="p-2 text-right">Giá trị</th>
                    <th className="p-2">Lỗi phát hiện</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F4F7]">
                  {parsedRows.map((r) => (
                    <tr
                      key={r.rowIndex}
                      className={r.errors.length > 0 ? 'bg-[#FEF2F2]/40' : r.isDuplicate ? 'bg-[#FFFBEB]/40' : ''}
                    >
                      <td className="p-2 text-center font-mono text-[#667085]">{r.rowIndex}</td>
                      <td className="p-2 whitespace-nowrap">
                        {r.errors.length > 0 ? (
                          <span className="text-[#DC2626] font-semibold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Lỗi
                          </span>
                        ) : r.isDuplicate ? (
                          <span className="text-[#D97706] font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Nghi trùng
                          </span>
                        ) : (
                          <span className="text-[#059669] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ
                          </span>
                        )}
                      </td>
                      <td className="p-2 font-medium text-[#101828] whitespace-nowrap">{r.customerName || '—'}</td>
                      <td className="p-2 font-mono whitespace-nowrap">{r.phone || '—'}</td>
                      <td className="p-2 truncate max-w-[150px]">{r.project || '—'}</td>
                      <td className="p-2 text-right font-medium whitespace-nowrap">
                        {r.value.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="p-2 text-[#DC2626]">
                        {r.errors.join(', ')}
                        {r.isDuplicate && (r.errors.length > 0 ? ' • ' : '') + 'Đã trùng khách hàng + dự án'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E6EBF2]">
              <Button variant="secondary" onClick={() => setStep(2)}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Sửa ghép cột
              </Button>
              <Button
                variant="primary"
                disabled={validCount === 0}
                onClick={handleExecuteImport}
              >
                Nhập {validCount} hợp đồng hợp lệ
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Results */}
        {step === 4 && importResults && (
          <div className="space-y-4 text-center py-6 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#101828]">Hoàn tất nhập dữ liệu!</h3>
              <p className="text-xs text-[#667085] mt-1">
                Đã thêm thành công <strong>{importResults.success}</strong> hợp đồng vào hệ thống.
                {importResults.skipped > 0 && ` Đã bỏ qua ${importResults.skipped} dòng lỗi / nghi trùng.`}
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Button variant="primary" onClick={onClose}>
                Đóng và xem danh sách hợp đồng
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
