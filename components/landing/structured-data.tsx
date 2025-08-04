import { APP_CONFIG } from "@/lib/constants"

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": APP_CONFIG.name,
    "description": APP_CONFIG.description,
    "url": "/",
    "logo": "/logo.png",
    "sameAs": [
      "https://facebook.com/mindflow",
      "https://twitter.com/mindflow",
      "https://linkedin.com/company/mindflow"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-123-4567",
      "contactType": "customer service",
      "email": "support@mindflow.com"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Learning Street",
      "addressLocality": "Education City",
      "postalCode": "12345",
      "addressCountry": "US"
    },
    "offers": {
      "@type": "Offer",
      "category": "Educational Services",
      "availability": "https://schema.org/InStock",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free access to learning management system"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}