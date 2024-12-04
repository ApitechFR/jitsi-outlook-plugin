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
  Office.context.mailbox.item.body.setAsync(
      "Hello World",
      { coercionType: Office.CoercionType.Text },
      (result) => {
          if (result.status === Office.AsyncResultStatus.Succeeded) {
              console.log("Texte ajouté avec succès !");
          } else {
              console.error("Erreur lors de l'ajout du texte : ", result.error);
          }
      }
  );

  //l'action est terminée
  event.completed();
}

Office.actions.associate("insertHelloWorld", insertHelloWorld);

