"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          client_id: "388960353527-fh4grc6mla425lg0e3g1hh67omtrdihd.apps.googleusercontent.com",
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Humor Flavor Tool
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Sign in to manage humor flavors and generate captions.
        </p>
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
