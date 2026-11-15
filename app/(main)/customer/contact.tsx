"use client";

import { useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function Contact() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: send { firstName, lastName, email, phone, message } to your API route
    console.log({ firstName, lastName, email, phone, message });
  };

  const inputClass =
    "w-full rounded-lg border border-indigo-900 bg-white px-4 py-3 text-black placeholder-gray-400 outline-none focus:border-indigo-500";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center rounded-3xl bg-indigo-900 px-6 py-16">
      <h1 className="text-4xl font-bold text-white">Contact</h1>
      <p className="mt-2 mb-10 text-white">Let&apos;s get in touch.</p>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-xl flex-col gap-5 rounded-3xl border border-indigo-400 bg-gradient-to-br from-indigo-300/40 via-indigo-500/30 to-indigo-800/40 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="firstName" className="text-sm text-white">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="lastName" className="text-sm text-white">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Smith"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-white">
              Your Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="johnsmith@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="text-sm text-white">
              Phone Number
            </label>
            <PhoneInput
              defaultCountry="NG"
              addInternationalOption={false}
              value={phone}
              onChange={(value) => setPhone(value ?? "")}
              className="min-h-[50px] w-full rounded-lg !border !border-indigo-900 !bg-white px-4 py-3 !text-black focus-within:!border-indigo-500 [&_input]:!border-0 [&_input]:!text-base [&_input]:!bg-transparent [&_input]:!text-black [&_input]:!shadow-none [&_input]:!outline-none [&_input::placeholder]:!text-gray-400 [&_option]:text-black"
              numberInputProps={{ id: "phone", placeholder: "Phone number" }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="message" className="text-sm text-white">
            Your Message
          </label>
          <textarea
            id="message"
            rows={5}
            placeholder="How can we help you?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="self-center rounded-full bg-indigo-200 px-8 py-3 text-sm font-semibold tracking-widest text-indigo-950 hover:bg-indigo-100"
        >
          SUBMIT
        </button>
      </form>
    </div>
  );
}