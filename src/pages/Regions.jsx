import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import SettingsPageLayout from '../components/SettingsPageLayout';

function buildRegionTree(regions = []) {
  const byParent = new Map();
  const byId = new Map();

  regions.forEach((region) => {
    const id = String(region._id);
    byId.set(id, region);
    const parentKey = region.parent ? String(region.parent) : '';
    if (!byParent.has(parentKey)) byParent.set(parentKey, []);
    byParent.get(parentKey).push(region);
  });

  for (const list of byParent.values()) {
    list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name, 'ar'));
  }

  return { byParent, byId };
}

export default function Regions() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [servesAll, setServesAll] = useState(false);
  const [selected, setSelected] = useState([]);
  const [pathIds, setPathIds] = useState([]);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.regions,
    queryFn: async () => {
      const { data: res } = await api.get('/delivery/company/regions');
      return res;
    },
  });

  React.useEffect(() => {
    if (data) {
      setServesAll(Boolean(data.servesAllRegions));
      setSelected(data.servedRegionIds || []);
    }
  }, [data]);

  const { byParent, byId } = useMemo(
    () => buildRegionTree(data?.regions || []),
    [data?.regions],
  );

  const rootRegions = byParent.get('') || [];

  const currentLevelRegions = useMemo(() => {
    if (pathIds.length === 0) return rootRegions;
    const parentId = pathIds[pathIds.length - 1];
    return byParent.get(parentId) || [];
  }, [byParent, pathIds, rootRegions]);

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
    const key = String(id);
    setSelected((prev) => (
      prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]
    ));
  };

  const drillInto = (region) => {
    const id = String(region._id);
    const children = byParent.get(id) || [];
    if (children.length === 0) return;
    setPathIds((prev) => [...prev, id]);
  };

  const goToCrumb = (index) => {
    if (index < 0) {
      setPathIds([]);
      return;
    }
    setPathIds((prev) => prev.slice(0, index + 1));
  };

  if (isLoading) {
    return <SettingsPageLayout title="مناطق الخدمة"><p className="muted-center">جاري التحميل...</p></SettingsPageLayout>;
  }

  const crumbs = pathIds.map((id) => byId.get(id)).filter(Boolean);

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
        <>
          <section className="panel region-picker">
            <h2>اختيار المناطق</h2>
            <p className="form-hint">اختر منطقة رئيسية ثم انتقل للمستوى الأدق عند توفره.</p>

            <nav className="region-breadcrumb" aria-label="مسار المناطق">
              <button type="button" className="region-breadcrumb__item" onClick={() => goToCrumb(-1)}>
                الكل
              </button>
              {crumbs.map((region, index) => (
                <React.Fragment key={region._id}>
                  <ChevronLeft size={14} className="region-breadcrumb__sep" aria-hidden />
                  <button
                    type="button"
                    className="region-breadcrumb__item"
                    onClick={() => goToCrumb(index)}
                  >
                    {region.name}
                  </button>
                </React.Fragment>
              ))}
            </nav>

            <div className="region-list">
              {currentLevelRegions.length === 0 && (
                <p className="muted-center">لا توجد مناطق فرعية في هذا المستوى</p>
              )}
              {currentLevelRegions.map((region) => {
                const id = String(region._id);
                const hasChildren = (byParent.get(id) || []).length > 0;
                const isChecked = selected.includes(id);

                return (
                  <div key={region._id} className="region-row">
                    <label className="toggle-row toggle-row--card region-row__check">
                      <span>{region.name}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRegion(id)}
                      />
                    </label>
                    {hasChildren && (
                      <button
                        type="button"
                        className="region-row__drill"
                        onClick={() => drillInto(region)}
                      >
                        التفاصيل
                        <ChevronLeft size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {selected.length > 0 && (
            <section className="panel">
              <h2>المناطق المختارة ({selected.length})</h2>
              <div className="region-selected-chips">
                {selected.map((id) => {
                  const region = byId.get(id);
                  if (!region) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      className="region-chip"
                      onClick={() => toggleRegion(id)}
                    >
                      {region.name}
                      <span aria-hidden>×</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </>
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
