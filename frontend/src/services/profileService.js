import { db, storage } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Saves or updates user profile data in Firestore.
 * @param {string} userId - The unique user ID from Firebase Auth.
 * @param {object} profileData - The profile data object.
 */
export const saveUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      userId,
      ...profileData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
};

/**
 * Retrieves user profile data from Firestore.
 * @param {string} userId - The unique user ID.
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/**
 * Uploads a profile picture to Firebase Storage and returns the download URL.
 * @param {string} userId - The unique user ID.
 * @param {File} file - The image file object.
 */
export const uploadProfileImage = async (userId, file) => {
  try {
    const storageRef = ref(storage, `profile_images/${userId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
};

/**
 * Calculates the profile completion percentage based on filled fields.
 * @param {object} profileData - The user profile data.
 */
export const calculateCompletion = (profileData) => {
  const fields = [
    'name', 'phone', 'branch', 'college', 'graduationYear', 'targetRole', 'profileImage'
  ];
  const filledFields = fields.filter(field => !!profileData[field]);
  return Math.round((filledFields.length / fields.length) * 100);
};
