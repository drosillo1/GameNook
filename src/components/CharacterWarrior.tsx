// src/components/CharacterWarrior.tsx
export default function CharacterWarrior() {
  return (
    <svg
      width="180" height="340"
      viewBox="0 0 180 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="warrior-float"
    >
      {/* Capa */}
      <path d="M30 340 Q20 280 15 200 Q10 140 40 100 Q55 80 90 75 Q125 80 140 100 Q170 140 165 200 Q160 280 150 340Z"
        fill="#0a0a18" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      {/* Cuerpo armadura */}
      <rect x="60" y="140" width="60" height="80" rx="4"
        fill="#0f0f20" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      {/* Pecho */}
      <path d="M70 155 L90 145 L110 155 L110 185 L90 195 L70 185Z"
        fill="#131325" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
      {/* Hombros */}
      <ellipse cx="52" cy="148" rx="18" ry="12" fill="#111122" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      <ellipse cx="128" cy="148" rx="18" ry="12" fill="#111122" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      {/* Casco */}
      <ellipse cx="90" cy="90" rx="28" ry="30" fill="#0f0f20" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      {/* Visera */}
      <path d="M65 88 Q70 78 90 75 Q110 78 115 88 L112 98 Q100 92 90 91 Q80 92 68 98Z"
        fill="#0a0a15" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5"/>
      {/* Ojos */}
      <ellipse cx="79" cy="90" rx="5" ry="3" fill="rgba(255,255,255,0.03)"/>
      <ellipse cx="101" cy="90" rx="5" ry="3" fill="rgba(255,255,255,0.03)"/>
      {/* Espada */}
      <rect x="28" y="60" width="6" height="160" rx="3"
        fill="#161628" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5"/>
      <rect x="16" y="140" width="30" height="5" rx="2"
        fill="#111122" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
      <ellipse cx="31" cy="60" rx="5" ry="8" fill="#1a1a30"/>
      {/* Brazo */}
      <rect x="128" y="148" width="14" height="55" rx="7"
        fill="#111122" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
      {/* Piernas */}
      <rect x="67" y="218" width="22" height="80" rx="8"
        fill="#0c0c1e" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
      <rect x="91" y="218" width="22" height="80" rx="8"
        fill="#0c0c1e" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
      {/* Botas */}
      <rect x="62" y="288" width="28" height="20" rx="5" fill="#0a0a18"/>
      <rect x="90" y="288" width="28" height="20" rx="5" fill="#0a0a18"/>
      {/* Detalles */}
      <path d="M72 158 L90 150 L108 158" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" fill="none"/>
      <path d="M75 170 L90 163 L105 170" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" fill="none"/>
    </svg>
  )
}