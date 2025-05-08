"use client";

export default function TestPage() {
  return (
    <div className="min-h-screen w-full bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Test Tailwind</h1>
        <p className="text-gray-600">
          Si vous voyez cette page avec des styles appropriés (fond bleu, texte centré, carte blanche), 
          alors Tailwind fonctionne correctement.
        </p>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          Un bouton stylisé
        </button>
      </div>
    </div>
  );
} 