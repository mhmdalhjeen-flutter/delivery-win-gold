import React from 'react';



import { NavLink } from 'react-router-dom';



import { Home, Inbox, Settings } from 'lucide-react';



export default function BottomNav() {

  return (

    <nav className="bottom-nav" aria-label="التنقل الرئيسي">

      <NavLink to="/" end className={({ isActive }) => `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`}>

        <Home size={22} />

        <span>الرئيسية</span>

      </NavLink>



      <NavLink to="/requests" className={({ isActive }) => `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`}>

        <Inbox size={22} />

        <span>الواردة</span>

      </NavLink>



      <NavLink to="/settings" className={({ isActive }) => `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`}>

        <Settings size={22} />

        <span>الإعدادات</span>

      </NavLink>

    </nav>

  );

}

