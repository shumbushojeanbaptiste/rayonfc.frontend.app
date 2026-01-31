import React from "react";

export default function VideoAudioHelp() {
  return (
    <div className="max-w-7xl space-y-8">
      {/* HEADER */}
      <div className="bg-indigo-700 dark:bg-indigo-900 text-white p-8 rounded-lg shadow-8">
        <h1 className="text-3xl font-bold">Video & Audio</h1>
        <p className="mt-2 text-indigo-100 max-w-2xl">
          Learn how to manage video playback, audio settings, and media quality
          for the best experience.
        </p>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT NAV / MEDIA CATEGORIES */}
        <aside className="lg:col-span-1 bg-white dark:bg-black p-5 rounded shadow-8">
          <h3 className="font-semibold mb-4 dark:text-slate-300">
            Media Topics
          </h3>
          <ul className="space-y-3 text-gray-600 dark:text-slate-400">
            <li className="font-medium text-indigo-600 dark:text-indigo-400">
              Playback Issues
            </li>
            <li>Audio Problems</li>
            <li>Video Quality</li>
            <li>Live Streams</li>
            <li>Supported Formats</li>
          </ul>
        </aside>

        {/* CONTENT */}
        <section className="lg:col-span-3 space-y-6">
          {/* MEDIA TILES */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-black p-5 rounded shadow-8">
              <h4 className="font-semibold dark:text-slate-300">
                Video Not Playing
              </h4>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                Check your internet connection and refresh the page.
              </p>
            </div>

            <div className="bg-white dark:bg-black p-5 rounded shadow-8">
              <h4 className="font-semibold dark:text-slate-300">
                No Sound
              </h4>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                Verify volume settings and output device selection.
              </p>
            </div>

            <div className="bg-white dark:bg-black p-5 rounded shadow-8">
              <h4 className="font-semibold dark:text-slate-300">
                Low Video Quality
              </h4>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                Quality adjusts automatically based on network speed.
              </p>
            </div>
          </div>

          {/* HOW IT WORKS */}
          <div className="bg-white dark:bg-black p-6 rounded shadow-8">
            <h2 className="text-xl font-semibold dark:text-slate-300 mb-4">
              How Video & Audio Streaming Works
            </h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  1
                </div>
                <p className="text-gray-600 dark:text-slate-400">
                  Media is streamed in real time using adaptive bitrate
                  technology.
                </p>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  2
                </div>
                <p className="text-gray-600 dark:text-slate-400">
                  Audio and video quality adjusts automatically based on your
                  device and connection.
                </p>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  3
                </div>
                <p className="text-gray-600 dark:text-slate-400">
                  Playback controls allow pausing, seeking, and volume control.
                </p>
              </div>
            </div>
          </div>

          {/* TROUBLESHOOTING */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded">
            <h3 className="font-semibold text-red-700 dark:text-red-400">
              Common Media Issues
            </h3>
            <ul className="list-disc ml-5 mt-2 text-sm text-red-700 dark:text-red-300">
              <li>Outdated browser or device</li>
              <li>Muted system audio</li>
              <li>Restricted network or firewall</li>
              <li>Unsupported media format</li>
            </ul>
          </div>

          {/* ADMIN CONTENT */}
          <div className="bg-white dark:bg-black p-6 rounded shadow-8">
            <h2 className="text-xl font-semibold dark:text-slate-300 mb-2">
              Admin Media Controls
            </h2>
            <p className="text-gray-600 dark:text-slate-400 max-w-2xl">
              Administrators can manage uploaded media, monitor streaming
              performance, control access permissions, and enforce content
              policies.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
