import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://placement.university.edu";

  return [
    { url: baseUrl,                      lastModified: new Date(), changeFrequency: "monthly",  priority: 1   },
    { url: `${baseUrl}/register`,        lastModified: new Date(), changeFrequency: "monthly",  priority: 0.9 },
    { url: `${baseUrl}/login`,           lastModified: new Date(), changeFrequency: "yearly",   priority: 0.8 },
    { url: `${baseUrl}/dashboard`,       lastModified: new Date(), changeFrequency: "weekly",   priority: 0.9 },
    { url: `${baseUrl}/dashboard/jobs`,  lastModified: new Date(), changeFrequency: "daily",    priority: 0.8 },
  ];
}
