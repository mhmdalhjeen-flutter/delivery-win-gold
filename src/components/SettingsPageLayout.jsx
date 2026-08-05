import React from 'react';

import { Link } from 'react-router-dom';

import { ArrowRight } from 'lucide-react';

import { HeaderIconLinks } from './AppHeader';

import BottomNav from './BottomNav';



export default function SettingsPageLayout({ title, subtitle, children, showNav = true, actions = null }) {

  return (

    <div className="app-shell app-shell--settings">

      <header className="page-header page-header--back">

        <div className="page-header__start">

          <Link to="/settings" className="icon-btn" aria-label="رجوع للإعدادات">

            <ArrowRight size={20} />

          </Link>

          <div className="page-header__titles">

            <h1>{title}</h1>

            {subtitle && <p className="page-header__eyebrow">{subtitle}</p>}

          </div>

        </div>

        <div className="page-header__actions">

          {actions}

          <HeaderIconLinks />

        </div>

      </header>

      <div className="settings-page-content">{children}</div>

      {showNav && <BottomNav />}

    </div>

  );

}


