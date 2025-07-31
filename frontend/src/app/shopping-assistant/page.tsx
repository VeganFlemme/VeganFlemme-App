'use client';

import ShoppingAssistant from '../../components/ShoppingAssistant/ShoppingAssistant';

export default function ShoppingAssistantPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Assistant</h1>
        <ShoppingAssistant />
      </div>
    </div>
  );
}