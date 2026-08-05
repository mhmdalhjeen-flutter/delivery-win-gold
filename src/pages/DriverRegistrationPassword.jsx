import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import SettingsPageLayout from '../components/SettingsPageLayout';

export default function DriverRegistrationPassword() {
  const qc = useQueryClient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.driverRegistrationPassword,
    queryFn: async () => {
      const { data: res } = await api.get('/delivery/company/driver-registration-password');
      return res;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const { data: res } = await api.put('/delivery/company/driver-registration-password', {
        password,
        confirmPassword,
      });
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.driverRegistrationPassword });
      setPassword('');
      setConfirmPassword('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  return (
    <SettingsPageLayout
      title="كلمة مرور تسجيل السائقين"
      subtitle="مثل كلمة مرور الواي فاي — يستخدمها السائقون للتسجيل"
    >
      {isLoading && <p className="muted-center">جاري التحميل...</p>}

      <section className="panel">
        <p className="form-hint">
          {data?.hasDriverRegistrationPassword
            ? 'تم تعيين كلمة مرور — يمكنك تغييرها أدناه'
            : 'لم تُعيَّن كلمة مرور بعد — السائقون لا يمكنهم التسجيل حتى تعيينها'}
        </p>

        <form
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <label>
            <span>كلمة مرور التسجيل</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
            />
          </label>
          <label>
            <span>تأكيد كلمة المرور</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={4}
            />
          </label>

          {save.error && (
            <p className="form-error">{save.error.response?.data?.message || 'تعذّر الحفظ'}</p>
          )}
          {saved && <p className="form-success">تم الحفظ بنجاح</p>}

          <button type="submit" className="btn-primary btn-primary--block" disabled={save.isPending}>
            {save.isPending ? <Loader2 size={18} className="spin" /> : null}
            حفظ كلمة المرور
          </button>
        </form>
      </section>
    </SettingsPageLayout>
  );
}
