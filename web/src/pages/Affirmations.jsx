import { useState } from 'react';
import ProfileDropdown from '../components/ProfileDropdown';
import FeaturedCard from '../components/affirmations/FeaturedCard';
import FavoritesList from '../components/affirmations/FavoritesList';
import CustomList from '../components/affirmations/CustomList';
import AddModal from '../components/affirmations/AddModal';

const AFFIRMATION_PRESETS = [
  "i am worthy of peace, joy, and gentle days",
  "my feelings are valid, and i give myself permission to feel them",
  "today is a fresh page in my story, and i get to choose the words",
  "small steps every day lead to beautiful transformations",
  "i am gentle with my mind and proud of how far i've come",
  "i deserve the same unconditional kindness i give to others",
  "my voice and reflections are precious and true",
];

export default function Affirmations() {
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

  const handleRemoveCustomAffirmation = (text) => {
    const updated = customAffirmations.filter((a) => a !== text);
    setCustomAffirmations(updated);
    localStorage.setItem('uf_custom_affirmations', JSON.stringify(updated));
    if (allAffirmations[currentIndex] === text && currentIndex >= allAffirmations.length - 1) {
      setCurrentIndex(0);
    }
  };

  const currentText = allAffirmations[currentIndex] || allAffirmations[0];
  const isFav = favorites.includes(currentText);

  return (
    <div
      className="min-h-screen px-4 sm:px-8 md:px-12 py-8 transition-colors duration-200"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
            >
              daily affirmations
            </h1>
            <p className="text-[13px] md:text-[14px] font-medium mt-1" style={{ color: 'var(--ink-soft)' }}>
              gentle words to nurture your mindset and bring warmth to your day
            </p>
          </div>

          <ProfileDropdown />
        </div>

        {/* Main Card */}
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

        {/* Split Grid for Favorites and Custom items */}
        {(favorites.length > 0 || customAffirmations.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FavoritesList favorites={favorites} onRemoveFavorite={toggleFavorite} />
            <CustomList
              customAffirmations={customAffirmations}
              onRemoveCustom={handleRemoveCustomAffirmation}
            />
          </div>
        )}
      </div>

      {/* Modal */}
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