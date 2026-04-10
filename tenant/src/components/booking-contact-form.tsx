"use client";

import { User, Phone, Mail } from "lucide-react";

interface BookingContactFormProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  subtextColor: string;
  inputBg: string;
}

export function BookingContactForm({
  firstName,
  lastName,
  email,
  phone,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  subtextColor,
  inputBg,
}: BookingContactFormProps) {
  return (
    <div className="space-y-3 mb-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={`mb-1 block text-xs font-medium ${subtextColor}`}>First Name *</label>
          <div className="relative">
            <User className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${subtextColor}`} />
            <input
              type="text"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              placeholder="John"
              className={`w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>
        <div>
          <label className={`mb-1 block text-xs font-medium ${subtextColor}`}>Last Name *</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            placeholder="Doe"
            className={`w-full rounded-lg border py-2.5 px-3 text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>
      <div>
        <label className={`mb-1 block text-xs font-medium ${subtextColor}`}>Phone Number *</label>
        <div className="relative">
          <Phone className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${subtextColor}`} />
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+383 44 123 456"
            className={`w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>
      <div>
        <label className={`mb-1 block text-xs font-medium ${subtextColor}`}>
          Email <span className={subtextColor}>(optional)</span>
        </label>
        <div className="relative">
          <Mail className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${subtextColor}`} />
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="john@example.com"
            className={`w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>
    </div>
  );
}
