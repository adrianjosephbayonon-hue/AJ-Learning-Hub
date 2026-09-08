import { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContextDefinition";

function getSavedTheme() {
  const savedSettings = localStorage.getItem("aj_settings");

  if (!savedSettings) {
    return false;
  }

  try {
    const settings = JSON.parse(savedSettings);

    return settings.darkMode ?? false;
  } catch (error) {
    console.error(
      "Unable to load theme settings:",
      error
    );

    return false;
  }
}

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(getSavedTheme);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((currentMode) => {
      const newMode = !currentMode;

      const savedSettings =
        localStorage.getItem("aj_settings");

      let settings = {};

      if (savedSettings) {
        try {
          settings = JSON.parse(savedSettings);
        } catch (error) {
          console.error(
            "Unable to read saved settings:",
            error
          );
        }
      }

      localStorage.setItem(
        "aj_settings",
        JSON.stringify({
          ...settings,
          darkMode: newMode,
        })
      );

      return newMode;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        setDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}