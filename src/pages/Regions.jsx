import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import SettingsPageLayout from '../components/SettingsPageLayout';

export default function Regions() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.regions,
    queryFn: async () => {
      const { data: res } = await api.get('/delivery/company/regions');
      return res;
    },
  });

  const [servesAll, setServesAll] = useState(false);
  const [selected, setSelected] = useState([]);

  React.useEffect(() => {
    if (data) {
      setServesAll(Boolean(data.servesAllRegions));
      setSelected(data.servedRegionIds || []);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      await api.put('/delivery/company/regions', {
        servesAllRegions: servesAll,
        servedRegionIds: servesAll ? [] : selected,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.regions });
      qc.invalidateQueries({ queryKey: queryKeys.profile });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const toggleRegion = (id) => {
    setSelected((prev) => (
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    ));
  };

  if (isLoading) {
    return <SettingsPageLayout title="مناطق الخدمة"><p className="muted-center">جاري التحميل...</p></SettingsPageLayout>;
  }

  const rootRegions = (data?.regions || []).filter((r) => !r.parent);

  return (
    <SettingsPageLayout title="مناطق الخدمة" subtitle="توصية للزبائن فقط — تظهر كل الشركات النشطة">
      <section className="panel panel--highlight">
        <p>المناطق تُستخدم لترتيب شركتكم أولاً عندما يختار الزبون منطقته. الزبون يبقى حراً باختيار أي شركة نشطة.</p>
      </section>

      <section className="panel">
        <label className="toggle-row toggle-row--card">
          <span>خدمة جميع المناطق</span>
          <input
            type="checkbox"
            checked={servesAll}
            onChange={(e) => setServesAll(e.target.checked)}
          />
        </label>
      </section>

      {!servesAll && (
        <section className="panel">
          <h2>المناطق المختارة</h2>
          <div className="region-list">
            {rootRegions.map((region) => (
              <label key={region._id} className="toggle-row toggle-row--card">
                <span>{region.name}</span>
                <input
                  type="checkbox"
                  checked={selected.includes(String(region._id))}
                  onChange={() => toggleRegion(String(region._id))}
                />
              </label>
            ))}
          </div>
        </section>
      )}

      <button
        type="button"
        className="btn-primary btn-primary--block"
        disabled={save.isPending}
        onClick={() => save.mutate()}
      >
        {save.isPending ? <Loader2 size={18} className="spin" /> : null}
        {saved ? 'تم الحفظ' : 'حفظ المناطق'}
      </button>
    </SettingsPageLayout>
  );
}
