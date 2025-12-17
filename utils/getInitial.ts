export const getInitials = (fullName: string): string  => {
  if (!fullName || fullName.trim().length === 0) {
    return '';
  }

  const parts = fullName.trim().split(/\s+/);
  
  if (parts.length === 1) {
    // Single name: return first character
    return parts[0].charAt(0).toUpperCase();
  }
  
  // Multiple names: return first character of first and last names
  const firstInitial = parts[0].charAt(0).toUpperCase();
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  
  return `${firstInitial}${lastInitial}`;
}
