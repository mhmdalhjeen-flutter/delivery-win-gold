import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import api from '../api/axios';
import { queryKeys } from '../lib/queryClient';
import SettingsPageLayout from '../components/SettingsPageLayout';
import { formatDate } from '../utils/tripHelpers';
import { useAuth } from '../context/AuthContext';

export default function Chats() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const myId = user?.id || user?._id;

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: queryKeys.chats,
    queryFn: async () => {
      const { data } = await api.get('/chat');
      return data.conversations || [];
    },
    refetchInterval: 25_000,
  });

  return (
    <SettingsPageLayout title="المحادثات" subtitle="تواصل مع الزبائن" showNav={false}>
      {isLoading && <p className="muted-center">جاري التحميل...</p>}

      {!isLoading && conversations.length === 0 && (
        <div className="empty-state">
          <MessageCircle size={32} />
          <p>لا توجد محادثات بعد</p>
          <p className="form-hint">تُفتح المحادثات من تفاصيل الطلب مع الزبون.</p>
        </div>
      )}

      <div className="chat-list">
        {conversations.map((conv) => {
          const peer = (conv.participants || []).find((p) => String(p._id) !== String(myId));
          const last = conv.lastMessage;
          return (
            <button
              key={conv._id}
              type="button"
              className="chat-list-item"
              onClick={() => peer?._id && navigate(`/chat/${peer._id}`)}
            >
              <span className="chat-list-item__avatar">{peer?.name?.[0] || '?'}</span>
              <span className="chat-list-item__body">
                <strong>{peer?.name || 'محادثة'}</strong>
                <span>{last?.text || '—'}</span>
              </span>
              {last?.createdAt && <time>{formatDate(last.createdAt)}</time>}
            </button>
          );
        })}
      </div>
    </SettingsPageLayout>
  );
}
