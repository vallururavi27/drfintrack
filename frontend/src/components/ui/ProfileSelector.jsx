import React, { useState, useEffect } from 'react';
import { UserIcon, UsersIcon } from '@heroicons/react/24/outline';

// Sample profiles data (will be replaced with API data)
const sampleProfiles = [
  { id: 1, name: 'Dr. Ravi', type: 'primary', photo_url: '/profile_ravi.jpg', is_active: true },
  { id: 2, name: 'Mrs. Ravi', type: 'spouse', photo_url: '/profile_spouse.jpg', is_active: true },
];

export default function ProfileSelector({ selectedProfile, onProfileChange, showShared, onShowSharedChange }) {
  const [profiles, setProfiles] = useState(sampleProfiles);
  const [isOpen, setIsOpen] = useState(false);

  // In a real app, fetch profiles from API
  useEffect(() => {
    // Fetch profiles from API
    // const fetchProfiles = async () => {
    //   try {
    //     const data = await api.profiles.getAll();
    //     setProfiles(data);
    //   } catch (error) {
    //     console.error('Error fetching profiles:', error);
    //   }
    // };
    // fetchProfiles();
  }, []);

  // Get the currently selected profile
  const currentProfile = selectedProfile === 'all'
    ? { id: 'all', name: 'All Profiles', photo_url: null }
    : profiles.find(p => p.id === parseInt(selectedProfile)) || profiles[0];

  // Handle profile selection
  const handleProfileSelect = (profile) => {
    onProfileChange(profile.id);
    setIsOpen(false);
  };

  // Handle "All Profiles" selection
  const handleAllProfilesSelect = () => {
    onProfileChange('all');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentProfile.photo_url ? (
          <img
            src={currentProfile.photo_url}
            alt={currentProfile.name}
            className="mr-2 h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <UserIcon className="mr-2 h-5 w-5 text-gray-400" />
        )}
        <span>{currentProfile.name}</span>
        <svg
          className="ml-2 h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800">
          <div className="py-1">
            <button
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              onClick={handleAllProfilesSelect}
            >
              <UsersIcon className="mr-3 h-5 w-5 text-gray-400" />
              All Profiles
            </button>

            {profiles.map((profile) => (
              <button
                key={profile.id}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                onClick={() => handleProfileSelect(profile)}
              >
                {profile.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt={profile.name}
                    className="mr-3 h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="mr-3 h-5 w-5 text-gray-400" />
                )}
                {profile.name}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-700">
            <div className="flex items-center">
              <input
                id="show-shared"
                name="show-shared"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                checked={showShared}
                onChange={(e) => onShowSharedChange(e.target.checked)}
              />
              <label htmlFor="show-shared" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Show shared transactions
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
