"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setEmail(data.user.email);
    });
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col items-center justify-center space-y-4 mb-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <UserCircle className="w-12 h-12 text-gray-400" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">Your Profile</h2>
            {email ? (
              <p className="text-gray-500">{email}</p>
            ) : (
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto mt-1"></div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
