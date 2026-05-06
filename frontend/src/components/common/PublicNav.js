// components/common/PublicNav.js
import React from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function PublicNav() {
  return (
    <nav className="public-nav">
      <Link to="/" className="nav-brand">Student<span>Bridge</span></Link>
      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
        <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
        <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
      </div>
    </nav>
  );
}
