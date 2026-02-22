"use client";

import Image from "next/image";
import React, { useState } from "react";

type HeroCardsContainerProps = {
  width: number;
  height: number;
  stagger?: number;
};

function HeroCardsContainer({
  width,
  height,
  stagger = 24,
}: HeroCardsContainerProps) {
  const initialCards = [
    { id: 1, imagePath: "/file.svg" },
    { id: 2, imagePath: "/globe.svg" },
    { id: 3, imagePath: "/vercel.svg" },
  ];

  const [cards, setCards] = useState(initialCards);

  // Container must account for diagonal stagger
  const containerWidth = width + stagger * (cards.length - 1);
  const containerHeight = height + stagger * (cards.length - 1);

  const rotateCards = () => {
    setCards((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: containerWidth,
        height: containerHeight,
      }}
    >
      {cards.map((card, index) => {
        const isTop = index === 0;

        return (
          <div
            key={card.id}
            onClick={isTop ? rotateCards : undefined}
            className={`
              absolute rounded-2xl bg-background shadow-lg
              transition-all duration-500 ease-out md:block
              ${isTop ? "cursor-pointer" : "pointer-events-none"}
            `}
            style={{
              width,
              height,
              transform: `translate(${index * stagger}px, ${index * stagger}px)`,
              zIndex: cards.length - index,
            }}
          >
            <Image
              src={card.imagePath}
              alt="card"
              width={width}
              height={height}
              className="w-full h-full object-cover p-4 bg-white text-black rounded-2xl"
            />
          </div>
        );
      })}
    </div>
  );
}

export default HeroCardsContainer;
