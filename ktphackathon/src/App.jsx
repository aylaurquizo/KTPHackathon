import React, { useState, useEffect, createContext, useContext } from 'react';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- 1. SUPABASE CLIENT SETUP ---
// Initializes the Supabase client using the environment variables
// you set up in your .env.local file.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


// --- 2. AUTHENTICATION CONTEXT ---
// This creates a global "context" to manage and share user authentication
// state (like who is logged in) across the entire application.

const AuthContext = createContext();

// The AuthProvider component wraps your app and makes auth data available
export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for an active session when the app loads
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };
        getSession();

        // Listen for changes in authentication state (login, logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        // Cleanup the subscription when the component unmounts
        return () => subscription.unsubscribe();
    }, []);

    // Functions for sign-up, sign-in, and sign-out
    const value = {
        session,
        user,
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
    };

    // We only render the app after the initial session check is complete
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily access auth data from any component
export const useAuth = () => {
    return useContext(AuthContext);
};


// --- 3. UI COMPONENTS & PAGES ---

const AuthForm = ({ isSignUp = false, setView }) => {
    const { signUp, signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const authData = { email, password };
        if (isSignUp) {
            authData.options = { data: { full_name: fullName } };
        }

        const { error } = isSignUp ? await signUp(authData) : await signIn(authData);

        if (error) {
            setError(error.message);
        } else if (isSignUp) {
            setMessage('Check your email for the confirmation link!');
            setEmail('');
            setPassword('');
            setFullName('');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">
                    {isSignUp ? 'Create an Account' : 'Sign In'}
                </h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {isSignUp && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-2 text-gray-700 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 text-gray-700 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 text-gray-700 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>
                {error && <p className="text-sm text-center text-red-500">{error}</p>}
                {message && <p className="text-sm text-center text-green-500">{message}</p>}
                <p className="text-sm text-center text-gray-600">
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <a href="#" onClick={(e) => { e.preventDefault(); setView(isSignUp ? 'login' : 'signup'); }} className="font-medium text-blue-600 hover:underline">
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </a>
                </p>
            </div>
        </div>
    );
};

const HomePage = () => {
    const { user, signOut } = useAuth();
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold">Welcome to the Gym Subscription Box!</h1>
            <p className="mt-2 text-gray-700">You are logged in as: {user?.email}</p>
            <button
                onClick={signOut}
                className="px-4 py-2 mt-4 font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600"
            >
                Sign Out
            </button>
        </div>
    );
};

// --- 4. MAIN APP COMPONENT ---
// This is the root of your application. It uses the AuthProvider and
// handles which page to show based on the authentication state.

function App() {
    const [view, setView] = useState('signup'); // Default view
    const { session } = useContext(AuthContext); // Use the raw context here before it's fully initialized

    // This effect determines which view to show based on the session
    useEffect(() => {
        if (session) {
            setView('home');
        } else {
            // If there's no session, default to the sign-up or login page
            setView('signup'); 
        }
    }, [session]);
    
    // Render the correct view
    const renderView = () => {
        switch (view) {
            case 'signup':
                return <AuthForm isSignUp={true} setView={setView} />;
            case 'login':
                return <AuthForm isSignUp={false} setView={setView} />;
            case 'home':
                return <HomePage />;
            default:
                return <AuthForm isSignUp={true} setView={setView} />;
        }
    };

    return <div className="min-h-screen bg-gray-100">{renderView()}</div>;
}

// The final exported component that gets rendered in main.jsx
export default function AppWrapper() {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}