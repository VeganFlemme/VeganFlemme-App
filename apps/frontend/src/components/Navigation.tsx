'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  PieChart, 
  Calendar, 
  ShoppingCart, 
  User,
  Menu,
  X,
  Zap, // Using Zap instead of Leaf
  CheckCircle,
  Circle
} from 'react-feather';
import { useUserJourney } from '@/hooks/useUserJourney';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { state } = useUserJourney();

  // Simplified navigation based on user journey
  const getNavItems = () => {
    if (!state.profile || !state.profile.isComplete) {
      return [
        { href: '/', label: 'Accueil', icon: Home },
        { href: '/onboarding', label: 'Commencer', icon: User },
      ];
    }

    return [
      { href: '/', label: 'Accueil', icon: Home },
      { href: '/dashboard', label: 'Dashboard', icon: PieChart, completed: true },
      { href: '/generate-menu', label: 'Générer Menu', icon: Calendar, completed: state.hasGeneratedMenu },
      { href: '/shopping-assistant', label: 'Shopping', icon: ShoppingCart, completed: state.hasCreatedShoppingList },
      { href: '/profile', label: 'Profil', icon: User, completed: state.profile?.isComplete },
    ];
  };

  const navItems = getNavItems();
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
            
            {/* Progress indicator for logged in users */}
            {state.profile?.isComplete && (
              <div className="hidden lg:flex items-center ml-8 text-white text-sm">
                <span className="mr-2">Progression:</span>
                <div className="w-20 bg-green-700 rounded-full h-2 mr-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${state.completionPercentage}%` }}
                  />
                </div>
                <span>{state.completionPercentage}%</span>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.slice(1).map((item) => {
              const Icon = item.icon;
              const isCompleted = 'completed' in item ? item.completed : false;
              
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
                  {'completed' in item && (
                    <div className="ml-2">
                      {isCompleted ? (
                        <CheckCircle className="h-3 w-3 text-green-200" />
                      ) : (
                        <Circle className="h-3 w-3 text-green-300" />
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
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
              const isCompleted = 'completed' in item ? item.completed : false;
              
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
                  {'completed' in item && (
                    <div className="ml-auto">
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-200" />
                      ) : (
                        <Circle className="h-4 w-4 text-green-300" />
                      )}
                    </div>
                  )}
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