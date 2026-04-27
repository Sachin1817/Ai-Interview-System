import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const signup = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const sendVerification = () => {
        if (auth.currentUser) {
            return sendEmailVerification(auth.currentUser);
        }
    };

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
            if (user) {
                // We handle backend tokens explicitly during login/sync.
                // We only store the basic user info here for immediate UI availability.
                localStorage.setItem('user', JSON.stringify({
                    email: user.email,
                    uid: user.uid,
                    name: user.displayName || user.email.split('@')[0]
                }));
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signup,
        login,
        logout,
        resetPassword,
        sendVerification,
        loginWithGoogle,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
