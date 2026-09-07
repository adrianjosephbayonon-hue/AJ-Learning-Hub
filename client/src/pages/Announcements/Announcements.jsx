import AnnouncementCard from "../../components/AnnouncementCard/AnnouncementCard";
import { Link } from "react-router-dom";
import "./Announcements.css";

function Announcements() {
  const announcements = [
    {
      id: 1,
      title: "Welcome to AJ Learning Hub",
      date: "August 7, 2026",
      content:
        "Welcome everyone! Please check your course materials regularly.",
    },

    {
      id: 2,
      title: "Programming Languages Assignment",
      date: "August 8, 2026",
      content:
        "Assignment 1 has been posted. Deadline is August 15.",
    },
  ];

  return (
    <div>
      <div className="announcement-header">
        <h1>Announcements</h1>

        <Link to="/create-announcement">
          <button>Create Announcement</button>
        </Link>
      </div>

      {announcements.map((item) => (
        <AnnouncementCard
          key={item.id}
          title={item.title}
          date={item.date}
          content={item.content}
        />
      ))}
    </div>
  );
}

export default Announcements;