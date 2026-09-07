import { useState } from "react";

function Messages() {
  const [selectedMessage, setSelectedMessage] = useState(null);

  const messages = [
    {
      id: 1,
      sender: "Prof. Adrian",
      subject: "Programming Languages",
      message:
        "Please review the materials for Programming Languages before the next class.",
      date: "August 8, 2026",
      unread: true,
    },
    {
      id: 2,
      sender: "Prof. Adrian",
      subject: "Assignment Reminder",
      message:
        "Please remember to submit your assignment before the deadline.",
      date: "August 7, 2026",
      unread: false,
    },
    {
      id: 3,
      sender: "Prof. Lee",
      subject: "Mobile Programming",
      message:
        "The new learning materials for Mobile Programming are now available.",
      date: "August 6, 2026",
      unread: false,
    },
  ];

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
  };

  const closeMessage = () => {
    setSelectedMessage(null);
  };

  return (
    <div className="space-y-6">

      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold">
          Messages 💬
        </h1>

        <p className="text-gray-500 mt-2">
          View messages and announcements from your instructors.
        </p>
      </div>

      {/* Messages Container */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        {/* Messages Header */}

        <div className="p-5 border-b flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold">
              Inbox
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {messages.length} messages
            </p>
          </div>

          <button
            onClick={() => setSelectedMessage(null)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Inbox
          </button>

        </div>

        {/* Message List */}

        {messages.length === 0 ? (
          <div className="p-10 text-center">

            <div className="text-5xl mb-4">
              📭
            </div>

            <h2 className="text-xl font-bold">
              No messages
            </h2>

            <p className="text-gray-500 mt-2">
              Your messages will appear here.
            </p>

          </div>
        ) : (
          <div>

            {messages.map((message) => (
              <button
                key={message.id}
                onClick={() =>
                  handleMessageClick(message)
                }
                className="w-full text-left p-5 border-b hover:bg-gray-50 transition"
              >

                <div className="flex items-start justify-between gap-4">

                  <div className="flex items-start gap-4">

                    {/* Avatar */}

                    <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                      {message.sender
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    {/* Message Info */}

                    <div>

                      <div className="flex items-center gap-2">

                        <h3
                          className={`font-semibold ${
                            message.unread
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {message.sender}
                        </h3>

                        {message.unread && (
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                        )}

                      </div>

                      <p className="font-medium text-gray-800 mt-1">
                        {message.subject}
                      </p>

                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {message.message}
                      </p>

                    </div>

                  </div>

                  {/* Date */}

                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {message.date}
                  </span>

                </div>

              </button>
            ))}

          </div>
        )}

      </div>

      {/* Selected Message */}

      {selectedMessage && (
        <div className="bg-white rounded-xl shadow p-6">

          {/* Message Header */}

          <div className="flex items-start justify-between border-b pb-5">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {selectedMessage.sender
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>

                <h2 className="text-xl font-bold">
                  {selectedMessage.subject}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  From: {selectedMessage.sender}
                </p>

              </div>

            </div>

            <button
              onClick={closeMessage}
              className="text-gray-500 hover:text-gray-900 text-xl"
            >
              ×
            </button>

          </div>

          {/* Message Content */}

          <div className="py-6">

            <p className="text-gray-700 leading-relaxed">
              {selectedMessage.message}
            </p>

          </div>

          {/* Message Date */}

          <div className="border-t pt-4">

            <p className="text-sm text-gray-500">
              Received: {selectedMessage.date}
            </p>

          </div>

        </div>
      )}

    </div>
  );
}

export default Messages;