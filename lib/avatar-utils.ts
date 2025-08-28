/**
 * Generate a consistent avatar URL for users
 * Uses DiceBear API to create unique avatars based on user identifier
 */

export function generateAvatarUrl(identifier: string, size: number = 120): string {
  // Use DiceBear API for consistent, unique avatars
  // The 'initials' style creates simple, professional avatars
  const encodedIdentifier = encodeURIComponent(identifier);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodedIdentifier}&size=${size}&backgroundColor=ff6b6b,ff8e53&textColor=ffffff`;
}

/**
 * Generate a fallback avatar with user initials
 * This is used when the external API is not available
 */
export function generateFallbackAvatar(identifier: string, size: number = 120): string {
  const initials = identifier
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FF8E53;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#bg)"/>
      <text x="${size/2}" y="${size/2 + size/8}" font-family="Arial, sans-serif" font-size="${size/3}" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
    </svg>
  `)}`;
}

/**
 * Get the best available avatar for a user
 * Falls back to generated avatar if no custom image is provided
 */
export function getUserAvatar(user: { image?: string | null; name?: string | null; email: string }, size: number = 120): string {
  if (user.image) {
    return user.image;
  }
  
  const identifier = user.name || user.email;
  return generateAvatarUrl(identifier, size);
}

/**
 * Get avatar with fallback for components that need it
 */
export function getAvatarWithFallback(
  imageUrl: string | null | undefined, 
  identifier: string, 
  size: number = 120
): string {
  if (imageUrl) {
    return imageUrl;
  }
  
  return generateAvatarUrl(identifier, size);
}

