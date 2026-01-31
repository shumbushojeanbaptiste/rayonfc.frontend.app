import React, { useState } from "react";

export default function Hdashboard() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="bg-purple-700 dark:bg-purple-900 text-white p-8 rounded-lg shadow-8">
        <h1 className="text-3xl font-bold">Profile & Media Management</h1>
        <p className="mt-2 text-purple-100 max-w-3xl">
          Learn how to manage your profile, share videos and audio, and edit media content efficiently.
        </p>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: "profile", label: "Profile" },
          { key: "sharing", label: "Sharing" },
          { key: "editing", label: "Editing Media" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 font-medium rounded-t ${
              activeTab === tab.key
                ? "bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100"
                : "text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="bg-white dark:bg-black p-6 rounded shadow-8 space-y-6">
        {activeTab === "profile" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold dark:text-slate-300">Managing Your Profile</h2>
            <p className="text-gray-600 dark:text-slate-400">
              Update your personal information, profile picture, and account settings.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded shadow">
                <h4 className="font-semibold dark:text-slate-200">Change Password</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                  Keep your account secure by updating your password regularly.
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded shadow">
                <h4 className="font-semibold dark:text-slate-200">Update Profile Info</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                  Edit your name, avatar, and other personal details.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "sharing" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold dark:text-slate-300">Sharing Videos & Audio</h2>
            <p className="text-gray-600 dark:text-slate-400">
              Learn how to share media with others and manage visibility settings.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded shadow">
                <h4 className="font-semibold dark:text-slate-200">Public Sharing</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                  Share videos and audio with anyone on the platform.
                </p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded shadow">
                <h4 className="font-semibold dark:text-slate-200">Private Sharing</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                  Control who can view or listen to your media by sending private links.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "editing" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold dark:text-slate-300">Editing Videos & Audio</h2>
            <p className="text-gray-600 dark:text-slate-400">
              Tips on trimming, enhancing, and optimizing media for better playback.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded shadow">
                <h4 className="font-semibold dark:text-slate-200">Trim & Cut</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                  Remove unwanted parts from your videos or audio tracks.
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded shadow">
                <h4 className="font-semibold dark:text-slate-200">Enhance Media</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                  Adjust brightness, contrast, and audio quality.
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded shadow">
                <h4 className="font-semibold dark:text-slate-200">Add Effects</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                  Apply filters, overlays, or audio effects to make content engaging.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN NOTICE */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">
            Admin Controls
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Administrators can moderate content, approve shared media, and manage editing permissions for users.
          </p>
        </div>
      </div>
    </div>
  );
}
