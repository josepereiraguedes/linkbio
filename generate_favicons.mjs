import fs from 'fs';
import { execSync } from 'child_process';

// High-precision SVG favicon of the VIOOR peacock personal brand emblem
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1c1d22" />
      <stop offset="100%" stop-color="#0a0a0c" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="#f5ede0" />
      <stop offset="100%" stop-color="#eed8b7" />
    </linearGradient>
    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Luxury rounded badge container ensures clear contrast on both light and dark browser tabs -->
  <rect x="16" y="16" width="480" height="480" rx="120" fill="url(#bgGrad)" stroke="#2e3038" stroke-width="6" />

  <!-- The VIOOR Stylized Peacock Emblem -->
  <g transform="translate(18, 20) scale(0.92)" stroke="url(#goldGrad)" stroke-linecap="round" stroke-linejoin="round" fill="none">
    
    <!-- Feather Crest on Head (5 fan rays) -->
    <g stroke-width="3.5">
      <path d="M 132 165 C 130 152, 126 142, 122 135" />
      <path d="M 137 163 C 137 148, 134 138, 131 130" />
      <path d="M 143 163 C 145 148, 146 138, 145 128" />
      <path d="M 148 165 C 153 151, 157 140, 160 132" />
      <path d="M 152 168 C 159 155, 166 145, 172 138" />
      <!-- Crest droplet tips -->
      <circle cx="121" cy="133" r="2.5" fill="#f5ede0" />
      <circle cx="130" cy="128" r="2.5" fill="#f5ede0" />
      <circle cx="145" cy="126" r="2.5" fill="#f5ede0" />
      <circle cx="161" cy="130" r="2.5" fill="#f5ede0" />
      <circle cx="173" cy="136" r="2.5" fill="#f5ede0" />
    </g>

    <!-- Peacock Head, Beak & Elegant Body Profile -->
    <!-- Head & Beak -->
    <path d="M 112 178 L 132 171 C 136 166, 146 164, 154 171 C 160 177, 163 186, 161 198 C 158 214, 151 228, 148 244 C 144 264, 148 285, 162 301 C 178 318, 201 326, 224 322 C 248 318, 266 301, 276 278" 
          stroke-width="5" />
    <!-- Beak underside & Throat to Chest -->
    <path d="M 112 178 C 122 181, 128 184, 134 186 C 142 195, 144 205, 144 218 C 144 236, 139 252, 141 270 C 144 292, 158 312, 178 322 C 196 331, 218 332, 238 325 C 258 318, 272 302, 280 282" 
          stroke-width="4.5" />

    <!-- Eye detail on head -->
    <circle cx="138" cy="175" r="2.5" fill="#f5ede0" stroke="none" />

    <!-- Tail Plumage Fan - 5 Majestic Feathers -->
    
    <!-- Feather 1 (Leftmost plume) -->
    <g stroke-width="4">
      <path d="M 235 320 C 220 280, 205 210, 218 152 C 224 125, 238 102, 255 88 C 265 80, 276 80, 284 88 C 295 99, 296 118, 292 136 C 286 164, 272 205, 258 245" />
      <!-- Feather 1 inner eye droplet -->
      <path d="M 252 110 C 258 100, 268 96, 274 102 C 280 108, 278 120, 272 128 C 266 136, 258 136, 254 130 C 250 124, 248 116, 252 110 Z" stroke-width="3" />
      <circle cx="264" cy="114" r="3.5" fill="#f5ede0" stroke="none" />
    </g>

    <!-- Feather 2 (Upper left plume) -->
    <g stroke-width="4">
      <path d="M 250 310 C 248 260, 252 180, 275 115 C 286 85, 305 60, 325 45 C 336 37, 348 38, 355 48 C 364 61, 362 82, 354 104 C 342 136, 320 185, 302 235" />
      <!-- Feather 2 inner eye droplet -->
      <path d="M 322 68 C 330 56, 342 54, 348 62 C 354 70, 350 84, 342 94 C 334 102, 325 100, 320 92 C 316 84, 316 76, 322 68 Z" stroke-width="3" />
      <circle cx="335" cy="78" r="3.5" fill="#f5ede0" stroke="none" />
    </g>

    <!-- Feather 3 (Tallest Center plume) -->
    <g stroke-width="4">
      <path d="M 265 295 C 275 235, 300 155, 338 95 C 356 66, 380 44, 402 34 C 414 28, 426 32, 431 44 C 438 60, 430 82, 417 106 C 397 142, 366 195, 342 245" />
      <!-- Feather 3 inner eye droplet -->
      <path d="M 396 55 C 406 45, 418 46, 423 56 C 427 66, 420 80, 410 90 C 400 98, 392 94, 388 86 C 384 76, 388 64, 396 55 Z" stroke-width="3" />
      <circle cx="406" cy="68" r="3.5" fill="#f5ede0" stroke="none" />
    </g>

    <!-- Feather 4 (Right-curving plume) -->
    <g stroke-width="4">
      <path d="M 275 285 C 300 230, 345 160, 398 115 C 422 94, 448 82, 468 82 C 478 82, 486 91, 487 104 C 488 122, 474 142, 455 165 C 428 198, 390 240, 360 275" />
      <!-- Feather 4 inner eye droplet -->
      <path d="M 452 104 C 462 98, 474 104, 475 116 C 476 128, 467 140, 456 146 C 445 152, 438 144, 438 134 C 438 122, 444 110, 452 104 Z" stroke-width="3" />
      <circle cx="458" cy="124" r="3.5" fill="#f5ede0" stroke="none" />
    </g>

    <!-- Feather 5 (Low right plume) -->
    <g stroke-width="4">
      <path d="M 280 280 C 320 235, 380 180, 438 152 C 466 138, 492 136, 508 146 C 516 152, 519 164, 515 177 C 510 193, 492 210, 468 228 C 430 258, 382 284, 345 300" />
      <!-- Feather 5 inner eye droplet -->
      <path d="M 486 160 C 496 156, 505 164, 504 175 C 502 186, 492 195, 482 198 C 472 201, 466 193, 468 183 C 470 172, 478 164, 486 160 Z" stroke-width="3" />
      <circle cx="486" cy="178" r="3.5" fill="#f5ede0" stroke="none" />
    </g>

    <!-- Lower Flowing Tail Ribs / Accent curves -->
    <g stroke-width="3" opacity="0.85">
      <path d="M 250 326 C 290 310, 345 285, 395 255" />
      <path d="M 262 334 C 300 320, 350 298, 398 270" />
      <path d="M 276 340 C 312 328, 358 308, 400 282" />
    </g>

    <!-- Brand Label "VIOOR" underneath in elegant minimalist lettering -->
    <text x="256" y="445" 
          font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" 
          font-size="34" 
          font-weight="700" 
          letter-spacing="12" 
          fill="#f5ede0" 
          stroke="none" 
          text-anchor="middle">VIOOR</text>
  </g>
</svg>`;

fs.writeFileSync('/public/favicon.svg', svgContent);
fs.writeFileSync('/public/favicon-emblem.svg', svgContent);
console.log('Wrote /public/favicon.svg');
