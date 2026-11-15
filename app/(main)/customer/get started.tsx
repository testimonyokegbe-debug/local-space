"use client";

import { useEffect, useState } from "react";

const taglines = [
  "Everything you need. One space to find it.",
  "Shop products. Book services. Get things done.",
  "Shop smarter. Discover more.",
  "One marketplace. Endless convenience.",
  "From great finds to helpful services.",
  "Bringing businesses and customers closer.",
  "The right service is closer than you think.",
  "Shop what you want. Book when you need",
  "Need a service? Start right here.",
  "Find it here.",
];

const THREE_HOURS = 3 * 60 * 60 * 1000;

function getTagline() {
  const slot = Math.floor(Date.now() / THREE_HOURS);
  return taglines[slot % taglines.length];
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Greeting({ name }: { name?: string }) {
  const [greeting, setGreeting] = useState("");
  const [tagline, setTagline] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());
    setTagline(getTagline());

    const id = setInterval(() => setTagline(getTagline()), THREE_HOURS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-white">
      <h1 className="min-h-[1.2em] text-3xl font-bold md:text-5xl">
        {greeting}
        {name ? "," : ""}{" "}
        {name && <span className="text-[#c4b5fd]">{name}</span>}
      </h1>
        <p className="mt-1 min-h-[1.5em] text-base text-white/80">{tagline}</p>
    </div>
  );
}