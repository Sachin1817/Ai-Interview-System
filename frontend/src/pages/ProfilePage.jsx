import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, saveUserProfile, uploadProfileImage, calculateCompletion } from '../services/profileService';
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
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile) {
            setFormData(prev => ({ ...prev, ...profile, email: currentUser.email }));
          } else {
            setFormData(prev => ({ ...prev, email: currentUser.email }));
            setIsEditing(true); // Default to edit if new user
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [currentUser]);

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required";
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) newErrors.phone = "Valid 10-digit number required";
    if (!formData.branch) newErrors.branch = "Branch is required";
    if (!formData.college.trim()) newErrors.college = "College Name is required";
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

      await saveUserProfile(currentUser.uid, profileToSave);
      setFormData(profileToSave);
      setIsEditing(false);
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
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
    <div className="min-h-screen pt-40 pb-20 px-6 flex flex-col items-center justify-center">
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
            <div className={isEditing ? '' : 'pointer-events-none'}>
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
          <div className={`w-full transition-all duration-500 ${isEditing ? 'opacity-100' : 'opacity-80 pointer-events-none grayscale-[0.3]'}`}>
             <BasicInfoForm formData={formData} setFormData={setFormData} errors={errors} />
          </div>

          {/* Actions */}
          <div className="mt-12 flex gap-4 w-full justify-center">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:border-slate-300 dark:hover:border-slate-500 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-10 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-900 font-black flex items-center gap-2 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50 active:scale-95 disabled:scale-100"
                >
                  {saving ? <Loader2 className="animate-spin" /> : <Save />} Save Profile
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-12 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-accent dark:text-cyan-400 font-black flex items-center gap-2 hover:border-accent/50 dark:hover:border-cyan-500/50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xl active:scale-95"
              >
                <Edit3 size={20} /> Edit Profile
              </button>
            )}
          </div>
        </form>
      </ProfileCard>
    </div>
  );
};

export default ProfilePage;
