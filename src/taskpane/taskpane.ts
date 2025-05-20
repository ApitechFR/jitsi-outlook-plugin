import { configs } from "../../configs";

const debugOut = document.getElementById("debug-out") as HTMLPreElement;
const container = document.getElementById("debug-container") as HTMLDivElement;

Office.onReady(async () => {
  if (!configs.debug) {
    if (container) {
      container.innerHTML = "<p style='padding:1rem; color:gray;'>🛑 Le mode debug est désactivé.</p>";
    }
    return;
  }

  document.getElementById("refresh")?.addEventListener("click", loadLogs);
  document.getElementById("clear")?.addEventListener("click", clearLogs);
  document.getElementById("copy")?.addEventListener("click", copyLogs);

  await loadLogs();
});

async function loadLogs() {
  const logs: string[] = (await OfficeRuntime.storage.getItem("debugLogs")) || [];
  debugOut.innerText = logs.length ? logs.join("\n") : "🟡 Aucun log disponible.";
}

async function clearLogs() {
  await OfficeRuntime.storage.setItem("debugLogs", []);
  debugOut.innerText = "🗑️ Logs effacés.";
}

async function copyLogs() {
  await navigator.clipboard.writeText(debugOut.innerText);
  alert("📋 Logs copiés !");
}
