import { useState, useEffect } from 'react';

import axios, { endpoints } from 'src/lib/axios';

// To get the user from the <AuthContext/>, you can use

// Change:
// import { useMockedUser } from 'src/auth/hooks';
// const { user } = useMockedUser();

// To:
// import { useAuthContext } from 'src/auth/hooks';
// const { user } = useAuthContext();

// ----------------------------------------------------------------------

export function useMockedUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(endpoints.auth.me);
        const userData = response.data?.data || response.data;
        
        // Transform API data to match expected format
        const transformedUser = {
          id: userData.id,
          displayName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username,
          email: userData.email,
          photoURL: userData.avatarUrl || null,
          phoneNumber: userData.phoneNumber,
          country: userData.country,
          address: userData.address,
          state: userData.state,
          city: userData.city,
          zipCode: userData.zipCode,
          about: userData.note || userData.about,
          role: userData.role?.name || userData.role || 'user',
          isPublic: false, // Always false as per requirement
          // Keep original data for compatibility
          ...userData,
        };
        
        setUser(transformedUser);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Fallback to null user
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return { user, loading };
}
