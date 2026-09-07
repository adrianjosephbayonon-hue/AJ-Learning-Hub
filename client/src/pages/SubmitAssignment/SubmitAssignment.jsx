import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import "./SubmitAssignment.css";

function SubmitAssignment() {
  const [selectedFile, setSelectedFile] = useState(null);

  function handleFileChange(event) {
    setSelectedFile(event.target.files[0]);
  }

  return (
    <DashboardLayout>
      <div className="submit-container">

        <h1>Submit Assignment</h1>

        <p>Upload your assignment before the deadline.</p>

        <input
          type="file"
          onChange={handleFileChange}
        />

        {selectedFile && (
          <div className="file-preview">
            <h3>Selected File</h3>

            <p>{selectedFile.name}</p>

            <p>
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        <button className="submit-btn">
          Submit Assignment
        </button>

      </div>
    </DashboardLayout>
  );
}

export default SubmitAssignment;