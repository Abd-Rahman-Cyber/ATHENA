import KeyboardScroll from "@/components/KeyboardScroll";

export const metadata = {
  title: "WpDev Keyboard",
  description: "Engineered clarity. See what's inside.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#ECECEC]">
      <KeyboardScroll />
    </main>
  );
}
