/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global Office */

Office.onReady(() => {
  // If needed, Office.js is ready to be called.
});

/**
 * Shows a notification when the add-in command is executed.
 * @param event
 */
function action(event: Office.AddinCommands.Event) {
  const message: Office.NotificationMessageDetails = {
    type: Office.MailboxEnums.ItemNotificationMessageType.InformationalMessage,
    message: "Performed action.",
    icon: "Icon.80x80",
    persistent: true,
  };

  // Show a notification message.
  Office.context.mailbox.item.notificationMessages.replaceAsync("ActionPerformanceNotification", message);

  // Be sure to indicate when the add-in command function is complete.
  event.completed();
}

// Register the function with Office.
Office.actions.associate("action", action);

function insertHelloWorld(event: Office.AddinCommands.Event): void {
  // Ajoute "Hello World" dans le corps du rendez-vous
  Office.context.mailbox.item.body.setAsync("Hello World", { coercionType: Office.CoercionType.Html }, (result) => {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      console.log("Texte ajouté avec succès !");
    } else {
      console.error("Erreur lors de l'ajout du texte : ", result.error);
    }
  });

  //l'action est terminée
  event.completed();
}

function generateMeeting(event: Office.AddinCommands.Event): void {
  // Lire le contenu existant du body
  Office.context.mailbox.item.body.getAsync(Office.CoercionType.Html, (getResult) => {
    if (getResult.status === Office.AsyncResultStatus.Succeeded) {
      const existingBody = getResult.value || "";

      // Nouveau contenu à ajouter
      const meetingDetailsHtml = `
        <hr style="border: 1px solid #ccc; margin-top: 20px;">
        <footer style="background-color: #f9f9f9; border-top: 1px solid #ccc; padding: 20px;">
          <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5;">
            <strong>Joona By Apitech</strong> <a href="#">Besoin d'aide ?</a><br>
            <a style="cursor: pointer" href="https://joona.fr/WormsInvestigateSmoothly">Rejoignez la réunion maintenant</a><br>
            <span>Rejoindre Par téléphone  : 310 823 625 87</span><br>
            <span>Code secret : bD79Ts2L</span><br>
            <span>Pour les organisateurs : <a href="#">Options de réunion</a></span>
          </div>
        </footer>
        <hr style="border: 1px solid #ccc; margin-top: 20px;">
      `;

      // Concaténer l'ancien contenu avec le nouveau
      const updatedBody = `${existingBody}${meetingDetailsHtml}`;

      // Insérer le contenu mis à jour dans le body
      Office.context.mailbox.item.body.setAsync(
        updatedBody,
        { coercionType: Office.CoercionType.Html },
        (setResult) => {
          if (setResult.status === Office.AsyncResultStatus.Succeeded) {
            console.log("Détails de la réunion ajoutés avec succès !");
          } else {
            console.error("Erreur lors de l'ajout des détails de la réunion :", setResult.error);
          }

          // Indiquer que l'action est terminée
          event.completed();
        }
      );
    } else {
      console.error("Erreur lors de la lecture du contenu existant :", getResult.error);

      // Indiquer que l'action est terminée même en cas d'erreur
      event.completed();
    }
  });
}


function generateMeetingV2(event: Office.AddinCommands.Event): void {
  const meetingDetailsHtml = `
    <hr style="border: 1px solid #ccc; margin-top: 20px;">
     

    <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5;">
      <strong>Joona By Apitech</strong> <a href="#">Besoin d'aide ?</a><br>
      <a href="https://joona.fr/WormsInvestigateSmoothly">Rejoignez la réunion maintenant</a><br>
      <span>Rejoindre Par telephone : 310 823 625 87</span><br>
      <span>Code secret : bD79Ts2L</span><br>
      <span>Pour les organisateurs : <a href="#">Options de réunion</a></span>
    </div>
 
    <hr style="border: 1px solid #ccc; margin-top: 20px;">
  `;

  Office.context.mailbox.item.body.getAsync(Office.CoercionType.Html, (result) => {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      const currentBody = result.value || ""; // Récupérer le contenu actuel ou une chaîne vide s'il n'y a rien

      const updatedBody = currentBody + meetingDetailsHtml;

      Office.context.mailbox.item.body.setAsync(
        updatedBody,
        { coercionType: Office.CoercionType.Html },
        (setResult) => {
          if (setResult.status === Office.AsyncResultStatus.Succeeded) {
            console.log("Détails de la réunion ajoutés avec succès !");
          } else {
            console.error("Erreur lors de l'ajout des détails de la réunion :", setResult.error);
          }
        }
      );
    } else {
      console.error("Erreur lors de la récupération du contenu actuel :", result.error);
    }
  });

  // Action terminée
  event.completed();
}

// Associer la commande à votre bouton dans l'add-in
Office.actions.associate("generateMeeting", generateMeeting);

Office.actions.associate("insertHelloWorld", insertHelloWorld);
