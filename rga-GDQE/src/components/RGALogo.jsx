export function RGALogo({ size = 44 }) {
  const s = size;
  return (
    <svg width={s} height={s * 1.1} viewBox="0 0 90 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="42" y="52" width="6" height="30" rx="3" fill="#2E7D52"/>
      <path d="M45 52 Q30 38 18 32 Q28 38 40 50" fill="#2E7D52"/>
      <path d="M45 52 Q35 30 32 16 Q36 30 44 50" fill="#2E7D52"/>
      <path d="M45 52 Q45 28 45 12 Q46 28 46 50" fill="#2E7D52"/>
      <path d="M45 52 Q55 30 58 16 Q54 30 46 50" fill="#2E7D52"/>
      <path d="M45 52 Q60 38 72 32 Q62 38 50 50" fill="#2E7D52"/>
      <path d="M45 52 Q28 44 14 44 Q28 44 43 52" fill="#2E7D52"/>
      <path d="M45 52 Q62 44 76 44 Q62 44 47 52" fill="#2E7D52"/>
      <path d="M22 72 Q22 60 45 58 Q68 60 68 72 L64 88 Q55 95 45 95 Q35 95 26 88 Z" fill="#B8922A" opacity="0.15"/>
      <path d="M28 88 L42 62 L48 62 L62 88 Z" fill="#B8922A" opacity="0.6"/>
      <path d="M34 88 L43 66 L47 66 L56 88 Z" fill="#F5F6F7"/>
      <rect x="44" y="68" width="2" height="5" rx="1" fill="#B8922A"/>
      <rect x="44" y="76" width="2" height="5" rx="1" fill="#B8922A"/>
      <rect x="44" y="84" width="2" height="4" rx="1" fill="#B8922A"/>
    </svg>
  );
}
