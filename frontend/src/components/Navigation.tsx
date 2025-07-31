'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  PieChart, 
  Calendar, 
  ShoppingCart, 
  BookOpen, 
  TrendingUp, 
  User,
  Menu,
  X,
  Zap // Using Zap instead of Leaf
} from 'react-feather';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: PieChart },
    { href: '/generate-menu', label: 'Générer Menu', icon: Calendar },
    { href: '/meal-planner', label: 'Planificateur', icon: Calendar },
    { href: '/recipe-explorer', label: 'Recettes', icon: BookOpen },
    { href: '/shopping-assistant', label: 'Shopping', icon: ShoppingCart },
    { href: '/transition-planner', label: 'Transition', icon: TrendingUp },
    { href: '/profile', label: 'Profil', icon: User },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-green-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-white" />
              <span className="text-white text-xl font-bold">VeganFlemme</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.slice(1, -1).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-green-700 text-white'
                      : 'text-green-100 hover:bg-green-500 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/profile"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ml-4 transition-colors ${
                isActive('/profile')
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-500 hover:text-white'
              }`}
            >
              <User className="h-4 w-4 mr-2" />
              Profil
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-green-100 hover:text-white focus:outline-none focus:text-white transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-green-700">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-green-800 text-white'
                      : 'text-green-100 hover:bg-green-600 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;