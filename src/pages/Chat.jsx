import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';

import { ArrowRight, Loader2, Send } from 'lucide-react';

import api from '../api/axios';

import { useAuth } from '../context/AuthContext';

import { queryKeys } from '../lib/queryClient';

import { HeaderIconLinks } from '../components/AppHeader';



const POLL_MS = 8_000;



export default function Chat() {

  const { userId } = useParams();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { user } = useAuth();

  const myId = user?.id || user?._id;

  const [convId, setConvId] = useState(null);

  const [messages, setMessages] = useState([]);

  const [text, setText] = useState('');

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);

  const [peerName, setPeerName] = useState('محادثة');

  const bottomRef = useRef(null);

  const convIdRef = useRef(null);



  useEffect(() => {

    convIdRef.current = convId;

  }, [convId]);



  const fetchMessages = useCallback(async (conversationId, { silent = false } = {}) => {

    if (!conversationId) return;

    try {

      const { data: msgData } = await api.get(`/chats/${conversationId}`);

      setMessages(msgData.messages || msgData || []);

      queryClient.invalidateQueries({ queryKey: queryKeys.chats });

      queryClient.invalidateQueries({ queryKey: queryKeys.chatUnreadCount });

    } catch {

      if (!silent) setMessages([]);

    }

  }, [queryClient]);



  useEffect(() => {

    let cancelled = false;



    async function boot() {

      setLoading(true);

      try {

        const { data: convData } = await api.post('/chats', {

          recipientId: userId,

          context: { type: 'delivery', label: 'توصيل' },

        });

        const conv = convData.conversation || convData;

        if (cancelled) return;

        setConvId(conv._id);

        const peer = (conv.participants || []).find((p) => String(p._id) !== String(myId));

        if (peer?.name) setPeerName(peer.name);

        await fetchMessages(conv._id, { silent: true });

      } catch {

        if (!cancelled) setMessages([]);

      } finally {

        if (!cancelled) setLoading(false);

      }

    }



    boot();

    return () => { cancelled = true; };

  }, [userId, myId, fetchMessages]);



  useEffect(() => {

    if (!convId) return undefined;



    const poll = () => fetchMessages(convId, { silent: true });

    const intervalId = window.setInterval(poll, POLL_MS);



    const onServiceWorkerMessage = (event) => {

      if (event.data?.type !== 'PUSH_NOTIFICATION') return;

      const type = event.data.notification?.type || event.data.notification?.data?.type;

      if (type === 'chat_message') {

        fetchMessages(convIdRef.current, { silent: true });

      }

    };



    const onVisible = () => {

      if (document.visibilityState === 'visible') poll();

    };



    navigator.serviceWorker?.addEventListener('message', onServiceWorkerMessage);

    document.addEventListener('visibilitychange', onVisible);



    return () => {

      window.clearInterval(intervalId);

      navigator.serviceWorker?.removeEventListener('message', onServiceWorkerMessage);

      document.removeEventListener('visibilitychange', onVisible);

    };

  }, [convId, fetchMessages]);



  useEffect(() => {

    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  }, [messages]);



  const send = async (e) => {

    e.preventDefault();

    const body = text.trim();

    if (!body || !convId || sending) return;

    setSending(true);

    try {

      const { data } = await api.post(`/chats/${convId}`, { text: body });

      const msg = data.message || data;

      setMessages((prev) => [...prev, msg]);

      setText('');

      queryClient.invalidateQueries({ queryKey: queryKeys.chats });

    } finally {

      setSending(false);

    }

  };



  const showHeaderIcons = user?.role === 'delivery_company' || user?.role === 'delivery_driver';



  return (

    <div className="app-shell app-shell--chat">

      <header className="page-header page-header--back">

        <div className="page-header__start">

          <button type="button" className="icon-btn" onClick={() => navigate(-1)} aria-label="رجوع">

            <ArrowRight size={20} />

          </button>

          <div className="page-header__titles">

            <h1>{peerName}</h1>

          </div>

        </div>

        <div className="page-header__actions">

          {showHeaderIcons ? <HeaderIconLinks /> : null}

        </div>

      </header>



      <div className="chat-thread">

        {loading && <p className="muted-center">جاري التحميل...</p>}

        {!loading && messages.length === 0 && (

          <p className="muted-center">لا توجد رسائل بعد</p>

        )}

        {messages.map((m) => {

          const mine = String(m.sender?._id || m.sender) === String(myId);

          return (

            <div key={m._id} className={`chat-bubble${mine ? ' chat-bubble--mine' : ''}`}>

              {m.text}

            </div>

          );

        })}

        <div ref={bottomRef} />

      </div>



      <form className="chat-compose" onSubmit={send}>

        <input

          value={text}

          onChange={(e) => setText(e.target.value)}

          placeholder="اكتب رسالة..."

          disabled={!convId || sending}

        />

        <button type="submit" className="icon-btn" disabled={!convId || sending || !text.trim()} aria-label="إرسال">

          {sending ? <Loader2 size={18} className="spin" /> : <Send size={18} />}

        </button>

      </form>

    </div>

  );

}

