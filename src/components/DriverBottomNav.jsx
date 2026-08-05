import React from 'react';
import { NavLink } from 'react-router-dom';
import { History, Package } from 'lucide-react';

export default function DriverBottomNav() {
  return (
    <nav className="bottom-nav" aria-label="تنقل السائق">
      <NavLink to="/driver" end className={({ isActive }) => `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`}>
        <Package size={22} />
        <span>التوصيلات</span>
      </NavLink>
      <NavLink to="/driver/history" className={({ isActive }) => `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`}>
        <History size={22} />
        <span>السجل</span>
      </NavLink>
    </nav>
  );
}
