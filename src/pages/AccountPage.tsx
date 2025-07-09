import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { UserCircle, LogOut, Edit2, Save, X, Phone, Calendar, Globe2, Bell } from 'lucide-react';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import type { Database } from '@/lib/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

type ShippingAddress = {
  street: string;
  suburb: string;
  city: string;
  province: string;
  postal_code: string;
};

type SocialLinks = {
  facebook: string;
  instagram: string;
  twitter: string;
};

type Preferences = {
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
};

export default function AccountPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone_number: '',
    date_of_birth: '',
    bio: '',
    shipping_address: {
      street: '',
      suburb: '',
      city: '',
      province: '',
      postal_code: '',
    } as ShippingAddress,
    social_links: {
      facebook: '',
      instagram: '',
      twitter: '',
    } as SocialLinks,
    preferences: {
      email_notifications: true,
      sms_notifications: true,
      marketing_emails: true,
    } as Preferences
  });

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth/login');
          return;
        }

        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!profile) {
          // Instead of creating a new profile, just initialize the form with default values
          const defaultProfile = {
            id: session.user.id,
            email: session.user.email!,
            full_name: null,
            avatar_url: null,
            shipping_address: null,
            phone_number: null,
            date_of_birth: null,
            bio: null,
            social_links: {
              facebook: '',
              instagram: '',
              twitter: ''
            },
            preferences: {
              email_notifications: true,
              sms_notifications: true,
              marketing_emails: true
            }
          };
          
          if (mounted) {
            setProfile(null);
            setEditForm({
              full_name: '',
              phone_number: '',
              date_of_birth: '',
              bio: '',
              shipping_address: {
                street: '',
                suburb: '',
                city: '',
                province: '',
                postal_code: '',
              },
              social_links: defaultProfile.social_links,
              preferences: defaultProfile.preferences
            });
          }
        } else if (mounted) {
          setProfile(profile);
          setEditForm({
            full_name: profile.full_name || '',
            phone_number: profile.phone_number || '',
            date_of_birth: profile.date_of_birth || '',
            bio: profile.bio || '',
            shipping_address: profile.shipping_address as ShippingAddress || {
              street: '',
              suburb: '',
              city: '',
              province: '',
              postal_code: '',
            },
            social_links: profile.social_links as SocialLinks || {
              facebook: '',
              instagram: '',
              twitter: ''
            },
            preferences: profile.preferences as Preferences || {
              email_notifications: true,
              sms_notifications: true,
              marketing_emails: true
            }
          });
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth/login');
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
      setSigningOut(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setError(null);
      setSuccess(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session available');
      }

      // Validate phone number (South African format)
      if (editForm.phone_number && !editForm.phone_number.match(/^(\+27|0)[1-9][0-9]{8}$/)) {
        throw new Error('Invalid phone number format. Please use South African format (e.g., 0821234567 or +27821234567)');
      }

      // Validate date of birth (must be at least 13 years old)
      let validatedDateOfBirth = null;
      if (editForm.date_of_birth) {
        const birthDate = new Date(editForm.date_of_birth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (age < 13 || (age === 13 && monthDiff < 0)) {
          throw new Error('You must be at least 13 years old to use this service');
        }
        validatedDateOfBirth = editForm.date_of_birth;
      }

      // Validate bio length
      if (editForm.bio && editForm.bio.length > 500) {
        throw new Error('Bio must be 500 characters or less');
      }

      const profileData = {
        id: session.user.id,
        email: session.user.email!,
        full_name: editForm.full_name || null,
        phone_number: editForm.phone_number || null,
        date_of_birth: validatedDateOfBirth,
        bio: editForm.bio || null,
        shipping_address: editForm.shipping_address,
        social_links: editForm.social_links,
        preferences: editForm.preferences,
        updated_at: new Date().toISOString()
      };

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (upsertError) {
        console.error('Profile update error:', upsertError);
        throw upsertError;
      }

      setProfile(profileData as Profile);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleAddressSelect = (address: ShippingAddress) => {
    setEditForm(prev => ({
      ...prev,
      shipping_address: address
    }));
  };

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 min-h-screen">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <p className="text-red-500">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCircle className="h-6 w-6" />
              <CardTitle className="text-2xl">Account Settings</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-6 bg-green-50 text-green-600 p-4 rounded-lg">
              {success}
            </div>
          )}
          
          <div className="space-y-6">
            {loading ? (
              <p className="text-muted-foreground">Loading profile information...</p>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Profile Information</h3>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-sage-400 hover:text-sage-500 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveProfile}
                          className="text-sage-400 hover:text-sage-500 flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-300 mb-1">
                        Email
                      </label>
                      <p className="text-charcoal-300">{profile?.email || ''}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-300 mb-1">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-charcoal-300">
                          {profile?.full_name || 'Not set'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-300 mb-1">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="tel"
                            value={editForm.phone_number}
                            onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                            placeholder="0821234567"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                          />
                        </div>
                      ) : (
                        <p className="text-charcoal-300">
                          {profile?.phone_number || 'Not set'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-300 mb-1">
                        Date of Birth
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="date"
                            value={editForm.date_of_birth}
                            onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                          />
                        </div>
                      ) : (
                        <p className="text-charcoal-300">
                          {profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not set'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-300 mb-1">
                        Bio
                      </label>
                      {isEditing ? (
                        <textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                          maxLength={500}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <p className="text-charcoal-300">
                          {profile?.bio || 'Not set'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-300 mb-1">
                        Shipping Address
                      </label>
                      {isEditing ? (
                        <AddressAutocomplete
                          onAddressSelect={handleAddressSelect}
                          defaultValue={editForm.shipping_address?.street}
                        />
                      ) : (
                        <div className="text-charcoal-300">
                          {profile?.shipping_address ? (
                            <>
                              <p>{(profile.shipping_address as ShippingAddress).street}</p>
                              <p>{(profile.shipping_address as ShippingAddress).suburb}</p>
                              <p>
                                {(profile.shipping_address as ShippingAddress).city},{' '}
                                {(profile.shipping_address as ShippingAddress).province}
                              </p>
                              <p>{(profile.shipping_address as ShippingAddress).postal_code}</p>
                            </>
                          ) : (
                            'No shipping address set'
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-300 mb-1">
                        Social Links
                      </label>
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="relative">
                            <Globe2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="url"
                              placeholder="Facebook URL"
                              value={editForm.social_links.facebook}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                social_links: {
                                  ...editForm.social_links,
                                  facebook: e.target.value
                                }
                              })}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                            />
                          </div>
                          <div className="relative">
                            <Globe2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="url"
                              placeholder="Instagram URL"
                              value={editForm.social_links.instagram}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                social_links: {
                                  ...editForm.social_links,
                                  instagram: e.target.value
                                }
                              })}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                            />
                          </div>
                          <div className="relative">
                            <Globe2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="url"
                              placeholder="Twitter URL"
                              value={editForm.social_links.twitter}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                social_links: {
                                  ...editForm.social_links,
                                  twitter: e.target.value
                                }
                              })}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {profile?.social_links && (
                            <>
                              {(profile.social_links as SocialLinks)?.facebook && (
                                <p className="text-charcoal-300">
                                  Facebook: {(profile.social_links as SocialLinks).facebook}
                                </p>
                              )}
                              {(profile.social_links as SocialLinks)?.instagram && (
                                <p className="text-charcoal-300">
                                  Instagram: {(profile.social_links as SocialLinks).instagram}
                                </p>
                              )}
                              {(profile.social_links as SocialLinks)?.twitter && (
                                <p className="text-charcoal-300">
                                  Twitter: {(profile.social_links as SocialLinks).twitter}
                                </p>
                              )}
                              {!Object.values(profile.social_links as SocialLinks).some(Boolean) && (
                                <p className="text-charcoal-300">No social links set</p>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-300 mb-1">
                        Notification Preferences
                      </label>
                      {isEditing ? (
                        <div className="space-y-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editForm.preferences.email_notifications}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                preferences: {
                                  ...editForm.preferences,
                                  email_notifications: e.target.checked
                                }
                              })}
                              className="rounded border-gray-300 text-sage-400 focus:ring-sage-400"
                            />
                            <span className="text-charcoal-300">Email notifications</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editForm.preferences.sms_notifications}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                preferences: {
                                  ...editForm.preferences,
                                  sms_notifications: e.target.checked
                                }
                              })}
                              className="rounded border-gray-300 text-sage-400 focus:ring-sage-400"
                            />
                            <span className="text-charcoal-300">SMS notifications</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editForm.preferences.marketing_emails}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                preferences: {
                                  ...editForm.preferences,
                                  marketing_emails: e.target.checked
                                }
                              })}
                              className="rounded border-gray-300 text-sage-400 focus:ring-sage-400"
                            />
                            <span className="text-charcoal-300">Marketing emails</span>
                          </label>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {profile?.preferences && (
                            <>
                              <p className="text-charcoal-300 flex items-center gap-2">
                                <Bell className="w-4 h-4" />
                                Email notifications: {(profile.preferences as Preferences)?.email_notifications ? 'Enabled' : 'Disabled'}
                              </p>
                              <p className="text-charcoal-300 flex items-center gap-2">
                                <Bell className="w-4 h-4" />
                                SMS notifications: {(profile.preferences as Preferences)?.sms_notifications ? 'Enabled' : 'Disabled'}
                              </p>
                              <p className="text-charcoal-300 flex items-center gap-2">
                                <Bell className="w-4 h-4" />
                                Marketing emails: {(profile.preferences as Preferences)?.marketing_emails ? 'Enabled' : 'Disabled'}
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 pt-6 border-t">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {signingOut ? (
                <>
                  <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <span>Signing out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </>
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}