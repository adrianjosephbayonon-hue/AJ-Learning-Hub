const pool = require("../config/db");

// ============================
// GET USER SETTINGS
// ============================

const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        notifications,
        email_notifications,
        dark_mode,
        profile_visibility,
        activity_status
      FROM user_settings
      WHERE user_id = $1
      `,
      [userId]
    );

    // If settings don't exist yet, create default settings
    if (result.rows.length === 0) {
      const newSettings = await pool.query(
        `
        INSERT INTO user_settings (
          user_id,
          notifications,
          email_notifications,
          dark_mode,
          profile_visibility,
          activity_status
        )
        VALUES ($1, TRUE, TRUE, FALSE, TRUE, TRUE)
        RETURNING
          notifications,
          email_notifications,
          dark_mode,
          profile_visibility,
          activity_status
        `,
        [userId]
      );

      return res.json(newSettings.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get settings error:", error);

    res.status(500).json({
      message: "Failed to load settings.",
    });
  }
};

// ============================
// UPDATE USER SETTINGS
// ============================

const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      notifications,
      emailNotifications,
      darkMode,
      profileVisibility,
      activityStatus,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO user_settings (
        user_id,
        notifications,
        email_notifications,
        dark_mode,
        profile_visibility,
        activity_status
      )
      VALUES ($1, $2, $3, $4, $5, $6)

      ON CONFLICT (user_id)
      DO UPDATE SET
        notifications = EXCLUDED.notifications,
        email_notifications = EXCLUDED.email_notifications,
        dark_mode = EXCLUDED.dark_mode,
        profile_visibility = EXCLUDED.profile_visibility,
        activity_status = EXCLUDED.activity_status

      RETURNING
        notifications,
        email_notifications,
        dark_mode,
        profile_visibility,
        activity_status
      `,
      [
        userId,
        notifications,
        emailNotifications,
        darkMode,
        profileVisibility,
        activityStatus,
      ]
    );

    res.json({
      message: "Settings updated successfully.",
      settings: result.rows[0],
    });
  } catch (error) {
    console.error("Update settings error:", error);

    res.status(500).json({
      message: "Failed to update settings.",
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};