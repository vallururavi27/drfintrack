import React, { useState, useEffect } from 'react';
import { UserIcon, UsersIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../services/supabaseClient';

export default function ProfileSelector({ selectedProfile, onProfileChange, showShared, onShowSharedChange }) {
  const [profiles, setProfiles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profiles from Supabase
  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No authenticated user found');
          setProfiles([]);
          setIsLoading(false);
          return;
        }

        // Fetch profiles from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching profiles:', error);
          // If no profiles found, create a default one based on user info
          setProfiles([{
            id: 1,
            name: user.user_metadata?.name || user.email.split('@')[0],
            type: 'primary',
            photo_url: null,
            is_active: true
          }]);
        } else if (data && data.length > 0) {
          setProfiles(data);
        } else {
          // If no profiles found, create a default one based on user info
          setProfiles([{
            id: 1,
            name: user.user_metadata?.name || user.email.split('@')[0],
            type: 'primary',
            photo_url: null,
            is_active: true
          }]);
        }
      } catch (error) {
        console.error('Error in fetchProfiles:', error);
        // Set a default profile if there's an error
        setProfiles([{
          id: 1,
          name: 'Default Profile',
          type: 'primary',
          photo_url: null,
          is_active: true
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
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
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary-500"></div>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {currentProfile?.photo_url ? (
              <img
                src={currentProfile.photo_url}
                alt={currentProfile.name}
                className="mr-2 h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="mr-2 h-5 w-5 text-gray-400" />
            )}
            <span>{currentProfile?.name || 'Select Profile'}</span>
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
          </>
        )}
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

            {isLoading ? (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary-500"></div>
                Loading profiles...
              </div>
            ) : profiles.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                No profiles found
              </div>
            ) : (
              profiles.map((profile) => (
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
              ))
            )}
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
