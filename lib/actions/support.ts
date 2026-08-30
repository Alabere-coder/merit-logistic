"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/actions/notifications";

/* =========================================================
   TYPES
========================================================= */

export type SupportTicketStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";

export type SupportTicketPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export type SupportAdmin = {
  id: string;
  name: string;
};

/* =========================================================
   CREATE SUPPORT TICKET
   Customer / Driver / Admin
========================================================= */

export async function createSupportTicket(input: {
  subject: string;
  category: string;
  priority?: SupportTicketPriority;
  shipmentId?: string | null;
  message: string;
}) {
  const { user } = await requireRole([
    "customer",
    "driver",
    "admin",
  ]);

  const supabase = await createClient();

  const subject = input.subject.trim();
  const category = input.category.trim();
  const message = input.message.trim();

  if (!subject) {
    return {
      error: "Please enter a subject.",
    };
  }

  if (!category) {
    return {
      error: "Please select a category.",
    };
  }

  if (!message) {
    return {
      error: "Please enter your message.",
    };
  }

  if (subject.length > 150) {
    return {
      error: "Subject must be 150 characters or less.",
    };
  }

  if (message.length > 5000) {
    return {
      error: "Message must be 5000 characters or less.",
    };
  }

  /* -------------------------------------------------------
     Create ticket
  ------------------------------------------------------- */

  const ticketNumber = `SUP-${Date.now()
    .toString(36)
    .toUpperCase()}`;

  const { data: ticket, error: ticketError } =
    await supabase
      .from("support_tickets")
      .insert({
        ticket_number: ticketNumber,
        user_id: user.id,
        shipment_id: input.shipmentId ?? null,
        subject,
        category,
        priority: input.priority ?? "medium",
        status: "open",
      })
      .select(
        `
          id,
          ticket_number,
          user_id,
          shipment_id,
          subject,
          category,
          priority,
          status,
          assigned_to,
          created_at,
          updated_at,
          resolved_at
        `,
      )
      .single();

  if (ticketError || !ticket) {
    console.error(
      "CREATE SUPPORT TICKET ERROR:",
      ticketError,
    );

    return {
      error:
        ticketError?.message ??
        "Unable to create support ticket.",
    };
  }

  /* -------------------------------------------------------
     Create first message
  ------------------------------------------------------- */

  const { error: messageError } = await supabase
    .from("support_messages")
    .insert({
      ticket_id: ticket.id,
      sender_id: user.id,
      message,
    });

  if (messageError) {
    console.error(
      "CREATE SUPPORT MESSAGE ERROR:",
      messageError,
    );

    return {
      success: true,
      ticket,
      warning:
        "Ticket was created, but the initial message could not be saved.",
    };
  }

  /* -------------------------------------------------------
     Notify admins that a new support ticket was created
  ------------------------------------------------------- */

  const { data: admins } = await supabase
    .from("users")
    .select("id")
    .eq("role", "admin")
    .eq("is_active", true);

  if (admins && admins.length > 0) {
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          title: "New support ticket",
          message: `${ticket.ticket_number}: ${ticket.subject}`,
          type: "support_ticket",
        }),
      ),
    );
  }

  revalidatePath("/customer/support");
  revalidatePath("/driver/support");
  revalidatePath("/admin/support");

  return {
    success: true,
    ticket,
  };
}

/* =========================================================
   CREATE SUPPORT MESSAGE
   Customer / Driver / Admin
========================================================= */

export async function createSupportMessage(input: {
  ticketId: string;
  message: string;
}) {
  const { user } = await requireRole([
    "customer",
    "driver",
    "admin",
  ]);

  const supabase = await createClient();

  const ticketId = input.ticketId?.trim();
  const message = input.message?.trim();

  if (!ticketId) {
    return {
      error: "Invalid support ticket.",
    };
  }

  if (!message) {
    return {
      error: "Please enter a message.",
    };
  }

  if (message.length > 5000) {
    return {
      error: "Message must be 5000 characters or less.",
    };
  }

  /* -------------------------------------------------------
     Verify ticket exists and is accessible through RLS
  ------------------------------------------------------- */

  const { data: ticket, error: ticketError } =
    await supabase
      .from("support_tickets")
      .select(
        "id, user_id, ticket_number, subject, status",
      )
      .eq("id", ticketId)
      .single();

  if (ticketError || !ticket) {
    console.error(
      "SUPPORT TICKET LOOKUP ERROR:",
      ticketError,
    );

    return {
      error: "Support ticket not found.",
    };
  }

  if (ticket.status === "closed") {
    return {
      error: "This support ticket is closed.",
    };
  }

  /* -------------------------------------------------------
     Insert message
  ------------------------------------------------------- */

  const { data, error } = await supabase
    .from("support_messages")
    .insert({
      ticket_id: ticketId,
      sender_id: user.id,
      message,
    })
    .select(
      `
        id,
        ticket_id,
        sender_id,
        message,
        created_at
      `,
    )
    .single();

  if (error || !data) {
    console.error(
      "CREATE SUPPORT MESSAGE ERROR:",
      error,
    );

    return {
      error:
        error?.message ??
        "Unable to send support message.",
    };
  }

  /* -------------------------------------------------------
     Update ticket timestamp
  ------------------------------------------------------- */

  const { error: updateError } = await supabase
    .from("support_tickets")
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticketId);

  if (updateError) {
    console.error(
      "UPDATE SUPPORT TICKET TIMESTAMP ERROR:",
      updateError,
    );
  }

  /* -------------------------------------------------------
     Notify the other side of the conversation

     If customer/driver sends a message -> notify admins.
     If admin sends a message -> notify ticket owner.
  ------------------------------------------------------- */

  if (user.id !== ticket.user_id) {
    await createNotification({
      userId: ticket.user_id,
      title: "Support replied",
      message: `Support has replied to ticket ${ticket.ticket_number}.`,
      type: "support_reply",
    });
  } else {
    const { data: admins } = await supabase
      .from("users")
      .select("id")
      .eq("role", "admin")
      .eq("is_active", true);

    if (admins && admins.length > 0) {
      await Promise.all(
        admins.map((admin) =>
          createNotification({
            userId: admin.id,
            title: "New support message",
            message: `New message on ticket ${ticket.ticket_number}.`,
            type: "support_message",
          }),
        ),
      );
    }
  }

  revalidatePath("/customer/support");
  revalidatePath("/driver/support");
  revalidatePath("/admin/support");

  revalidatePath(
    `/customer/support/${ticketId}`,
  );
  revalidatePath(
    `/driver/support/${ticketId}`,
  );
  revalidatePath(
    `/admin/support/${ticketId}`,
  );

  return {
    success: true,
    message: data,
  };
}

/* =========================================================
   UPDATE SUPPORT TICKET STATUS
   Admin only
========================================================= */

export async function updateSupportTicketStatus(
  ticketId: string,
  status: string,
) {
  const { user } = await requireRole(["admin"]);

  const supabase = await createClient();

  const allowedStatuses: SupportTicketStatus[] = [
    "open",
    "in_progress",
    "resolved",
    "closed",
  ];

  if (
    !allowedStatuses.includes(
      status as SupportTicketStatus,
    )
  ) {
    return {
      error: "Invalid support ticket status.",
    };
  }

  const nextStatus =
    status as SupportTicketStatus;

  const now = new Date().toISOString();

  const updateData: {
    status: SupportTicketStatus;
    updated_at: string;
    resolved_at?: string | null;
  } = {
    status: nextStatus,
    updated_at: now,
  };

  if (
    nextStatus === "resolved" ||
    nextStatus === "closed"
  ) {
    updateData.resolved_at = now;
  } else {
    updateData.resolved_at = null;
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .update(updateData)
    .eq("id", ticketId)
    .select(
      `
        id,
        ticket_number,
        user_id,
        status,
        priority,
        assigned_to,
        updated_at,
        resolved_at
      `,
    )
    .single();

  if (error || !data) {
    console.error(
      "UPDATE SUPPORT TICKET STATUS ERROR:",
      {
        ticketId,
        status,
        userId: user.id,
        error,
      },
    );

    return {
      error:
        error?.message ??
        "Unable to update ticket status.",
    };
  }

  /* Notify ticket owner */

  await createNotification({
    userId: data.user_id,
    title: "Support ticket updated",
    message: `Your ticket ${data.ticket_number} is now ${nextStatus.replace(
      "_",
      " ",
    )}.`,
    type: "support_status",
  });

  revalidatePath("/admin/support");
  revalidatePath(
    `/admin/support/${ticketId}`,
  );

  revalidatePath("/customer/support");
  revalidatePath("/driver/support");

  revalidatePath(
    `/customer/support/${ticketId}`,
  );
  revalidatePath(
    `/driver/support/${ticketId}`,
  );

  return {
    success: true,
    ticket: data,
  };
}

/* =========================================================
   UPDATE SUPPORT TICKET PRIORITY
   Admin only
========================================================= */

export async function updateSupportTicketPriority(
  ticketId: string,
  priority: string,
) {
  const { user } = await requireRole(["admin"]);

  const supabase = await createClient();

  const allowedPriorities: SupportTicketPriority[] = [
    "low",
    "medium",
    "high",
    "urgent",
  ];

  if (
    !allowedPriorities.includes(
      priority as SupportTicketPriority,
    )
  ) {
    return {
      error: "Invalid support ticket priority.",
    };
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .update({
      priority:
        priority as SupportTicketPriority,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticketId)
    .select(
      `
        id,
        ticket_number,
        user_id,
        status,
        priority,
        assigned_to,
        updated_at,
        resolved_at
      `,
    )
    .single();

  if (error || !data) {
    console.error(
      "UPDATE SUPPORT TICKET PRIORITY ERROR:",
      {
        ticketId,
        priority,
        userId: user.id,
        error,
      },
    );

    return {
      error:
        error?.message ??
        "Unable to update ticket priority.",
    };
  }

  await createNotification({
    userId: data.user_id,
    title: "Support ticket priority updated",
    message: `Ticket ${data.ticket_number} priority is now ${priority}.`,
    type: "support_priority",
  });

  revalidatePath("/admin/support");
  revalidatePath(
    `/admin/support/${ticketId}`,
  );

  revalidatePath("/customer/support");
  revalidatePath("/driver/support");

  return {
    success: true,
    ticket: data,
  };
}

/* =========================================================
   ASSIGN SUPPORT TICKET
   Admin only
========================================================= */

export async function assignSupportTicket(
  ticketId: string,
  adminId: string | null,
) {
  const { user } = await requireRole(["admin"]);

  const supabase = await createClient();

  if (!ticketId) {
    return {
      error: "Invalid support ticket.",
    };
  }

  /* -------------------------------------------------------
     Verify selected admin
  ------------------------------------------------------- */

  if (adminId) {
    const {
      data: admin,
      error: adminError,
    } = await supabase
      .from("users")
      .select(
        "id, role, is_active",
      )
      .eq("id", adminId)
      .eq("role", "admin")
      .single();

    if (adminError || !admin) {
      console.error(
        "SUPPORT ADMIN LOOKUP ERROR:",
        adminError,
      );

      return {
        error:
          "Selected user is not a valid admin.",
      };
    }

    if (admin.is_active === false) {
      return {
        error:
          "You cannot assign a ticket to an inactive admin.",
      };
    }
  }

  /* -------------------------------------------------------
     Update assignment
  ------------------------------------------------------- */

  const { data, error } = await supabase
    .from("support_tickets")
    .update({
      assigned_to: adminId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticketId)
    .select(
      `
        id,
        ticket_number,
        user_id,
        status,
        priority,
        assigned_to,
        updated_at,
        resolved_at
      `,
    )
    .single();

  if (error || !data) {
    console.error(
      "ASSIGN SUPPORT TICKET ERROR:",
      {
        ticketId,
        adminId,
        userId: user.id,
        error,
      },
    );

    return {
      error:
        error?.message ??
        "Unable to assign support ticket.",
    };
  }

  /* Notify assigned admin */

  if (adminId && adminId !== user.id) {
    await createNotification({
      userId: adminId,
      title: "Support ticket assigned",
      message: `Ticket ${data.ticket_number} has been assigned to you.`,
      type: "support_assignment",
    });
  }

  revalidatePath("/admin/support");
  revalidatePath(
    `/admin/support/${ticketId}`,
  );

  return {
    success: true,
    ticket: data,
  };
}


/* =========================================================
   UPDATE SUPPORT TICKET
   Admin only

   Updates:
   - status
   - priority
   - assignee

   Sends notifications only when a value actually changes.
========================================================= */

export async function updateSupportTicket(input: {
  ticketId: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  assignedTo: string | null;
}) {
  const { user } = await requireRole(["admin"]);
  const supabase = await createClient();

  const {
    ticketId,
    status,
    priority,
    assignedTo,
  } = input;

  if (!ticketId) {
    return {
      error: "Invalid support ticket.",
    };
  }

  /* -------------------------------------------------------
     Validate status
  ------------------------------------------------------- */

  const allowedStatuses: SupportTicketStatus[] = [
    "open",
    "in_progress",
    "resolved",
    "closed",
  ];

  if (!allowedStatuses.includes(status)) {
    return {
      error: "Invalid support ticket status.",
    };
  }

  /* -------------------------------------------------------
     Validate priority
  ------------------------------------------------------- */

  const allowedPriorities: SupportTicketPriority[] = [
    "low",
    "medium",
    "high",
    "urgent",
  ];

  if (!allowedPriorities.includes(priority)) {
    return {
      error: "Invalid support ticket priority.",
    };
  }

  /* -------------------------------------------------------
     Get current ticket

     We need the existing values so we can:
     - detect what actually changed
     - notify the correct people
  ------------------------------------------------------- */

  const {
    data: currentTicket,
    error: currentTicketError,
  } = await supabase
    .from("support_tickets")
    .select(
      `
        id,
        ticket_number,
        user_id,
        status,
        priority,
        assigned_to
      `,
    )
    .eq("id", ticketId)
    .single();

  if (currentTicketError || !currentTicket) {
    console.error(
      "GET SUPPORT TICKET BEFORE UPDATE ERROR:",
      currentTicketError,
    );

    return {
      error: "Support ticket not found.",
    };
  }

  /* -------------------------------------------------------
     Prevent changes to a closed ticket

     The admin can still reopen a closed ticket by changing
     the status to open/in_progress/resolved.
  ------------------------------------------------------- */

  const statusChanged =
    currentTicket.status !== status;

  const priorityChanged =
    currentTicket.priority !== priority;

  const assignmentChanged =
    currentTicket.assigned_to !== assignedTo;

  /* -------------------------------------------------------
     Nothing changed
  ------------------------------------------------------- */

  if (
    !statusChanged &&
    !priorityChanged &&
    !assignmentChanged
  ) {
    return {
      success: true,
      ticket: currentTicket,
      unchanged: true,
    };
  }

  /* -------------------------------------------------------
     Verify assignee
  ------------------------------------------------------- */

  if (assignedTo) {
    const {
      data: admin,
      error: adminError,
    } = await supabase
      .from("users")
      .select(
        "id, role, is_active",
      )
      .eq("id", assignedTo)
      .eq("role", "admin")
      .single();

    if (adminError || !admin) {
      console.error(
        "SUPPORT ADMIN LOOKUP ERROR:",
        adminError,
      );

      return {
        error:
          "Selected user is not a valid admin.",
      };
    }

    if (admin.is_active === false) {
      return {
        error:
          "You cannot assign a ticket to an inactive admin.",
      };
    }
  }

  /* -------------------------------------------------------
     Resolve timestamp

     resolved_at is set when the ticket becomes:
     - resolved
     - closed

     If the ticket is reopened, resolved_at is cleared.
  ------------------------------------------------------- */

  const now = new Date().toISOString();

  const updateData = {
    status,
    priority,
    assigned_to: assignedTo,
    updated_at: now,
    resolved_at:
      status === "resolved" ||
      status === "closed"
        ? now
        : null,
  };

  /* -------------------------------------------------------
     Update ticket
  ------------------------------------------------------- */

  const {
    data: updatedTicket,
    error: updateError,
  } = await supabase
    .from("support_tickets")
    .update(updateData)
    .eq("id", ticketId)
    .select(
      `
        id,
        ticket_number,
        user_id,
        status,
        priority,
        assigned_to,
        updated_at,
        resolved_at
      `,
    )
    .single();

  if (updateError || !updatedTicket) {
    console.error(
      "UPDATE SUPPORT TICKET ERROR:",
      {
        ticketId,
        status,
        priority,
        assignedTo,
        userId: user.id,
        error: updateError,
      },
    );

    return {
      error:
        updateError?.message ??
        "Unable to update support ticket.",
    };
  }

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const notificationPromises: Promise<unknown>[] = [];

  /* -------------------------------------------------------
     1. Assignment changed
     Notify the newly assigned admin.

     We do not notify when:
     - ticket is unassigned
     - admin assigns the ticket to themselves
     - assignment did not change
  ------------------------------------------------------- */

  if (
    assignmentChanged &&
    assignedTo &&
    assignedTo !== user.id
  ) {
    notificationPromises.push(
      createNotification({
        userId: assignedTo,
        title: "Support ticket assigned",
        message: `Ticket ${updatedTicket.ticket_number} has been assigned to you.`,
        type: "support_assignment",
      }),
    );
  }

  /* -------------------------------------------------------
     2. Status changed
     Notify ticket owner.

     This covers customers and drivers because both can
     create support tickets.
  ------------------------------------------------------- */

  if (statusChanged) {
    const statusLabel = status.replace(
      /_/g,
      " ",
    );

    notificationPromises.push(
      createNotification({
        userId: updatedTicket.user_id,
        title: "Support ticket status updated",
        message: `Your ticket ${updatedTicket.ticket_number} is now ${statusLabel}.`,
        type: "support_status",
      }),
    );
  }

  /* -------------------------------------------------------
     3. Priority changed
     Notify ticket owner.
  ------------------------------------------------------- */

  if (priorityChanged) {
    notificationPromises.push(
      createNotification({
        userId: updatedTicket.user_id,
        title: "Support ticket priority updated",
        message: `Ticket ${updatedTicket.ticket_number} priority is now ${priority}.`,
        type: "support_priority",
      }),
    );
  }

  /* -------------------------------------------------------
     Execute notifications without allowing a notification
     failure to make the ticket update fail.
  ------------------------------------------------------- */

  if (notificationPromises.length > 0) {
    const results = await Promise.allSettled(
      notificationPromises,
    );

    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error(
          "SUPPORT TICKET NOTIFICATION ERROR:",
          result.reason,
        );
      }
    });
  }

  /* -------------------------------------------------------
     Revalidate support pages
  ------------------------------------------------------- */

  revalidatePath("/admin/support");
  revalidatePath(
    `/admin/support/${ticketId}`,
  );

  revalidatePath("/customer/support");
  revalidatePath("/driver/support");

  revalidatePath(
    `/customer/support/${ticketId}`,
  );
  revalidatePath(
    `/driver/support/${ticketId}`,
  );

  revalidatePath("/admin/notifications");
  revalidatePath("/customer/notifications");
  revalidatePath("/driver/notifications");

  return {
    success: true,
    ticket: updatedTicket,
  };
}

/* =========================================================
GET MY SUPPORT TICKETS
Customer / Driver
========================================================= */

export async function getMySupportTickets() {
const { user } = await requireRole(["customer", "driver"]);

const supabase = await createClient();

const { data, error } = await supabase
.from("support_tickets")
.select(
`         id,
        ticket_number,
        user_id,
        shipment_id,
        subject,
        category,
        priority,
        status,
        assigned_to,
        created_at,
        updated_at,
        resolved_at
      `,
)
.eq("user_id", user.id)
.order("updated_at", {
ascending: false,
});

if (error) {
console.error("GET MY SUPPORT TICKETS ERROR:", error);


return {
  success: false,
  tickets: [],
  error: error.message,
};


}

return {
success: true,
tickets: data ?? [],
};
}




/* =========================================================
   GET SUPPORT TICKET
   Customer / Driver / Admin
========================================================= */

export async function getSupportTicket(
ticketId: string,
) {
await requireRole([
"customer",
"driver",
"admin",
]);

if (!ticketId || typeof ticketId !== "string") {
return {
error: "Invalid support ticket ID.",
};
}

const supabase = await createClient();


  const {
    data: ticket,
    error,
  } = await supabase
    .from("support_tickets")
    .select(
      `
        id,
        ticket_number,
        user_id,
        shipment_id,
        subject,
        category,
        priority,
        status,
        assigned_to,
        created_at,
        updated_at,
        resolved_at
      `,
    )
    .eq("id", ticketId)
    .single();

  if (error || !ticket) {
    console.error(
      "GET SUPPORT TICKET ERROR:",
      error,
    );

    return {
      error: "Support ticket not found.",
    };
  }

  const {
    data: messages,
    error: messagesError,
  } = await supabase
    .from("support_messages")
    .select(
      `
        id,
        ticket_id,
        sender_id,
        message,
        created_at
      `,
    )
    .eq("ticket_id", ticketId)
    .order("created_at", {
      ascending: true,
    });

  if (messagesError) {
    console.error(
      "GET SUPPORT MESSAGES ERROR:",
      messagesError,
    );

    return {
      error: messagesError.message,
    };
  }

  return {
    success: true,
    ticket,
    messages: messages ?? [],
  };
}

/* =========================================================
   GET ADMIN SUPPORT TICKETS
   Admin only
========================================================= */

export async function getAdminSupportTickets() {
  await requireRole(["admin"]);

  const supabase = await createClient();

  const {
    data: tickets,
    error,
  } = await supabase
    .from("support_tickets")
    .select(
      `
        id,
        ticket_number,
        user_id,
        shipment_id,
        subject,
        category,
        priority,
        status,
        assigned_to,
        created_at,
        updated_at,
        resolved_at
      `,
    )
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "GET ADMIN SUPPORT TICKETS ERROR:",
      error,
    );

    return {
      error: error.message,
      tickets: [],
    };
  }

  return {
    success: true,
    tickets: tickets ?? [],
  };
}

/* =========================================================
   GET ACTIVE ADMINS
   Used by SupportTicketActions
========================================================= */

export async function getSupportAdmins(): Promise<{
  success: true;
  admins: SupportAdmin[];
} | {
  success: false;
  admins: SupportAdmin[];
  error: string;
}> {
  await requireRole(["admin"]);

  const supabase = await createClient();

  const {
    data: admins,
    error,
  } = await supabase
    .from("users")
    .select(
      `
        id,
        first_name,
        last_name,
        email
      `,
    )
    .eq("role", "admin")
    .eq("is_active", true)
    .order("first_name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "GET SUPPORT ADMINS ERROR:",
      error,
    );

    return {
      success: false,
      admins: [],
      error: error.message,
    };
  }

  return {
    success: true,
    admins: (admins ?? []).map(
      (admin): SupportAdmin => ({
        id: admin.id,
        name:
          `${admin.first_name ?? ""} ${
            admin.last_name ?? ""
          }`.trim() ||
          admin.email ||
          "Admin",
      }),
    ),
  };
}

/* =========================================================
   REPLY TO SUPPORT TICKET
   Admin only
========================================================= */

export async function replyToSupportTicket(
  formData: FormData,
) {
  const { supabase, user } =
    await requireRole(["admin"]);

  const ticketId = formData.get("ticketId");
  const message = formData.get("message");

  if (typeof ticketId !== "string") {
    return {
      error: "Invalid ticket ID.",
    };
  }

  if (typeof message !== "string") {
    return {
      error: "Invalid message.",
    };
  }

  const cleanMessage = message.trim();

  if (!cleanMessage) {
    return {
      error: "Please enter a message.",
    };
  }

  if (cleanMessage.length > 5000) {
    return {
      error:
        "Message must be 5000 characters or less.",
    };
  }

  /* -------------------------------------------------------
     Get ticket
  ------------------------------------------------------- */

  const {
    data: ticket,
    error: ticketError,
  } = await supabase
    .from("support_tickets")
    .select(
      `
        id,
        user_id,
        ticket_number,
        status
      `,
    )
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticket) {
    console.error(
      "SUPPORT TICKET LOOKUP ERROR:",
      ticketError,
    );

    return {
      error: "Support ticket not found.",
    };
  }

  if (ticket.status === "closed") {
    return {
      error: "This ticket is already closed.",
    };
  }

  /* -------------------------------------------------------
     Insert reply
  ------------------------------------------------------- */

  const {
    error: messageError,
  } = await supabase
    .from("support_messages")
    .insert({
      ticket_id: ticket.id,
      sender_id: user.id,
      message: cleanMessage,
    });

  if (messageError) {
    console.error(
      "SUPPORT REPLY ERROR:",
      messageError,
    );

    return {
      error: messageError.message,
    };
  }

  /* -------------------------------------------------------
     Automatically move open ticket to in-progress
  ------------------------------------------------------- */

  if (ticket.status === "open") {
    await supabase
      .from("support_tickets")
      .update({
        status: "in_progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticket.id);
  } else {
    await supabase
      .from("support_tickets")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticket.id);
  }

  /* -------------------------------------------------------
     Notify ticket owner
  ------------------------------------------------------- */

  const notification =
    await createNotification({
      userId: ticket.user_id,
      title: "Support replied",
      message: `Support has replied to ticket ${ticket.ticket_number}.`,
      type: "support_reply",
    });

  if (notification.error) {
    console.error(
      "SUPPORT REPLY NOTIFICATION ERROR:",
      notification.error,
    );
  }

  revalidatePath(
    `/admin/support/${ticket.id}`,
  );

  revalidatePath("/admin/support");

  revalidatePath("/customer/support");

  revalidatePath("/driver/support");

  revalidatePath(
    `/customer/support/${ticket.id}`,
  );

  revalidatePath(
    `/driver/support/${ticket.id}`,
  );

  return {
    success: true,
  };
}
