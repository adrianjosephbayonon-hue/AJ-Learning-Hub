import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import "./UploadModule.css";

function UploadModule() {
  const [moduleData, setModuleData] = useState({
    title: "",
    course: "",
    description: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);

  function handleChange(e) {
    setModuleData({
      ...moduleData,
      [e.target.name]: e.target.value,
    });
  }

  function handleFileChange(e) {
    setSelectedFile(e.target.files[0]);
  }

  function handleSubmit(e) {
    e.preventDefault();

    console.log(moduleData);
    console.log(selectedFile);

    alert("Module ready to upload!");
  }

  return (
    <DashboardLayout>
      <div className="upload-module">

        <h1>Upload Learning Module</h1>

        <form onSubmit={handleSubmit}>

          <label>Module Title</label>

          <input
            type="text"
            name="title"
            value={moduleData.title}
            onChange={handleChange}
          />

          <label>Course</label>

          <input
            type="text"
            name="course"
            value={moduleData.course}
            onChange={handleChange}
          />

          <label>Description</label>

          <textarea
            rows="5"
            name="description"
            value={moduleData.description}
            onChange={handleChange}
          />

          <label>Select File</label>

          <input
            type="file"
            onChange={handleFileChange}
          />

          {selectedFile && (
            <div className="selected-file">
              <p><strong>File:</strong> {selectedFile.name}</p>
              <p>
                <strong>Size:</strong>{" "}
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          <button>
            Upload Module
          </button>

        </form>

      </div>
    </DashboardLayout>
  );
}

export default UploadModule;