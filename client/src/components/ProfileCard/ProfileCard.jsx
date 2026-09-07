import "./ProfileCard.css";

function ProfileCard({ user }) {
  return (
    <div className="profile-card">

      <div className="profile-avatar">
        {user.name.charAt(0)}
      </div>

      <h2>{user.name}</h2>

      <p>{user.email}</p>

      <div className="profile-info">

        <div>
          <strong>Role</strong>
          <p>{user.role}</p>
        </div>

        <div>
          <strong>Department</strong>
          <p>{user.department}</p>
        </div>

        <div>
          <strong>Student ID</strong>
          <p>{user.idNumber}</p>
        </div>

      </div>

      <button>Edit Profile</button>

    </div>
  );
}

export default ProfileCard;