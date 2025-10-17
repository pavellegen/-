export function formatPhoneNumber(value: string): string {
  if (!value) return '';
  
  let cleaned = value.replace(/\D/g, '');

  // Handle Russian prefixes 8 -> 7
  if (cleaned.startsWith('8')) {
    cleaned = '7' + cleaned.slice(1);
  }

  // Ensure it starts with 7 for formatting, but only if it's a potential Russian number
  if (cleaned.length > 0 && !cleaned.startsWith('7')) {
    // If user deleted +7 and types '9', assume it's Russian
    if (cleaned.startsWith('9')) {
      cleaned = '7' + cleaned;
    }
  }
  
  // Cap the length to a valid Russian number + country code
  cleaned = cleaned.slice(0, 11);
  
  const match = cleaned.match(/^(\d{1,1})?(\d{1,3})?(\d{1,3})?(\d{1,2})?(\d{1,2})?$/);

  if (!match) return value;
  
  const [, country, code, first, second, third] = match;

  if (!country) return '';

  let formatted = `+${country}`;
  if (code) formatted += ` (${code}`;
  if (first) formatted += `) ${first}`;
  if (second) formatted += `-${second}`;
  if (third) formatted += `-${third}`;
  
  return formatted;
}


export function normalizePhoneNumber(value: string): string {
  if (!value) return '';
  let digits = value.replace(/\D/g, '');

  if (digits.startsWith('8') && digits.length === 11) {
    return '7' + digits.slice(1);
  }
  if (digits.startsWith('7') && digits.length === 11) {
    return digits;
  }
  // Handle case where user types a 10-digit number like 903...
  if (digits.length === 10 && (digits.startsWith('9'))) {
    return '7' + digits;
  }
  // Fallback for incomplete numbers during typing
  return digits;
}
