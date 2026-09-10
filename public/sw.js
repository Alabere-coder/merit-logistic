
self.addEventListener("push", (event) => {
  let data = {
    title: "Integrity Media",
    body: "You have a new notification.",
    url: "/",
  };

  if (event.data) {
    try {
      data = {
        ...data,
        ...event.data.json(),
      };
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title,
      {
        body: data.body,

        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",

        data: {
          url: data.url || "/",
          notificationId:
            data.notificationId || null,
          shipmentId:
            data.shipmentId || null,
          paymentId:
            data.paymentId || null,
          supportTicketId:
            data.supportTicketId || null,
        },
      },
    ),
  );
});


/* =========================================================
   NOTIFICATION CLICK
========================================================= */

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const url =
      event.notification.data?.url || "/";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {
          /*
           * If your website is already open,
           * navigate that tab to the notification URL
           * and focus it.
           */

          for (const client of clientList) {
            if ("focus" in client) {
              client.navigate(url);
              return client.focus();
            }
          }

          /*
           * If the website isn't open, open the
           * notification URL in a new browser tab.
           */

          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        }),
    );
  },
);
