import React from 'react';

export default function StatCard({ label, value, tone = 'blue', onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`stat-card stat-card--${tone}${onClick ? ' stat-card--clickable' : ''}`}
      onClick={onClick}
    >
      <span className="stat-card__value">{value ?? 0}</span>
      <span className="stat-card__label">{label}</span>
    </Tag>
  );
}
