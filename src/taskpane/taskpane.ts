import { configs } from "../../configs";
import { generateMeeting } from "../commands/commands"; // ajuste le chemin selon ton projet

Office.onReady(async () => {
  const container = document.getElementById("debug-container");
  const urlParams = new URLSearchParams(window.location.search);
  const auto = urlParams.get("action") === "generate";

  const isOutlook2019 =
    Office.context.requirements.isSetSupported("Mailbox", "1.1") &&
    !Office.context.requirements.isSetSupported("Mailbox", "1.5");

  // Cas Outlook Web / M365
  if (auto && !isOutlook2019) {
    await generateMeeting({ completed: () => { } } as any);
    return;
  }

  // Cas Outlook 2019 ou debug manuel
  container!.innerHTML = `
    <h1>Joona Meet</h1>
    <p>⚠️ Outlook ne permet pas l'exécution automatique.<br/>Clique sur le bouton ci-dessous :</p>
    <button id="generate">🚀 Générer la réunion manuellement</button>
    <br/><br/>
    <h2>Logs :</h2>
    <pre id="debug-out">Chargement...</pre>
    <button id="refresh">🔄</button>
    <button id="clear">🗑️</button>
    <button id="copy">📋</button>
  `;

  document.getElementById("generate")?.addEventListener("click", () => generateMeeting({ completed: () => { } } as any));
  document.getElementById("refresh")?.addEventListener("click", loadLogs);
  document.getElementById("clear")?.addEventListener("click", clearLogs);
  document.getElementById("copy")?.addEventListener("click", copyLogs);

  await loadLogs();

  async function loadLogs() {
    const logs = (await OfficeRuntime.storage.getItem("debugLogs")) || [];
    document.getElementById("debug-out")!.textContent = logs.length ? logs.join("\n") : "🟡 Aucun log.";
  }

  async function clearLogs() {
    await OfficeRuntime.storage.setItem("debugLogs", []);
    document.getElementById("debug-out")!.textContent = "🗑️ Logs effacés.";
  }

  async function copyLogs() {
    await navigator.clipboard.writeText(document.getElementById("debug-out")!.textContent || "");
    alert("📋 Logs copiés !");
  }
});
