"use client";

import { useEffect, useState } from 'react';

const PHRASES = [
  "Transforma tu obra impresa en una experiencia sonora inolvidable.",
  "Tu libro merece ser escuchado, no solo leído.",
  "Cada palabra tuya, convertida en una voz que permanece.",
  "Producción artesanal para autores que no hacen concesiones.",
  "Un audiolibro no es solo audio. Es la versión cinematográfica de tu imaginación.",
  "Llevamos tu narrativa al oído de quienes aún no te han leído.",
  "El diseño sonoro que tu obra estaba esperando.",
  "Tu historia en manos de un equipo que la trata como propia.",
  "No producimos audiolibros. Producimos experiencias auditivas.",
  "Para autores que entienden que la forma también es contenido.",
  "La voz de tu libro, diseñada con el mismo rigor que tus palabras.",
  "De las páginas al mundo sonoro, sin perder nada en la traducción.",
  "Cada capítulo, una atmósfera. Cada voz, una intención.",
  "El audiolibro que nadie más haría igual que nosotros.",
  "Porque leer y escuchar son dos formas de vivir la misma historia.",
  "Tu lector más fiel todavía no te ha leído. Pero pronto te escuchará.",
];

const INTERVAL = 15000;

export function RotatingTagline({ className = '' }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % PHRASES.length);
        setVisible(true);
      }, 400);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <p
      className={`transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'} ${className}`}
    >
      {PHRASES[index]}
    </p>
  );
}

export default RotatingTagline;
