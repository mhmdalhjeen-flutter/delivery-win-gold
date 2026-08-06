import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, MapPin } from 'lucide-react';
import { phoneHref, whatsappHref, mapsHref } from '../utils/tripHelpers';

export default function ContactActions({
  phone,
  whatsapp,
  address,
  chatUserId,
  chatLabel = 'محادثة',
  chatBasePath = '/chat',
}) {
  const navigate = useNavigate();
  const tel = phoneHref(phone);
  const wa = whatsappHref(whatsapp || phone);
  const map = mapsHref(address);
  const chatPath = `${chatBasePath.replace(/\/$/, '')}/${chatUserId}`;

  return (
    <div className="contact-actions">
      {tel && (
        <a href={tel} className="contact-actions__btn contact-actions__btn--call">
          <Phone size={18} />
          <span>اتصال</span>
        </a>
      )}
      {wa && (
        <a href={wa} target="_blank" rel="noreferrer" className="contact-actions__btn contact-actions__btn--wa">
          <MessageCircle size={18} />
          <span>واتساب</span>
        </a>
      )}
      {map && (
        <a href={map} target="_blank" rel="noreferrer" className="contact-actions__btn contact-actions__btn--map">
          <MapPin size={18} />
          <span>الموقع</span>
        </a>
      )}
      {chatUserId && (
        <button
          type="button"
          className="contact-actions__btn contact-actions__btn--chat"
          onClick={() => navigate(chatPath)}
        >
          <MessageCircle size={18} />
          <span>{chatLabel}</span>
        </button>
      )}
    </div>
  );
}
