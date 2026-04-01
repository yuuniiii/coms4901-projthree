import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_superadmin, is_matrix_admin")
    .eq("id", user.id)
    .single();

  if (error || !profile || (!profile.is_superadmin && !profile.is_matrix_admin)) {
    // If user is logged in but not an admin, redirect to a non-admin page or show error
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
        <p className="mt-2">You do not have permission to access this area.</p>
        <Link href="/login" className="mt-4 text-blue-600 hover:underline">
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <nav className="border-b dark:border-gray-800 p-4 sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-6 items-center">
            <Link href="/admin/flavors" className="font-semibold hover:text-blue-600">
              Humor Flavors
            </Link>
            <Link href="/admin/testing" className="font-semibold hover:text-blue-600">
              Testing Tool
            </Link>
            <Link href="/admin/results" className="font-semibold hover:text-blue-600">
              Results
            </Link>
          </div>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <span className="text-sm text-gray-500 hidden md:inline">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button className="text-sm hover:underline">Sign Out</button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
