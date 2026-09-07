import NotificationCard from "../../components/NotificationCard/NotificationCard";
import "./Notifications.css";

function Notifications() {
  const notifications = [
    {
      id: 1,
      title: "New Assignment",
      description:
        "Programming Languages Assignment 2 has been posted.",
      time: "5 minutes ago",
    },

    {
      id: 2,
      title: "Grade Released",
      description:
        "Your Automata Theory and Formal Languages grade has been posted.",
      time: "1 hour ago",
    },

    {
      id: 3,
      title: "Announcement",
      description:
        "There will be no classes on Friday.",
      time: "Yesterday",
    },
  ];

  return (
    <div>
      <h1>Notifications</h1>

      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          title={notification.title}
          description={notification.description}
          time={notification.time}
        />
      ))}
    </div>
  );
}

export default Notifications;