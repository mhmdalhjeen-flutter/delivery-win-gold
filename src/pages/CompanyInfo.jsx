import React, { useEffect, useRef, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Loader2, Upload } from 'lucide-react';

import api from '../api/axios';

import { queryKeys } from '../lib/queryClient';

import { useSettingsQuery, isSettingsLoading } from '../hooks/useSettingsQuery';

import SettingsPageLayout from '../components/SettingsPageLayout';

import { fileToCompressedDataUrl } from '../utils/imageUpload';



export default function CompanyInfo() {

  const qc = useQueryClient();

  const [form, setForm] = useState({

    phone: '',

    whatsapp: '',

    address: '',

    announcement: '',

  });

  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoPayload, setLogoPayload] = useState(undefined);
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoError, setLogoError] = useState('');
  const logoInputRef = useRef(null);



  const { data: profile, isLoading } = useSettingsQuery({

    queryKey: queryKeys.profile,

    queryFn: async () => {

      const { data } = await api.get('/delivery/company/profile');

      return data.company;

    },

  });



  useEffect(() => {

    if (profile) {

      setForm({

        phone: profile.phone || '',

        whatsapp: profile.whatsapp || '',

        address: profile.address || '',

        announcement: profile.description || '',

      });

      setLogoPreview(profile.logo || '');

      setLogoPayload(undefined);

      setLogoError('');

    }

  }, [profile]);



  const handleLogoPick = async (e) => {

    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {

      setLogoError('يرجى اختيار ملف صورة');

      e.target.value = '';

      return;

    }

    setLogoBusy(true);

    setLogoError('');

    try {

      const dataUrl = await fileToCompressedDataUrl(file, { maxWidth: 512, quality: 0.88 });

      setLogoPreview(dataUrl);

      setLogoPayload(dataUrl);

    } catch {

      setLogoError('تعذّر معالجة الصورة — جرّب صورة أخرى');

    } finally {

      setLogoBusy(false);

      e.target.value = '';

    }

  };



  const save = useMutation({

    mutationFn: async () => {

      const payload = {

        phone: form.phone,

        whatsapp: form.whatsapp,

        address: form.address,

        description: form.announcement,

      };

      if (logoPayload !== undefined) {

        payload.logo = logoPayload;

      }

      const { data } = await api.put('/delivery/company/profile', payload);

      return data.company;

    },

    onSuccess: (company) => {

      qc.invalidateQueries({ queryKey: queryKeys.profile });

      setLogoPreview(company?.logo || '');

      setLogoPayload(undefined);

      setSaved(true);

      setTimeout(() => setSaved(false), 2500);

    },

  });



  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));



  if (isSettingsLoading(isLoading, profile)) {

    return <SettingsPageLayout title="معلومات الشركة"><p className="muted-center">جاري التحميل...</p></SettingsPageLayout>;

  }



  return (

    <SettingsPageLayout title="معلومات الشركة" subtitle="بيانات التواصل والإعلانات الظاهرة للزبائن">

      {profile && (

        <section className="panel panel--flat">

          <div className="settings-company settings-company--large">

            {logoPreview ? (

              <img src={logoPreview} alt="" className="settings-company__logo settings-company__logo--lg" />

            ) : (

              <span className="settings-company__icon settings-company__icon--lg">{profile.name?.[0] || 'ش'}</span>

            )}

            <div>

              <h2>{profile.name}</h2>

              <p className="form-hint">اسم الشركة يُدار من الإدارة</p>

            </div>

          </div>

        </section>

      )}



      <section className="panel">

        <div className="company-logo-upload">

          <span className="upload-field__label">شعار الشركة</span>

          <p className="form-hint company-logo-upload__hint">ارفع صورة من جهازك — تظهر للزبائن مع اسم شركتكم.</p>

          <div className="company-logo-upload__row">

            <div className="company-logo-upload__preview-wrap">

              {logoPreview ? (

                <img src={logoPreview} alt="شعار الشركة" className="company-logo-upload__preview" />

              ) : (

                <div className="company-logo-upload__placeholder" aria-hidden>

                  {profile?.name?.[0] || 'ش'}

                </div>

              )}

            </div>

            <div className="company-logo-upload__actions">

              <label className="upload-field__btn company-logo-upload__btn">

                {logoBusy ? <Loader2 size={18} className="spin" /> : <Upload size={18} />}

                <span>{logoPreview ? 'تغيير الشعار' : 'رفع شعار من الجهاز'}</span>

                <input

                  ref={logoInputRef}

                  type="file"

                  accept="image/*"

                  className="hidden"

                  disabled={logoBusy || save.isPending}

                  onChange={handleLogoPick}

                />

              </label>

              <small className="form-hint">PNG أو JPG — يُفضّل مربع أو دائري</small>

            </div>

          </div>

          {logoError && <p className="form-error">{logoError}</p>}

        </div>

      </section>



      <section className="panel">

        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>

          <label>

            <span>هاتف الشركة</span>

            <input value={form.phone} onChange={set('phone')} required dir="ltr" inputMode="tel" />

          </label>

          <label>

            <span>رقم واتساب</span>

            <input value={form.whatsapp} onChange={set('whatsapp')} dir="ltr" inputMode="tel" placeholder="+970..." />

          </label>

          <label>

            <span>عنوان الشركة</span>

            <textarea value={form.address} onChange={set('address')} rows={3} maxLength={500} />

          </label>

          <label>

            <span>إعلان / تنبيه للزبائن</span>

            <textarea

              value={form.announcement}

              onChange={set('announcement')}

              rows={4}

              maxLength={2000}

              placeholder="مثال: التوصيل متاح اليوم حتى الساعة 8 مساءً"

            />

            <small className="form-hint">يظهر كإشعار أو ملاحظة للزبائن عند اختيار شركتكم للتوصيل.</small>

          </label>

          <button type="submit" className="btn-primary btn-primary--block" disabled={save.isPending || logoBusy}>

            {save.isPending ? <Loader2 size={18} className="spin" /> : null}

            {saved ? 'تم الحفظ' : 'حفظ التغييرات'}

          </button>

        </form>

      </section>

    </SettingsPageLayout>

  );

}

