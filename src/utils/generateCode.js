export function generateRandomCode(length = 8) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sans O,0,I pour lisibilité
  let s = "";
  for (let i = 0; i < length; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}
