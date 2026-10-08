// src/components/affirmations/AffirmationsSection.jsx
import { useState } from 'react';
import FeaturedCard from './FeaturedCard';
import AddModal from './AddModal';

const AFFIRMATION_PRESETS = [
  "i am worthy of peace, joy, and gentle days",
  "my feelings are valid, and i give myself permission to feel them",
  "today is a fresh page in my story, and i get to choose the words",
  "small steps every day lead to beautiful transformations",
  "i am gentle with my mind and proud of how far i've come",
  "i deserve the same unconditional kindness i give to others",
  "my voice and reflections are precious and true",
];

export default function AffirmationsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAffirmation, setNewAffirmation] = useState('');

  const [customAffirmations, setCustomAffirmations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('uf_custom_affirmations') || '[]');
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('uf_fav_affirmations') || '[]');
    } catch {
      return [];
    }
  });

  const allAffirmations = [...AFFIRMATION_PRESETS, ...customAffirmations];

  const nextAffirmation = () => {
    setCurrentIndex((prev) => (prev + 1) % allAffirmations.length);
    setCopied(false);
  };

  const copyCurrent = () => {
    navigator.clipboard.writeText(allAffirmations[currentIndex]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFavorite = (text) => {
    setFavorites((prev) => {
      const next = prev.includes(text) ? prev.filter((x) => x !== text) : [...prev, text];
      localStorage.setItem('uf_fav_affirmations', JSON.stringify(next));
      return next;
    });
  };

  const handleAddAffirmation = () => {
    if (newAffirmation.trim()) {
      const updated = [...customAffirmations, newAffirmation.trim()];
      setCustomAffirmations(updated);
      localStorage.setItem('uf_custom_affirmations', JSON.stringify(updated));
      setNewAffirmation('');
      setShowAddModal(false);
      setCurrentIndex(allAffirmations.length);
    }
  };

  const currentText = allAffirmations[currentIndex] || allAffirmations[0];
  const isFav = favorites.includes(currentText);

  return (
    <div className="w-full">
      <FeaturedCard
        currentText={currentText}
        currentIndex={currentIndex}
        isFav={isFav}
        copied={copied}
        onNext={nextAffirmation}
        onToggleFavorite={toggleFavorite}
        onCopy={copyCurrent}
        onOpenAddModal={() => setShowAddModal(true)}
      />

      {showAddModal && (
        <AddModal
          newAffirmation={newAffirmation}
          onChangeNewAffirmation={setNewAffirmation}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddAffirmation}
        />
      )}
    </div>
  );
}