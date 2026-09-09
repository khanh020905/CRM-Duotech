'use client';

import React, { useState, useMemo } from 'react';
import { Member, MemberRole, Contract, Task, Deal } from '@/types/crm';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Search,
  Plus,
  MoreHorizontal,
  Shield,
  UserCheck,
  UserX,
  ArrowRightLeft,
  AlertTriangle,
  Edit2,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface MembersSettingsProps {
  members: Member[];
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onUpdateMember: (id: string, updates: Partial<Member>) => void;
  canDisableMember: (id: string) => {
    canDisable: boolean;
    reason?: string;
    linkedContractsCount: number;
    linkedTasksCount: number;
    linkedDealsCount: number;
  };
  onToggleStatus: (id: string) => boolean;
  onReassignWork: (fromMemberId: string, toMemberId: string) => void;
  onDeleteMember?: (id: string) => boolean;
}

export function MembersSettings({
  members,
  onAddMember,
  onUpdateMember,
  canDisableMember,
  onToggleStatus,
  onReassignWork,
  onDeleteMember,
}: MembersSettingsProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [reassignModalMember, setReassignModalMember] = useState<Member | null>(null);
  const [targetReassignId, setTargetReassignId] = useState('');
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // Add Member Form
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<MemberRole>('Nhân viên kinh doanh');

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (roleFilter !== 'all' && m.role !== roleFilter) return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.phone.includes(q)
        );
      }
      return true;
    });
  }, [members, search, roleFilter, statusFilter]);

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    onAddMember({
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim() || '0900 000 000',
      role: formRole,
      initials: formName
        .split(' ')
        .map((p) => p[0])
        .slice(-2)
        .join('')
        .toUpperCase(),
      status: 'Hoạt động',
      joinedDate: new Date().toLocaleDateString('vi-VN'),
    });

    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('Nhân viên kinh doanh');
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    // Check if demoting the last admin
    if (editingMember.role !== 'Quản trị viên') {
      const check = canDisableMember(editingMember.id);
      if (!check.canDisable && check.reason?.includes('quản trị viên')) {
        alert(check.reason);
        return;
      }
    }

    onUpdateMember(editingMember.id, {
      name: editingMember.name,
      email: editingMember.email,
      phone: editingMember.phone,
      role: editingMember.role,
    });
    setEditingMember(null);
  };

  const handleConfirmReassign = () => {
    if (!reassignModalMember || !targetReassignId) return;
    onReassignWork(reassignModalMember.id, targetReassignId);
    setReassignModalMember(null);
    setTargetReassignId('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#E6EBF2] shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#101828]">Thành viên đội ngũ</h3>
            <p className="text-xs text-[#667085] mt-0.5">
              Quản lý tài khoản nhân sự, phân công vai trò và bàn giao trách nhiệm phụ trách.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold bg-[#1765FF] hover:bg-[#155BE5] text-white self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm người phụ trách</span>
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm thành viên theo tên, email..."
              className="w-full pl-9 pr-3 py-2 bg-[#F6F8FC] border border-[#E6EBF2] rounded-xl text-xs sm:text-sm text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 px-3 bg-[#F6F8FC] border border-[#E6EBF2] rounded-xl text-xs sm:text-sm text-[#344054] focus:outline-none"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="Quản trị viên">Quản trị viên</option>
            <option value="Quản lý kinh doanh">Quản lý kinh doanh</option>
            <option value="Nhân viên kinh doanh">Nhân viên kinh doanh</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 bg-[#F6F8FC] border border-[#E6EBF2] rounded-xl text-xs sm:text-sm text-[#344054] focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Hoạt động">Đang hoạt động</option>
            <option value="Tạm khóa">Tạm ngưng</option>
          </select>
        </div>

        {/* Members Table */}
        <div className="border border-[#E6EBF2] rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E6EBF2] text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                <th className="py-3 px-4">THÀNH VIÊN</th>
                <th className="py-3 px-4">EMAIL / SĐT</th>
                <th className="py-3 px-4">VAI TRÒ</th>
                <th className="py-3 px-4">TRẠNG THÁI</th>
                <th className="py-3 px-4">NGÀY THAM GIA</th>
                <th className="py-3 px-4 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F7]">
              {filteredMembers.map((m) => {
                const isPaused = m.status === 'Tạm khóa';
                const check = canDisableMember(m.id);

                return (
                  <tr key={m.id} className="hover:bg-[#F8FAFC] transition-colors">
                    {/* Member */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} src={m.avatarUrl} size="md" />
                        <div>
                          <p className="font-semibold text-sm text-[#101828]">{m.name}</p>
                          <p className="text-[11px] text-[#667085]">{m.role}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email / Phone */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="text-[#101828] font-medium">{m.email}</p>
                      <p className="text-[#667085] font-mono text-[11px]">{m.phone}</p>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F2F4F7] text-[#344054]">
                        <Shield className="w-3 h-3 text-[#1765FF]" />
                        {m.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isPaused
                            ? 'bg-[#FEF2F2] text-[#DC2626]'
                            : 'bg-[#ECFDF5] text-[#059669]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-[#DC2626]' : 'bg-[#059669]'}`} />
                        {isPaused ? 'Tạm ngưng' : 'Đang hoạt động'}
                      </span>
                    </td>

                    {/* Join Date */}
                    <td className="py-3.5 px-4 text-[#667085] whitespace-nowrap">
                      {m.joinedDate || '15/01/2025'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Role */}
                        <button
                          type="button"
                          onClick={() => setEditingMember(m)}
                          className="p-1.5 text-[#667085] hover:text-[#1765FF] hover:bg-[#EFF6FF] rounded-lg transition-colors"
                          title="Sửa thông tin / vai trò"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Reassign Work */}
                        <button
                          type="button"
                          onClick={() => {
                            setReassignModalMember(m);
                            const other = members.find((x) => x.id !== m.id && x.status === 'Hoạt động');
                            setTargetReassignId(other?.id || '');
                          }}
                          className="p-1.5 text-[#667085] hover:text-[#7C3AED] hover:bg-[#F5F3FF] rounded-lg transition-colors"
                          title="Bàn giao công việc cho người khác"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>

                        {/* Toggle Status (Pause / Activate) */}
                        <button
                          type="button"
                          onClick={() => onToggleStatus(m.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isPaused
                              ? 'text-[#059669] hover:bg-[#ECFDF5]'
                              : 'text-[#667085] hover:text-[#DC2626] hover:bg-[#FEF2F2]'
                          }`}
                          title={isPaused ? 'Kích hoạt lại' : 'Tạm ngưng thành viên'}
                        >
                          {isPaused ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </button>

                        {/* Delete Member */}
                        {onDeleteMember && (
                          <button
                            type="button"
                            onClick={() => setMemberToDelete(m)}
                            className="p-1.5 text-[#667085] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                            title="Xóa thành viên"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Thêm người phụ trách */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Thêm người phụ trách mới"
          maxWidth="md"
        >
          <form onSubmit={handleCreateMember} className="space-y-4">
            <div className="p-3 bg-[#EFF6FF] border border-[#B2CCFF] rounded-xl text-xs text-[#1E40AF]">
              <strong>Môi trường Demo:</strong> Thành viên mới sẽ được tạo trực tiếp vào dữ liệu cục bộ. Hệ thống không gửi email xác thực hay email mời thật.
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Họ và tên <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ví dụ: Hoàng Minh Tuấn"
                className="w-full h-9 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Email công việc <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="tuanhm@duotech.vn"
                className="w-full h-9 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="0912 333 444"
                className="w-full h-9 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Vai trò
              </label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as MemberRole)}
                className="w-full h-9 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1765FF]/20"
              >
                <option value="Quản trị viên">Quản trị viên (Toàn quyền hệ thống)</option>
                <option value="Quản lý kinh doanh">Quản lý kinh doanh (Xem báo cáo & điều phối)</option>
                <option value="Nhân viên kinh doanh">Nhân viên kinh doanh (Chăm sóc khách hàng & chốt hợp đồng)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E6EBF2]">
              <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                Thêm thành viên
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Sửa thành viên */}
      {editingMember && (
        <Modal
          isOpen={Boolean(editingMember)}
          onClose={() => setEditingMember(null)}
          title={`Chỉnh sửa thành viên: ${editingMember.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Họ và tên</label>
              <input
                type="text"
                value={editingMember.name}
                onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Email</label>
              <input
                type="email"
                value={editingMember.email}
                onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Số điện thoại</label>
              <input
                type="text"
                value={editingMember.phone}
                onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Vai trò</label>
              <select
                value={editingMember.role}
                onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as MemberRole })}
                className="w-full h-9 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none"
              >
                <option value="Quản trị viên">Quản trị viên</option>
                <option value="Quản lý kinh doanh">Quản lý kinh doanh</option>
                <option value="Nhân viên kinh doanh">Nhân viên kinh doanh</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E6EBF2]">
              <Button variant="secondary" onClick={() => setEditingMember(null)}>
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Bàn giao công việc (Reassign Work) */}
      {reassignModalMember && (
        <Modal
          isOpen={Boolean(reassignModalMember)}
          onClose={() => setReassignModalMember(null)}
          title="Bàn giao công việc & hợp đồng"
          maxWidth="md"
        >
          <div className="space-y-4">
            {(() => {
              const check = canDisableMember(reassignModalMember.id);
              return (
                <div className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-xs text-[#92400E] space-y-1.5">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                    <span>Xác nhận khối lượng công việc bàn giao:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[#B45309]">
                    <li>
                      Hợp đồng đang phụ trách: <strong>{check.linkedContractsCount}</strong>
                    </li>
                    <li>
                      Công việc chưa hoàn thành: <strong>{check.linkedTasksCount}</strong>
                    </li>
                    <li>
                      Cơ hội bán hàng đang mở: <strong>{check.linkedDealsCount}</strong>
                    </li>
                  </ul>
                  <p className="text-[11px] pt-1">
                    Toàn bộ các mục trên từ <strong>{reassignModalMember.name}</strong> sẽ được chuyển quyền phụ trách sang nhân sự mới được chọn.
                  </p>
                </div>
              );
            })()}

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Chọn nhân sự tiếp nhận bàn giao:
              </label>
              <select
                value={targetReassignId}
                onChange={(e) => setTargetReassignId(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-[#D0D5DD] rounded-xl text-xs sm:text-sm text-[#101828] focus:outline-none"
              >
                {members
                  .filter((m) => m.id !== reassignModalMember.id && m.status === 'Hoạt động')
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E6EBF2]">
              <Button variant="secondary" onClick={() => setReassignModalMember(null)}>
                Hủy
              </Button>
              <Button variant="primary" disabled={!targetReassignId} onClick={handleConfirmReassign}>
                Xác nhận chuyển giao
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Xác nhận xóa thành viên */}
      {memberToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setMemberToDelete(null)}
          title="Xác nhận xóa thành viên"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
              <div className="text-xs text-[#B91C1C] space-y-1">
                <p className="font-bold">Cảnh báo hành động xóa!</p>
                <p>
                  Bạn đang chuẩn bị xóa tài khoản người phụ trách <strong>{memberToDelete.name}</strong> ({memberToDelete.email}).
                </p>
                <p>
                  Nếu thành viên đang có hợp đồng, cơ hội kinh doanh hoặc công việc liên kết, bạn cần dùng chức năng <strong>Bàn giao công việc</strong> trước khi xóa.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E6EBF2]">
              <Button variant="secondary" onClick={() => setMemberToDelete(null)}>
                Hủy bỏ
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (onDeleteMember) {
                    const success = onDeleteMember(memberToDelete.id);
                    if (success) {
                      setMemberToDelete(null);
                    }
                  }
                }}
                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
              >
                Xóa thành viên
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
