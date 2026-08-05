import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, MessageCircle } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';

function UnreadBadge({ count }) {
  if (!count || count <= 0) return null;
  return <span className="header-badge">{count > 99 ? '99+' : count}</span>;
}

export function HeaderIconLinks() {
  const { data: notifCount = 0 } = useQuery({
    queryKey: queryKeys.notificationCount,
    queryFn: async () => {
      const { data } = await api.get('/notifications/unread-count');
      return data.count ?? 0;
    },
    refetchInterval: 30_000,
  });

  const { data: chatCount = 0 } = useQuery({
    queryKey: queryKeys.chatUnreadCount,
    queryFn: async () => {
      const { data } = await api.get('/chats/unread-count');
      return data.count ?? 0;
    },
    refetchInterval: 25_000,
  });

  return (
    <>
      <Link to="/notifications" className="icon-btn icon-btn--badge" aria-label="الإشعارات">
        <Bell size={18} />
        <UnreadBadge count={notifCount} />
      </Link>
      <Link to="/chats" className="icon-btn icon-btn--badge" aria-label="المحادثات">
        <MessageCircle size={18} />
        <UnreadBadge count={chatCount} />
      </Link>
    </>
  );
}

export default function AppHeader({
  title,
  subtitle,
  eyebrow,
  leading = null,
  actions = null,
}) {
  return (
    <header className="page-header">
      <div className="page-header__start">
        {leading}
        <div className="page-header__titles">
          {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
          {title && <h1>{title}</h1>}
          {subtitle && <p className="page-header__eyebrow">{subtitle}</p>}
        </div>
      </div>
      <div className="page-header__actions">
        {actions}
        <HeaderIconLinks />
      </div>
    </header>
  );
}
