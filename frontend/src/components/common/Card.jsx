import React from "react";

export function Card({ a, b, c }) {
  return (
    <div className="card">
      <small>{a}</small>
      <h2>{b}</h2>
      <p>{c}</p>
    </div>
  );
}

export default Card;
