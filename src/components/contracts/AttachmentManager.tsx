'use client';

import React, { useState, useRef } from 'react';
import { ContractAttachment } from '@/types/crm';
import { saveAttachmentBlob, getAttachmentBlob, deleteAttachmentBlob } from '@/lib/storage';
import { formatDate } from '@/lib/utils';
import {
  Upload,
  FileText,
  Trash2,
  Download,
  Eye,
  X,
  AlertCircle,
  FileCode,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface AttachmentManagerProps {
  attachments: ContractAttachment[];
  onChange: (attachments: ContractAttachment[]) => void;
  readOnly?: boolean;
}

export function AttachmentManager({
  attachments,
  onChange,
  readOnly = false,
}: AttachmentManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewItem, setPreviewItem] = useState<{ name: string; url: string; type: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setErrorMsg(null);

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const newItems: ContractAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate type
      const isAllowed =
        allowedTypes.includes(file.type) ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.doc') ||
        file.name.endsWith('.docx');

      if (!isAllowed) {
        setErrorMsg('Chỉ hỗ trợ tải lên tài liệu định dạng PDF, DOC, DOCX');
        continue;
      }

      // Max 25 MB
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg(`Tệp "${file.name}" vượt quá dung lượng tối đa (25 MB)`);
        continue;
      }

      const id = `att-${Date.now()}-${i}`;
      try {
        await saveAttachmentBlob(id, file);
        newItems.push({
          id,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          uploadDate: new Date().toISOString(),
          blobKey: id,
        });
      } catch (err) {
        console.error('Lỗi khi lưu tệp vào IndexedDB', err);
        setErrorMsg('Không thể lưu trữ tệp vào bộ nhớ trình duyệt (hết dung lượng hoặc bị chặn)');
      }
    }

    if (newItems.length > 0) {
      onChange([...attachments, ...newItems]);
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAttachmentBlob(id);
    } catch (e) {
      console.warn('Lỗi xóa blob:', e);
    }
    onChange(attachments.filter((a) => a.id !== id));
  };

  const handlePreviewOrDownload = async (item: ContractAttachment, preview = false) => {
    try {
      const blobData = await getAttachmentBlob(item.id);
      if (blobData && blobData.dataUrl) {
        if (preview && item.name.toLowerCase().endsWith('.pdf')) {
          setPreviewItem({ name: item.name, url: blobData.dataUrl, type: item.type });
        } else {
          // Download
          const a = document.createElement('a');
          a.href = blobData.dataUrl;
          a.download = item.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } else {
        // Fallback demo mock download if blob was created from mock
        alert(`Tải xuống tệp mẫu demo: ${item.name} (${formatFileSize(item.size)})`);
      }
    } catch (e) {
      console.error('Không thể mở tệp đính kèm', e);
      alert('Không thể mở tệp này. Tệp có thể đã bị xóa khỏi bộ nhớ trình duyệt.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {!readOnly && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileUpload(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#D0D5DD] hover:border-[#1765FF] hover:bg-[#F8FAFC] transition-all rounded-xl p-5 text-center cursor-pointer group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#1765FF] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#101828]">
                Nhấp để tải lên hoặc kéo thả tệp hợp đồng
              </p>
              <p className="text-xs text-[#667085] mt-0.5">
                Hỗ trợ PDF, Word (DOC, DOCX). Dung lượng tối đa 25 MB/tệp.
              </p>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl text-xs text-[#DC2626] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Storage Disclaimer Badge */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#F6F8FC] border border-[#E6EBF2] rounded-xl text-xs text-[#667085]">
        <AlertCircle className="w-4 h-4 text-[#1765FF] shrink-0" />
        <span>
          <strong>Lưu trữ Demo:</strong> Tệp được lưu trực tiếp trên trình duyệt của bạn qua <em>IndexedDB</em>, hoàn toàn bảo mật và không tải lên máy chủ ngoài.
        </span>
      </div>

      {/* Attachments List */}
      <div className="space-y-2">
        <h5 className="text-xs font-semibold text-[#344054]">
          Danh sách tệp đính kèm ({attachments.length})
        </h5>

        {attachments.length === 0 ? (
          <p className="text-xs text-[#98A2B3] italic py-2">Chưa có tệp tài liệu nào được đính kèm.</p>
        ) : (
          <div className="space-y-2">
            {attachments.map((item) => {
              const isPdf = item.name.toLowerCase().endsWith('.pdf');
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-white border border-[#E6EBF2] rounded-xl hover:border-[#B2CCFF] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isPdf ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#EFF6FF] text-[#1765FF]'
                    }`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#101828] truncate max-w-xs sm:max-w-md">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[#667085] mt-0.5">
                        {formatFileSize(item.size)} • Tải lên: {formatDate(item.uploadDate)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isPdf && (
                      <button
                        type="button"
                        onClick={() => handlePreviewOrDownload(item, true)}
                        className="p-1.5 text-[#667085] hover:text-[#1765FF] hover:bg-[#EFF6FF] rounded-lg transition-colors"
                        title="Xem trước PDF"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handlePreviewOrDownload(item, false)}
                      className="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] rounded-lg transition-colors"
                      title="Tải xuống tệp"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-[#667085] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                        title="Xóa tệp"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {previewItem && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewItem(null)}
          title={`Xem trước: ${previewItem.name}`}
          maxWidth="2xl"
        >
          <div className="h-[520px] w-full border border-[#E6EBF2] rounded-xl overflow-hidden bg-slate-100">
            <iframe
              src={previewItem.url}
              className="w-full h-full border-none"
              title="PDF Preview"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
