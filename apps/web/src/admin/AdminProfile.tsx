import { Link } from 'react-router-dom';
import { useStaffAuth } from '../context/StaffAuthContext';
import AdminIcon from '../components/admin/AdminIcon';

export default function AdminProfile() {
  const { staff, hasPermission, refresh } = useStaffAuth();
  if (!staff) return null;
  return (
    <div className="admin-page">
      <div className="page-header"><h1>Hồ sơ nhân viên</h1></div>
      <section className="card" style={{ padding: 24 }}>
        <h2>{staff.hoTen}</h2>
        <p>Email: {staff.email}</p>
        <p>Số điện thoại: {staff.soDienThoai || 'Chưa cập nhật'}</p>
        <p>Vai trò: {staff.tenVaiTro}</p>
        <button type="button" className="btn btn-secondary" onClick={() => void refresh()}><AdminIcon name="fa-sync" /> Làm mới hồ sơ</button>
        {hasPermission('staff.manage') && <p><Link to="/admin/staff">Quản lý thông tin và mật khẩu nhân viên</Link></p>}
      </section>
    </div>
  );
}
