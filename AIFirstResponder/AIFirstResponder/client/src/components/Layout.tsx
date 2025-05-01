import React from "react";
import { Shield } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import Chatbot from "@/components/Chatbot";

type LanguageOption = {
  value: string;
  label: string;
};

const languages: LanguageOption[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "zh", label: "中文" },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = React.useState<string>("en");

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-card shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">AI First Responder</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={language}
                onChange={handleLanguageChange}
                className="appearance-none bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 pr-8 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            <button
              onClick={toggleTheme}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            >
              {theme === "dark" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6 max-w-4xl">
        {children}
      </main>

      {/* Chatbot */}
      <Chatbot />

      {/* Footer */}
      <footer className="bg-card shadow-inner mt-8 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} AI First Responder •{" "}
                <a href="#" className="text-secondary hover:underline">
                  Privacy Policy
                </a>{" "}
                •{" "}
                <a href="#" className="text-secondary hover:underline">
                  Terms of Use
                </a>
              </p>
            </div>
            <div className="text-sm text-muted-foreground text-center md:text-right">
              <p className="mb-1">
                IMPORTANT: This application provides first aid guidance only.
              </p>
              <p>
                It is not a substitute for professional medical advice, diagnosis, or
                treatment.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
