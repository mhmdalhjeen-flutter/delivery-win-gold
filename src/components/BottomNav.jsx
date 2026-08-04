import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, List, History } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="التنقل الرئيسي">
      <NavLink to="/" end className={({ isActive }) => `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`}>
        <Home size={22} />
        <span>الرئيسية</span>
      </NavLink>
      <NavLink to="/trips" className={({ isActive }) => `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`}>
        <List size={22} />
        <span>الرحلات</span>
      </NavLink>
      <NavLink to="/history" className={({ isActive }) => `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`}>
        <History size={22} />
        <span>السجل</span>
      </NavLink>
    </nav>
  );
}
