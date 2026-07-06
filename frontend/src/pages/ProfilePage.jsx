import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, saveUserProfile, uploadProfileImage, calculateCompletion } from '../services/profileService';
import { authAPI } from '../services/api';
import ProfileCard from '../components/profile/ProfileCard';
import ProfileImageUpload from '../components/profile/ProfileImageUpload';
import BasicInfoForm from '../components/profile/BasicInfoForm';
import { Save, Edit3, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branch: '',
    college: '',
    graduationYear: '',
    targetRole: '',
    profileImage: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser) {
        // Step 1. Instant loading from local cache (if exists)
        const cachedProfile = localStorage.getItem(`profile_${currentUser.uid}`);
        if (cachedProfile) {
          try {
            const parsed = JSON.parse(cachedProfile);
            setFormData(prev => ({ ...prev, ...parsed, email: currentUser.email }));
            setLoading(false); // Instantly show data!
          } catch (e) {
            console.error("Error parsing cached profile:", e);
          }
        }

        // Step 2. Fetch fresh data from Firestore with a 2.5s timeout race
        try {
          const profile = await Promise.race([
            getUserProfile(currentUser.uid),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout fetching profile")), 2500))
          ]);

          if (profile) {
            setFormData(prev => ({ ...prev, ...profile, email: currentUser.email }));
            localStorage.setItem(`profile_${currentUser.uid}`, JSON.stringify(profile));
          } else {
            // New user scenario
            setFormData(prev => ({ ...prev, email: currentUser.email }));
            setIsEditing(true);
          }
        } catch (error) {
          console.warn("Firestore profile fetch timed out or failed; using cached/empty fallback:", error);
          if (!cachedProfile) {
            // Fallback: let them fill out a new profile rather than hanging
            setFormData(prev => ({ ...prev, email: currentUser.email }));
            setIsEditing(true);
          }
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [currentUser]);

  const validate = () => {
    let newErrors = {};
    if (!formData.name || !formData.name.trim()) newErrors.name = "Full Name is required";
    
    // Make phone optional, or if provided, just check it has at least 10 digits
    if (formData.phone && formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = "Valid phone number required";
    }
    
    if (!formData.branch) newErrors.branch = "Branch is required";
    if (!formData.college || !formData.college.trim()) newErrors.college = "College Name is required";
    if (!formData.graduationYear) newErrors.graduationYear = "Graduation Year is required";
    if (!formData.targetRole) newErrors.targetRole = "Target Job Role is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setStatus({ type: null, message: '' });

    try {
      let imageUrl = formData.profileImage;
      if (selectedFile) {
        imageUrl = await uploadProfileImage(currentUser.uid, selectedFile);
      }

      const profileToSave = {
        ...formData,
        profileImage: imageUrl,
        profileCompletion: calculateCompletion({ ...formData, profileImage: imageUrl })
      };

      // 1. Instantly write to local caches (UI will reflect this immediately)
      localStorage.setItem(`profile_${currentUser.uid}`, JSON.stringify(profileToSave));
      
      const localUser = localStorage.getItem('user');
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser);
          parsed.name = profileToSave.name;
          parsed.branch = profileToSave.branch;
          localStorage.setItem('user', JSON.stringify(parsed));
        } catch (e) {
          console.error("Failed to sync cached user credentials:", e);
        }
      }

      // 2. Instantly update frontend state, close editing, and show success banner!
      setFormData(profileToSave);
      setIsEditing(false);
      setSaving(false);
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);

      // 3. Trigger Firestore and backend sync in the background (asynchronous)
      // This will run concurrently and will not block the user UI at all!
      Promise.all([
        saveUserProfile(currentUser.uid, profileToSave),
        authAPI.updateProfile(profileToSave)
      ]).catch(err => {
        console.warn("Background database/backend synchronization failed:", err);
      });

    } catch (error) {
      console.error("Save profile error:", error);
      setStatus({ type: 'error', message: 'Failed to update profile. Please try again.' });
      setSaving(false);
    } finally {
      setSelectedFile(null);
    }
  };

  const completion = calculateCompletion(formData);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 md:px-6 flex flex-col items-center justify-start overflow-y-auto">
      <ProfileCard completion={completion}>
        
        {/* Status Notification */}
        <AnimatePresence>
          {status.message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl mb-8 border shadow-lg relative z-20 ${
                status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
              }`}
            >
              {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span className="font-bold text-sm tracking-wide">{status.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSave} className="w-full flex flex-col items-center">
          
          {/* Avatar Area */}
          <div className="mb-10 w-full flex justify-center">
            <div>
                <ProfileImageUpload
                  currentImage={formData.profileImage}
                  onImageSelect={(file) => setSelectedFile(file)}
                  onImageRemove={() => {
                    setFormData(prev => ({ ...prev, profileImage: '' }));
                    setSelectedFile(null);
                  }}
                />
            </div>
          </div>

          {/* Form Fields Section */}
          <div className="w-full">
             <BasicInfoForm formData={formData} setFormData={setFormData} errors={errors} />
          </div>

          {/* Actions */}
          <div className="mt-12 flex gap-4 w-full justify-center">
            <button
              type="submit"
              disabled={saving}
              className="px-10 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-900 font-black flex items-center gap-2 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50 active:scale-95 disabled:scale-100"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save />} Save Profile
            </button>
          </div>
        </form>
      </ProfileCard>
    </div>
  );
};

export default ProfilePage;
