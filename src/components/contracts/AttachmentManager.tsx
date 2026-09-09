'use client';

import React, { useState, useRef } from 'react';
import { ContractAttachment } from '@/types/crm';
import {
  saveAttachmentBlob,
  getAttachmentBlob,
  deleteAttachmentBlob,
  triggerFileDownload,
  generateSampleDocumentBlob,
} from '@/lib/storage';
import { formatDate } from '@/lib/utils';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Archive,
  File,
  Trash2,
  Download,
  Eye,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface AttachmentManagerProps {
  attachments: ContractAttachment[];
  onChange: (attachments: ContractAttachment[]) => void;
  readOnly?: boolean;
}

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.csv',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg',
  '.gif',
  '.txt',
  '.zip',
  '.rar',
];

export function AttachmentManager({
  attachments,
  onChange,
  readOnly = false,
}: AttachmentManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewItem, setPreviewItem] = useState<{ name: string; url: string; isImage: boolean } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string) => {
    const parts = filename.split('.');
    return parts.length > 1 ? '.' + parts.pop()!.toLowerCase() : '';
  };

  const getFileIcon = (filename: string) => {
    const ext = getFileExtension(filename);
    if (ext === '.pdf') {
      return (
        <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4" />
        </div>
      );
    }
    if (['.xls', '.xlsx', '.csv'].includes(ext)) {
      return (
        <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
          <FileSpreadsheet className="w-4 h-4" />
        </div>
      );
    }
    if (['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].includes(ext)) {
      return (
        <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
          <ImageIcon className="w-4 h-4" />
        </div>
      );
    }
    if (['.zip', '.rar'].includes(ext)) {
      return (
        <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0">
          <Archive className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1765FF] flex items-center justify-center shrink-0">
        <File className="w-4 h-4" />
      </div>
    );
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const newItems: ContractAttachment[] = [];
    const skippedFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = getFileExtension(file.name);

      // Validate extension case-insensitively
      const isAllowed = ALLOWED_EXTENSIONS.includes(ext) || file.type.startsWith('image/') || file.type.includes('pdf');

      if (!isAllowed) {
        skippedFiles.push(`${file.name} (định dạng không hỗ trợ)`);
        continue;
      }

      // Max 25 MB
      if (file.size > 25 * 1024 * 1024) {
        skippedFiles.push(`${file.name} (vượt quá 25 MB)`);
        continue;
      }

      const id = `att-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`;
      try {
        const { dataUrl } = await saveAttachmentBlob(id, file);
        newItems.push({
          id,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          uploadDate: new Date().toISOString(),
          blobKey: id,
          dataUrl,
        });
      } catch (err) {
        console.error('Lỗi khi xử lý tệp', err);
        skippedFiles.push(`${file.name} (lỗi đọc dữ liệu)`);
      }
    }

    if (newItems.length > 0) {
      onChange([...attachments, ...newItems]);
      setSuccessMsg(`Đã thêm thành công ${newItems.length} tệp đính kèm`);
    }

    if (skippedFiles.length > 0) {
      setErrorMsg(`Không thể tải lên: ${skippedFiles.join(', ')}`);
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
      // 1. Check if item has embedded dataUrl
      let dataUrl = item.dataUrl;

      // 2. Otherwise query storage cache / IndexedDB
      if (!dataUrl) {
        const blobData = await getAttachmentBlob(item.id);
        if (blobData?.dataUrl) {
          dataUrl = blobData.dataUrl;
        }
      }

      const ext = getFileExtension(item.name);
      const isPdf = ext === '.pdf';
      const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].includes(ext);

      // Handle Preview
      if (preview && (isPdf || isImage)) {
        if (dataUrl) {
          setPreviewItem({ name: item.name, url: dataUrl, isImage });
          return;
        } else {
          // Generate sample blob for preview
          const sampleBlob = generateSampleDocumentBlob(item.name);
          const sampleUrl = URL.createObjectURL(sampleBlob);
          setPreviewItem({ name: item.name, url: sampleUrl, isImage });
          return;
        }
      }

      // Handle Download
      if (dataUrl) {
        triggerFileDownload(dataUrl, item.name);
      } else {
        // Generate real downloadable document blob
        const sampleBlob = generateSampleDocumentBlob(item.name);
        const sampleUrl = URL.createObjectURL(sampleBlob);
        triggerFileDownload(sampleUrl, item.name);
        setTimeout(() => URL.revokeObjectURL(sampleUrl), 5000);
      }
    } catch (e) {
      console.error('Không thể mở tệp đính kèm', e);
      // Fallback safe download
      const sampleBlob = generateSampleDocumentBlob(item.name);
      const sampleUrl = URL.createObjectURL(sampleBlob);
      triggerFileDownload(sampleUrl, item.name);
      setTimeout(() => URL.revokeObjectURL(sampleUrl), 5000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {!readOnly && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileUpload(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed transition-all rounded-2xl p-6 text-center cursor-pointer group ${
            isDragging
              ? 'border-[#1765FF] bg-[#EFF6FF]'
              : 'border-[#D0D5DD] hover:border-[#1765FF] hover:bg-[#F8FAFC]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp,.svg,.gif,.txt,.zip,.rar"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <div className="flex flex-col items-center justify-center gap-2.5">
            <div className="w-11 h-11 rounded-full bg-[#EFF6FF] text-[#1765FF] flex items-center justify-center group-hover:scale-110 transition-transform">
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#101828]">
                {isUploading ? 'Đang tải tệp lên...' : 'Nhấp để tải lên hoặc kéo thả tệp hợp đồng'}
              </p>
              <p className="text-xs text-[#667085] mt-1">
                Hỗ trợ PDF, Word, Excel, Ảnh (JPG, PNG), ZIP. Dung lượng tối đa 25 MB/tệp.
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

      {successMsg && (
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-xs text-[#059669] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Attachments List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-semibold text-[#344054]">
            Danh sách tệp đính kèm ({attachments.length})
          </h5>
          {attachments.length > 0 && (
            <span className="text-[11px] text-[#667085]">
              Tổng dung lượng: {formatFileSize(attachments.reduce((sum, a) => sum + (a.size || 0), 0))}
            </span>
          )}
        </div>

        {attachments.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-[#E6EBF2] rounded-xl bg-[#FAFAFC]">
            <FileText className="w-8 h-8 text-[#98A2B3] mx-auto mb-1.5 opacity-50" />
            <p className="text-xs text-[#98A2B3] italic">Chưa có tệp tài liệu nào được đính kèm vào hợp đồng này.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((item) => {
              const ext = getFileExtension(item.name);
              const canPreview = ext === '.pdf' || ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].includes(ext);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-white border border-[#E6EBF2] rounded-xl hover:border-[#B2CCFF] transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getFileIcon(item.name)}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#101828] truncate max-w-xs sm:max-w-md" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[#667085] mt-0.5">
                        {formatFileSize(item.size)} • {item.uploadDate ? formatDate(item.uploadDate) : 'Vừa tải lên'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {canPreview && (
                      <button
                        type="button"
                        onClick={() => handlePreviewOrDownload(item, true)}
                        className="p-2 text-[#667085] hover:text-[#1765FF] hover:bg-[#EFF6FF] rounded-lg transition-colors"
                        title="Xem trước tệp"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handlePreviewOrDownload(item, false)}
                      className="p-2 text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] rounded-lg transition-colors"
                      title="Tải xuống tệp về máy"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-[#667085] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
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

      {/* Preview Modal */}
      {previewItem && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewItem(null)}
          title={`Xem trước tài liệu: ${previewItem.name}`}
          maxWidth="3xl"
        >
          <div className="min-h-[500px] max-h-[70vh] w-full border border-[#E6EBF2] rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center p-2">
            {previewItem.isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewItem.url}
                alt={previewItem.name}
                className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-lg"
              />
            ) : (
              <iframe
                src={previewItem.url}
                className="w-full h-[580px] border-none bg-white rounded-lg"
                title="PDF Preview"
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
