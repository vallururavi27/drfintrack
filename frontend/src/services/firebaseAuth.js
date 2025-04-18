import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebaseClient";

// Sign up a new user
export const signUp = async (email, password, name) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with name
    await updateProfile(user, { displayName: name });
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Create user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      currency: "INR", // Default currency for Indian users
      is_email_verified: false,
      two_factor_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    return { user, error: null };
  } catch (error) {
    console.error("Error signing up:", error);
    return { user: null, error: error.message };
  }
};

// Sign in an existing user
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if user has a profile in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    // If no profile exists, create one
    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName || email.split('@')[0],
        email: email,
        currency: "INR",
        is_email_verified: user.emailVerified,
        two_factor_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    return { user, error: null };
  } catch (error) {
    console.error("Error signing in:", error);
    return { user: null, error: error.message };
  }
};

// Sign out the current user
export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    console.error("Error signing out:", error);
    return { error: error.message };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { error: error.message };
  }
};

// Update user password
export const changePassword = async (newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is signed in");
    
    await updatePassword(user, newPassword);
    return { error: null };
  } catch (error) {
    console.error("Error changing password:", error);
    return { error: error.message };
  }
};

// Update user email
export const changeEmail = async (newEmail) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is signed in");
    
    await updateEmail(user, newEmail);
    
    // Update email in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: newEmail,
      updated_at: new Date().toISOString()
    }, { merge: true });
    
    // Send verification email
    await sendEmailVerification(user);
    
    return { error: null };
  } catch (error) {
    console.error("Error changing email:", error);
    return { error: error.message };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Listen for auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Resend verification email
export const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is signed in");
    
    await sendEmailVerification(user);
    return { error: null };
  } catch (error) {
    console.error("Error resending verification email:", error);
    return { error: error.message };
  }
};
