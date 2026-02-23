import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "TetrisBench — Human vs AI Tetris",
  description: "Benchmark LLMs by making them write Tetris scoring functions. Can you beat the AI?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${pixelFont.variable} antialiased bg-[#0a0a0f] text-white min-h-screen`}>
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50">
          <div className="flex items-center gap-6">
            <a href="/leaderboard" className="flex items-center gap-2 text-sm text-gray-400 hover:text-yellow-400 transition-colors font-pixel">
              🏆 <span>Leaderboard</span>
            </a>
            <a href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-pixel">
              🎮 <span>TetrisBench</span>
            </a>
            <a href="/model-vs-model" className="flex items-center gap-2 text-sm text-gray-400 hover:text-fuchsia-400 transition-colors font-pixel">
              🤖 <span>Model vs Model</span>
            </a>
          </div>
          <div className="text-xs text-gray-600 font-pixel">
            Guest Mode
          </div>
        </nav>

        <main className="p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
