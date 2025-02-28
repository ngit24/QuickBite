export function generateRandomCode(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = 2;
  const segmentLength = Math.floor(length / segments);
  
  let code = '';
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segmentLength; j++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    if (i < segments - 1) code += '-';
  }
  
  return code;
}
