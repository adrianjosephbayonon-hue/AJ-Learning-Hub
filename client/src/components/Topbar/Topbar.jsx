import "./Topbar.css";

function Topbar() {
  return (

    <header className="topbar">

      <div className="topbar-left">

        <input
          type="text"
          placeholder="Search..."
        />

      </div>

      <div className="topbar-right">

        <button className="notification">

          🔔

        </button>

        <div className="user">

          <div className="avatar">
            A
          </div>

          <div>

            <h4>Adrian Joseph</h4>

            <small>Student</small>

          </div>

        </div>

      </div>

    </header>

  );
}

export default Topbar;