'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function GsapBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Evita rodar no SSR
    if (!containerRef.current) return;

    // Respeitar preferência de movimento reduzido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Orb 1 - Esmeralda Gamer / Nuuvem Mint (Superior Esquerda)
      if (orb1Ref.current) {
        gsap.to(orb1Ref.current, {
          x: '+=120',
          y: '+=80',
          scale: 1.15,
          duration: 9,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      // Orb 2 - Azul Ciano Profundo / Espacial (Superior Direita / Centro)
      if (orb2Ref.current) {
        gsap.to(orb2Ref.current, {
          x: '-=100',
          y: '+=110',
          scale: 0.9,
          duration: 12,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1,
        });
      }

      // Orb 3 - Índigo / Roxo Gamer Noturno (Inferior Centro)
      if (orb3Ref.current) {
        gsap.to(orb3Ref.current, {
          x: '+=90',
          y: '-=70',
          scale: 1.2,
          duration: 14,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 2,
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#090b0e]"
    >
      {/* Grade Sutil de Linhas Isométricas / Tech Mesh de Fundo */}
      <div 
        className="absolute inset-0 opacity-[0.035]" 
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Orbe 1: Esmeralda Neon Suave */}
      <div
        ref={orb1Ref}
        className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full blur-[130px] opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, rgba(5, 150, 105, 0.2) 60%, transparent 80%)',
        }}
      />

      {/* Orbe 2: Azul Ciano E-commerce */}
      <div
        ref={orb2Ref}
        className="absolute top-1/4 -right-32 h-[560px] w-[560px] rounded-full blur-[140px] opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.55) 0%, rgba(14, 116, 144, 0.2) 60%, transparent 80%)',
        }}
      />

      {/* Orbe 3: Violeta Noturno Sutil */}
      <div
        ref={orb3Ref}
        className="absolute -bottom-32 left-1/3 h-[500px] w-[500px] rounded-full blur-[150px] opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.5) 0%, rgba(91, 33, 182, 0.15) 60%, transparent 80%)',
        }}
      />

      {/* Vinheta Escura nas Bordas para Foco no Conteúdo */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090b0e] via-transparent to-transparent opacity-90" />
    </div>
  );
}
