// src/components/CharacterMage.tsx
export default function CharacterMage() {
  return (
    <svg
      width="180" height="340"
      viewBox="0 0 180 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mage-float"
    >
      {/* Túnica */}
      <path d="M20 340 Q15 270 20 190 Q25 130 50 100 Q65 82 90 78 Q115 82 130 100 Q155 130 160 190 Q165 270 160 340Z"
        fill="#12060a" stroke="rgba(230,57,70,0.15)" strokeWidth="1"/>
      {/* Interior túnica */}
      <path d="M50 340 Q48 280 52 210 Q58 155 75 130 Q82 118 90 115 Q98 118 105 130 Q122 155 128 210 Q132 280 130 340Z"
        fill="#0e0508" stroke="rgba(230,57,70,0.08)" strokeWidth="0.5"/>
      {/* Símbolo pecho */}
      <path d="M82 165 L90 148 L98 165 L115 165 L101 176 L107 193 L90 182 L73 193 L79 176 L65 165Z"
        fill="rgba(230,57,70,0.15)" stroke="rgba(230,57,70,0.5)" strokeWidth="0.8"/>
      {/* Cuerpo */}
      <rect x="65" y="138" width="50" height="72" rx="4"
        fill="#100508" stroke="rgba(230,57,70,0.1)" strokeWidth="0.5"/>
      {/* Hombros */}
      <ellipse cx="52" cy="145" rx="20" ry="11" fill="#150709" stroke="rgba(230,57,70,0.2)" strokeWidth="1"/>
      <ellipse cx="128" cy="145" rx="20" ry="11" fill="#150709" stroke="rgba(230,57,70,0.2)" strokeWidth="1"/>
      <ellipse cx="52" cy="145" rx="20" ry="11" fill="rgba(230,57,70,0.05)"/>
      <ellipse cx="128" cy="145" rx="20" ry="11" fill="rgba(230,57,70,0.05)"/>
      {/* Cabeza con capucha */}
      <ellipse cx="90" cy="88" rx="26" ry="28"
        fill="#120608" stroke="rgba(230,57,70,0.15)" strokeWidth="1"/>
      <path d="M64 75 Q70 50 90 40 Q110 50 116 75"
        fill="#120608" stroke="rgba(230,57,70,0.12)" strokeWidth="0.5"/>
      {/* Ojos brillantes */}
      <ellipse cx="80" cy="88" rx="5" ry="3.5" fill="rgba(230,57,70,0.6)"/>
      <ellipse cx="80" cy="88" rx="3" ry="2" fill="rgba(230,57,70,0.9)"/>
      <ellipse cx="100" cy="88" rx="5" ry="3.5" fill="rgba(230,57,70,0.6)"/>
      <ellipse cx="100" cy="88" rx="3" ry="2" fill="rgba(230,57,70,0.9)"/>
      {/* Staff */}
      <rect x="146" y="30" width="5" height="200" rx="2.5"
        fill="#1a0810" stroke="rgba(230,57,70,0.3)" strokeWidth="0.5"/>
      {/* Orbe */}
      <circle cx="148" cy="28" r="14" fill="rgba(230,57,70,0.08)" stroke="rgba(230,57,70,0.5)" strokeWidth="1"/>
      <circle cx="148" cy="28" r="8" fill="rgba(230,57,70,0.2)" stroke="rgba(230,57,70,0.7)" strokeWidth="0.5"/>
      <circle cx="148" cy="28" r="4" fill="rgba(230,57,70,0.6)"/>
      {/* Partículas */}
      <circle cx="138" cy="18" r="2" fill="rgba(230,57,70,0.4)"/>
      <circle cx="158" cy="22" r="1.5" fill="rgba(230,57,70,0.35)"/>
      <circle cx="142" cy="38" r="1" fill="rgba(230,57,70,0.3)"/>
      {/* Brazo staff */}
      <rect x="128" y="145" width="16" height="60" rx="7"
        fill="#120608" stroke="rgba(230,57,70,0.08)" strokeWidth="0.5"/>
      {/* Mano mágica */}
      <ellipse cx="45" cy="190" rx="10" ry="10"
        fill="rgba(230,57,70,0.08)" stroke="rgba(230,57,70,0.3)" strokeWidth="0.5"/>
      <ellipse cx="45" cy="190" rx="5" ry="5" fill="rgba(230,57,70,0.2)"/>
      {/* Piernas */}
      <rect x="68" y="210" width="20" height="85" rx="7"
        fill="#0e0508" stroke="rgba(230,57,70,0.06)" strokeWidth="0.5"/>
      <rect x="92" y="210" width="20" height="85" rx="7"
        fill="#0e0508" stroke="rgba(230,57,70,0.06)" strokeWidth="0.5"/>
      {/* Botas */}
      <rect x="63" y="283" width="26" height="22" rx="5" fill="#0c0406"/>
      <rect x="91" y="283" width="26" height="22" rx="5" fill="#0c0406"/>
    </svg>
  )
}