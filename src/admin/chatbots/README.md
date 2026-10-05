# Client Admin Chatbot List

`/app/chatbots` renders inside `ClientAdminPanel`, sharing its existing header,
sidebar, fonts and scroll container. The AI Agents navigation entry opens this
list; Create Chatbot links to the existing `/app/chatbots/new` route.

- `ChatbotList.jsx`: page header, filters, action feedback and responsive grid.
- `ChatbotCard.jsx`: reusable display component with accessible status switch and action menu.
- `useChatbots.js`: async loading and mutations, pending states, errors and retry.
- `chatbotService.js`: mock data adapter; replace its methods with API calls.
- `mockChatbots.js`: seed records, separate from rendering and interactions.

The mock service retains changes during navigation, and resets on a full page
reload. Duplicate copies the chatbot configuration with a new ID, an inactive
status and zero conversations. Delete offers Undo.

The service contract is `list()`, `setStatus(id, status)`, `duplicate(id)`,
`remove(id)` and `restore(deletedRecord)`, all returning promises. `list()`
returns records with `id`, `name`, `description`, `status` (`active` or
`inactive`), `channels` (`website` and/or `whatsapp`),
`conversationsThisMonth` and ISO `lastEditedAt`. `remove()` returns
`{ chatbot, index }` for Undo. A future API should provide an equivalent
restoration operation if Undo is retained. `ChatbotList` also accepts a
`service` prop for supplying another adapter without changing its UI.
