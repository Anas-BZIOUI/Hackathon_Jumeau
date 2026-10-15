
import { useState } from "react";

export default function LostAssistant({
  rooms,
  onClose,
  onNavigate
}) {
  const [step, setStep] = useState("start");
  const [input, setInput] = useState("");
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [error, setError] = useState("");

  function findRoom(value, preferredLevel = null) {
    const search = value.trim().toLowerCase();

    const matches = rooms.filter((room) =>
      room.id.toLowerCase() === search ||
      String(room.number ?? "").toLowerCase() === search
    );

    if (matches.length === 1) {
      return { room: matches[0] };
    }

    if (matches.length > 1) {
      const sameFloor = matches.filter(
        (room) => room.level === preferredLevel
      );

      if (sameFloor.length === 1) {
        return { room: sameFloor[0] };
      }

      return { ambiguous: true };
    }

    return { room: null };
  }

  function submit(event) {
    event.preventDefault();
    const value = input.trim();
    if (!value) return;

    setError("");

    if (step === "start") {
      const result = findRoom(value);

      if (result.ambiguous) {
        setError(
          "Ce numéro existe à plusieurs étages. " +
          "Indique l'identifiant complet, par exemple R+1-131."
        );
        return;
      }

      if (!result.room) {
        setError("Salle introuvable. Vérifie le numéro.");
        return;
      }

      setOrigin(result.room);
      setInput("");
      setStep("destination");
      return;
    }

    if (step === "destination") {
      const result = findRoom(value, origin.level);

      if (result.ambiguous) {
        setError(
          "Plusieurs salles correspondent. " +
          "Précise l'étage dans l'identifiant."
        );
        return;
      }

      if (!result.room) {
        setError("Destination introuvable.");
        return;
      }

      if (result.room.id === origin.id) {
        setError("Tu es déjà près de cette salle !");
        return;
      }

      setDestination(result.room);
      setInput("");
      setStep("result");

      onNavigate(origin, result.room);
    }
  }

  function restart() {
    setStep("start");
    setInput("");
    setOrigin(null);
    setDestination(null);
    setError("");
  }

  return (
    <section className="lost-assistant" role="dialog"
      aria-label="Assistant d'orientation">
      <header className="lost-header">
        <div>
          <strong>🧭 Assistant EnsiiExplore</strong>
          <small>Je t'aide à retrouver ton chemin</small>
        </div>
        <button type="button" onClick={onClose}
          aria-label="Fermer l'assistant">
          ✕
        </button>
      </header>

      <div className="lost-messages">
        <div className="lost-message bot">
          Bonjour ! 👋 Tu es perdu dans l'ensIIE ?
          Quel est le numéro de la salle la plus proche de toi ?
        </div>

        {origin && (
          <>
            <div className="lost-message user">
              Salle {origin.number}
            </div>
            <div className="lost-message bot">
              📍 Tu te trouves au <strong>{origin.level}</strong>,
              près de la salle <strong>{origin.number}</strong>.
              <p>Quelle salle souhaites-tu rejoindre ?</p>
            </div>
          </>
        )}

        {destination && (
          <>
            <div className="lost-message user">
              Salle {destination.number}
            </div>
            <div className="lost-message bot">
              {origin.level === destination.level
                ? "🗺️ Je recherche le trajet sur la carte."
                : "🗺️ Ta destination se trouve à un autre étage."}
              <p>
                Départ : {origin.number} ({origin.level})
                <br />
                Arrivée : {destination.number} ({destination.level})
              </p>
              {origin.level !== destination.level && (
                <p>
                  Le guidage entre étages nécessite des
                  connexions escaliers ou ascenseurs.
                </p>
              )}
            </div>
          </>
        )}

        {error && (
          <div className="lost-error" role="alert">
            {error}
          </div>
        )}
      </div>

      {step !== "result" ? (
        <form className="lost-input" onSubmit={submit}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              step === "start"
                ? "Salle proche, ex. 131"
                : "Destination, ex. 139"
            }
            aria-label="Numéro de salle"
          />
          <button type="submit" disabled={!input.trim()}>
            ➤
          </button>
        </form>
      ) : (
        <button
          type="button"
          className="lost-restart"
          onClick={restart}
        >
          ↻ Nouvelle recherche
        </button>
      )}
    </section>
  );
}
