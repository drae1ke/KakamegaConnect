import { Droplets, Zap, Construction, Heart, GraduationCap, Trash2, Shield, Trees } from "lucide-react";

export const serviceCategories = [
  {
    id: "water",
    title: "Water Services",
    description: "Water supply, billing, new connections, and repairs",
    icon: Droplets,
    category: "Water & Sanitation",
  },
  {
    id: "electricity",
    title: "Street Lighting",
    description: "Street light repairs and new installations",
    icon: Zap,
    category: "Infrastructure",
  },
  {
    id: "roads",
    title: "Roads & Transport",
    description: "Pothole repairs, road maintenance, and signage",
    icon: Construction,
    category: "Infrastructure",
  },
  {
    id: "health",
    title: "Health Services",
    description: "Public health, hospital services, and vaccination",
    icon: Heart,
    category: "Health",
  },
  {
    id: "education",
    title: "Education",
    description: "School support, bursaries, and ECD programs",
    icon: GraduationCap,
    category: "Education",
  },
  {
    id: "waste",
    title: "Waste Management",
    description: "Garbage collection and disposal services",
    icon: Trash2,
    category: "Environment",
  },
  {
    id: "security",
    title: "Security Services",
    description: "County enforcement and security patrols",
    icon: Shield,
    category: "Security",
  },
  {
    id: "environment",
    title: "Environment",
    description: "Tree planting, parks, and environmental conservation",
    icon: Trees,
    category: "Environment",
  },
];

export const subcounties = [
  "Lurambi",
  "Shinyalu",
  "Ikolomani",
  "Malava",
  "Butere",
  "Mumias East",
  "Mumias West",
  "Matungu",
  "Navakholo",
  "Khwisero",
  "Likuyani",
  "Lugari",
];

export const wards = {
  Lurambi: ["Butsotso East", "Butsotso South", "Butsotso Central", "Mahiakalo", "Shirere"],
  Shinyalu: ["Murhanda", "Isukha West", "Isukha Central", "Isukha East", "Isukha South"],
  Ikolomani: ["Idakho South", "Idakho East", "Idakho North", "Idakho Central"],
  Malava: ["West Kabras", "Chemuche", "East Kabras", "Butali/Chegulo", "Manda/Shivanga", "Shirugu/Mugai"],
  Butere: ["Marama West", "Marama Central", "Marama North", "Marama South", "Marachi"],
  "Mumias East": ["Lusheya/Lubinu", "Malaha/Isongo", "East Wanga"],
  "Mumias West": ["Mumias Central", "Mumias North", "Etenje"],
  Matungu: ["Mayoni", "Koyonzo", "Namamali"],
  Navakholo: ["Ingotse-Matiha", "Shinoyi-Shikomari", "Bunyala West", "Bunyala East", "Bunyala Central"],
  Khwisero: ["Kisa North", "Kisa East", "Kisa West", "Kisa Central"],
  Likuyani: ["Likuyani", "Sango", "Kongoni", "Nzoia"],
  Lugari: ["Mautuma", "Lugari", "Lumakanda", "Chekalini", "Chevaywa"],
};

export interface ServiceRequest {
  id: string;
  trackingNumber: string;
  category: string;
  subcounty: string;
  ward: string;
  description: string;
  location: string;
  status: "pending" | "in-progress" | "resolved" | "closed";
  createdAt: Date;
  updatedAt: Date;
  type: "request" | "complaint";
}

// Mock submissions storage
let mockSubmissions: ServiceRequest[] = [];

export const addSubmission = (submission: Omit<ServiceRequest, "id" | "trackingNumber" | "status" | "createdAt" | "updatedAt">) => {
  const newSubmission: ServiceRequest = {
    ...submission,
    id: Math.random().toString(36).substr(2, 9),
    trackingNumber: `KC${Date.now().toString().slice(-8)}`,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockSubmissions.push(newSubmission);
  // Store in localStorage for persistence
  localStorage.setItem("kakamega_submissions", JSON.stringify(mockSubmissions));
  return newSubmission;
};

export const getSubmissions = (): ServiceRequest[] => {
  const stored = localStorage.getItem("kakamega_submissions");
  if (stored) {
    mockSubmissions = JSON.parse(stored);
  }
  return mockSubmissions;
};

export const findByTrackingNumber = (trackingNumber: string): ServiceRequest | undefined => {
  const submissions = getSubmissions();
  return submissions.find((s) => s.trackingNumber.toLowerCase() === trackingNumber.toLowerCase());
};
