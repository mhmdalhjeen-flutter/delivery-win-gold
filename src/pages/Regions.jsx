import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, X } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import { useSettingsQuery, isSettingsLoading } from '../hooks/useSettingsQuery';
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

function getRegionPathLabel(id, byId) {
  const parts = [];
  let current = byId.get(String(id));
  while (current) {
    parts.unshift(current.name);
    const parentId = current.parent ? String(current.parent) : '';
    current = parentId ? byId.get(parentId) : null;
  }
  return parts.join(' / ');
}

export default function Regions() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [servesAll, setServesAll] = useState(false);
  const [selected, setSelected] = useState([]);
  const [primaryId, setPrimaryId] = useState('');
  const [subId, setSubId] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data, isLoading } = useSettingsQuery({
    queryKey: queryKeys.regions,
    queryFn: async () => {
      const { data: res } = await api.get('/delivery/company/regions');
      return res;
    },
  });

  useEffect(() => {
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
  const subRegions = primaryId ? (byParent.get(primaryId) || []) : [];
  const hasSubRegions = subRegions.length > 0;
  const canAddRegion = Boolean(
    primaryId && (!hasSubRegions || subId) && !selected.includes(hasSubRegions ? subId : primaryId),
  );

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

  const handlePrimaryChange = (e) => {
    setPrimaryId(e.target.value);
    setSubId('');
  };

  const handleAddRegion = () => {
    const idToAdd = hasSubRegions ? subId : primaryId;
    if (!idToAdd || selected.includes(idToAdd)) return;
    setSelected((prev) => [...prev, idToAdd]);
    setPrimaryId('');
    setSubId('');
    setPickerOpen(false);
  };

  const removeRegion = (id) => {
    setSelected((prev) => prev.filter((row) => row !== id));
  };

  if (isSettingsLoading(isLoading, data)) {
    return <SettingsPageLayout title="مناطق الخدمة"><p className="muted-center">جاري التحميل...</p></SettingsPageLayout>;
  }

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
            <div className="region-picker__head">
              <h2>مناطق الخدمة المحددة</h2>
              <button
                type="button"
                className="region-add-trigger"
                onClick={() => setPickerOpen((open) => !open)}
              >
                <Plus size={16} />
                إضافة منطقة
              </button>
            </div>

            {pickerOpen && (
              <div className="region-add-form">
                <label>
                  <span>المنطقة الرئيسية</span>
                  <select value={primaryId} onChange={handlePrimaryChange}>
                    <option value="">اختر المنطقة الرئيسية</option>
                    {rootRegions.map((region) => (
                      <option key={region._id} value={String(region._id)}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </label>

                {primaryId && hasSubRegions && (
                  <label>
                    <span>المنطقة الفرعية</span>
                    <select value={subId} onChange={(e) => setSubId(e.target.value)}>
                      <option value="">اختر المنطقة الفرعية</option>
                      {subRegions.map((region) => (
                        <option key={region._id} value={String(region._id)}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {primaryId && !hasSubRegions && (
                  <p className="form-hint">لا توجد مناطق فرعية — سيتم إضافة «{byId.get(primaryId)?.name}».</p>
                )}

                <button
                  type="button"
                  className="btn-primary region-add-form__submit"
                  disabled={!canAddRegion}
                  onClick={handleAddRegion}
                >
                  <Plus size={16} />
                  إضافة
                </button>
              </div>
            )}

            {selected.length > 0 ? (
              <ul className="region-selected-list">
                {selected.map((id) => {
                  const label = getRegionPathLabel(id, byId);
                  if (!label) return null;
                  return (
                    <li key={id} className="region-selected-item">
                      <span>{label}</span>
                      <button
                        type="button"
                        className="region-selected-item__remove"
                        onClick={() => removeRegion(id)}
                        aria-label={`إزالة ${label}`}
                      >
                        <X size={16} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="muted-center region-picker__empty">لم تُضف مناطق بعد. اضغط «إضافة منطقة» للبدء.</p>
            )}
          </section>
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
