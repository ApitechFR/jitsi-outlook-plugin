import { configs } from "../../configs";
import { generateRoomName } from "../helpers/roomNameGenerator";
import axios from "axios";

/* global Office */
/// <reference types="office-js" />

Office.onReady(() => {
  console.log("{Meet Plugin} Office.js est prêt");
});

async function debugLog(message: string) {
  const now = new Date().toLocaleTimeString();
  const logs = (await OfficeRuntime.storage.getItem("debugLogs")) || [];
  logs.push(`[${now}] ${message}`);
  await OfficeRuntime.storage.setItem("debugLogs", logs);
}

/**
 * Requête HTTP simple
 */
async function load(url: string): Promise<any> {
  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      await debugLog(`Erreur HTTP : ${response.status}`);
      console.error(`{Meet Plugin} Erreur HTTP : ${response.status}`);
    }
    return response.data;
  } catch (error) {
    await debugLog(`Erreur lors de la requête : ${error}`);
    console.error("{Meet Plugin} Erreur lors de la requête :", error);
    return null;
  }
}

/**
 * Insère un bloc de test pour valider que l’injection est possible
 */
async function insertTestHtml(): Promise<void> {
  return new Promise((resolve, reject) => {
    const html = `<p style="color: green"> Test d’insertion réussi !</p>`;
    Office.context.mailbox.item.body.setAsync(html, { coercionType: Office.CoercionType.Html }, (result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        console.log("{Meet Plugin} Test HTML ajouté !");
        debugLog("Test HTML ajouté !");
        resolve();
      } else {
        debugLog(`Erreur d’insertion HTML : ${result.error}`);
        console.error("{Meet Plugin} Erreur d’insertion HTML :", result.error);
        reject(result.error);
      }
    });
  });
}

/**
 * Génère les numéros de téléphone et le code PIN
 */
async function getPhoneDetails(roomName: string): Promise<{ phoneNumbers: string[]; pinCode: string }> {
  const phoneNumbers: string[] = [];
  let pinCode = "";

  if (configs.ENABLE_PHONE_ACCESS) {
    try {
      const phoneResult = await load(
        `${configs.dialInNumbersUrl}?conference=${roomName}@conference.${configs.JITSI_DOMAIN}`
      );
      await debugLog(`Résultat numéros de téléphone : ${JSON.stringify(phoneResult)}`);
      console.log("{Meet Plugin} Phone result:", phoneResult);

      if (phoneResult?.numbers) {
        Object.entries(phoneResult.numbers).forEach(([key, values]: [string, any]) => {
          values.forEach((number: string) => {
            phoneNumbers.push(
              configs.PHONE_NUMBER_FORMAT.replace("%phone_number%", number).replace("%phone_country%", key)
            );
          });
        });
      }
    } catch (error) {
      await debugLog(`Erreur numéros de téléphone : ${error}`);
      console.error("{Meet Plugin} Erreur numéros téléphone :", error);
    }

    try {
      const pinResult = await load(
        `${configs.dialInConfCodeUrl}?conference=${roomName}@conference.${configs.JITSI_DOMAIN}`
      );
      await debugLog(`Résultat PIN code : ${JSON.stringify(pinResult)}`);
      console.log("{Meet Plugin} PIN result:", pinResult);

      if (pinResult?.id) {
        pinCode = pinResult.id;
      }
    } catch (error) {
      await debugLog(`Erreur PIN code : ${error}`);
      console.error("{Meet Plugin} Erreur PIN code :", error);
    }
  }

  return { phoneNumbers, pinCode };
}

/**
 * Fonction principale
 */
async function generateMeeting(event: Office.AddinCommands.Event) {
  console.log("{Meet Plugin} Lancement de la génération de réunion");

  if (!Office.context.mailbox.item?.body?.setAsync || !Office.context.mailbox.item?.body?.getAsync) {
    await debugLog("L’environnement actuel ne permet pas la modification du corps.");
    console.warn("{Meet Plugin} L’environnement actuel ne permet pas la modification du corps.");
    Office.context.mailbox.item.notificationMessages.addAsync("unsupported", {
      type: "errorMessage",
      message: "Impossible d’insérer les détails. Essayez en ouvrant l’invitation en plein écran.",
    });
    event.completed();
    return;
  }

  Office.context.mailbox.item.body.setAsync(
    `<p style="color: blue;"> Debug: Script exécuté à ${new Date().toLocaleString()}</p>`,
    { coercionType: Office.CoercionType.Html },
    (res) => {
      if (res.status === Office.AsyncResultStatus.Succeeded) {
        debugLog("Debug HTML injecté !");
        console.log("{Meet Plugin}  Debug HTML injecté.");
      } else {
        debugLog(`Erreur injection debug HTML : ${res.error}`);
        console.error("{Meet Plugin}  Échec injection debug HTML :", res.error);
      }
    }
  );

  try {
    // Insertion de test (à commenter si validé)
    await insertTestHtml();

    const roomName = generateRoomName();
    const { phoneNumbers, pinCode } = await getPhoneDetails(roomName);
    const meetingIdentifier = "joona-meeting-details";

    const meetingDetailsHtml = `
      <hr style="border: 1px solid #ccc; margin-top: 20px;">
      <div id="${meetingIdentifier}" style="font-family: Arial; font-size: 14px;">
        <strong>${configs.TITLE_MEETING_DETAILS}</strong><br/>
        <div style="margin-bottom:6px">
          <a href="https://${configs.JITSI_DOMAIN}/${roomName}" target="_blank"
             style="font-size: 20px; font-weight: 600; text-decoration: underline; color: #5B5FC7;">
             Rejoignez la réunion maintenant
          </a><br/>
        </div>
        ${phoneNumbers.length ? `<div>Par téléphone : ${phoneNumbers.join(", ")}</div>` : ""}
        ${pinCode ? `<div>Code secret : ${pinCode}</div>` : ""}
        ${
          configs.MODERATOR_OPTIONS === "true"
            ? `<div>Pour les organisateurs : <a href="#">Options de réunion</a></div>`
            : ""
        }
      </div>
      <hr style="border: 1px solid #ccc; margin-top: 20px;">
    `;

    // Récupérer le contenu actuel du corps
    Office.context.mailbox.item.body.getAsync(Office.CoercionType.Html, (result) => {
      if (result.status !== Office.AsyncResultStatus.Succeeded) {
        debugLog(`Erreur récupération du corps : ${result.error}`);
        console.error("{Meet Plugin} Erreur récupération du corps :", result.error);
        event.completed();
        return;
      }

      const currentBody = result.value || "";

      if (currentBody.includes(meetingIdentifier)) {
        debugLog("Détails de réunion déjà présents, insertion ignorée.");
        console.log("{Meet Plugin} Détails déjà présents, insertion ignorée.");
        event.completed();
        return;
      }

      const updatedBody = currentBody + meetingDetailsHtml;

      const bodyPromise = new Promise<void>((resolve, reject) => {
        Office.context.mailbox.item.body.setAsync(updatedBody, { coercionType: Office.CoercionType.Html }, (res) => {
          res.status === Office.AsyncResultStatus.Succeeded ? resolve() : reject(res.error);
        });
      });

      const locationPromise = new Promise<void>((resolve, reject) => {
        const joonaLink = `https://${configs.JITSI_DOMAIN}/${roomName}`;
        Office.context.mailbox.item.location.setAsync(joonaLink, (res) => {
          res.status === Office.AsyncResultStatus.Succeeded ? resolve() : reject(res.error);
        });
      });

      Promise.all([bodyPromise, locationPromise])
        .then(() => {
          debugLog("Réunion ajoutée avec succès !");
          console.log("{Meet Plugin} Réunion ajoutée avec succès.");
          event.completed();
        })
        .catch((err) => {
          debugLog(`Erreur lors de l’injection : ${err}`);
          console.error("{Meet Plugin} Erreur lors de l’injection :", err);
          event.completed();
        });
    });
  } catch (err) {
    await debugLog(`Erreur inattendue : ${err}`);
    console.error("{Meet Plugin} Erreur inattendue :", err);
    event.completed();
  }
}

// Associer au bouton dans le manifest
Office.actions.associate("generateMeeting", generateMeeting);
