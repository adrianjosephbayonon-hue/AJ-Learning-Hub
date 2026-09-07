import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import "./CreateAnnouncement.css";

function CreateAnnouncement() {

  const [announcement, setAnnouncement] = useState({
    title:"",
    content:"",
  });

  function handleChange(e){
    setAnnouncement({
      ...announcement,
      [e.target.name]:e.target.value
    });
  }

  function handleSubmit(e){
    e.preventDefault();

    console.log(announcement);

    alert("Announcement Posted!");
  }

  return (

    <DashboardLayout>

      <div className="create-announcement">

        <h1>Create Announcement</h1>

        <form onSubmit={handleSubmit}>

          <label>Title</label>

          <input
            type="text"
            name="title"
            value={announcement.title}
            onChange={handleChange}
          />

          <label>Announcement</label>

          <textarea
            rows="8"
            name="content"
            value={announcement.content}
            onChange={handleChange}
          />

          <button>Post Announcement</button>

        </form>

      </div>

    </DashboardLayout>

  );

}

export default CreateAnnouncement;