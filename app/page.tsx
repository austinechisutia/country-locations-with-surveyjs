'use client';

import dynamic from 'next/dynamic';

const SurveyComponent = dynamic(() => import("./components/Survey"), {
  ssr: false
});

export default function Survey() {
  return (
    <main className="flex-1 p-6 md:p-12 lg:p-24 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
            Survey <span className="text-indigo-600">Location</span> Manager
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Experience the next generation of data collection with our premium location tracking system.
            Seamless, vibrant, and incredibly intuitive.
          </p>
        </div>

        <div className="relative group p-[px] rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-2xl transition-all hover:scale-[1.01]">
          <div className="bg-white/90 backdrop-blur-xl rounded-[14px] overflow-hidden">
            <SurveyComponent />
          </div>
        </div>
      </div>
    </main>
  );
}